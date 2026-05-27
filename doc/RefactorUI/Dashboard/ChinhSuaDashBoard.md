# HƯỚNG DẪN HOÀN THIỆN DASHBOARD

> **Mục tiêu:** Sau Phase A-D Tailwind fix, Dashboard đã đẹp hơn nhưng vẫn còn 2 việc dang dở:
> 1. **Widget 2B "Compliance 7 ngày"** chưa build — `ComplianceCard.tsx` thiếu hoàn toàn
> 2. **Layout** hiện tại khác design — cần re-organize grid theo `dashboard_spec.md` §2
>
> **Audience:** Code agent FE.
> **Tổng workload:** ~3-4h. Thời gian thoải mái nên ưu tiên lãm kĩ, cẩn thận
>
> **Reference design source:**
> - `doc\RefactorUI\Dashboard\Dashboard.html` (mockup desktop + mobile)
> - `doc\RefactorUI\Dashboard\dashboard-w2.jsx` (W2Compliance component reference, sample data + 3_BUA / 5_BUA variants)
> - `doc\RefactorUI\Dashboard\dashboard-page.jsx` (layout PageFrame desktop + mobile)
> - `doc\RefactorUI\dashboard_spec_v3.md` §2.2 (Widget 2B spec)

---

## 0. CONTEXT & NGUYÊN TẮC

### 0.1. State hiện tại (verified clone repo `feature/onboarding-dashboard-fe`)

**Đã có:**
- ✅ `ConstitutionCard.tsx` — Widget 1 đầy đủ (glyph SVG + advice + BMI scale)
- ✅ `WeightChartCard.tsx` — Widget 2A weight chart 30 ngày
- ✅ `MetricSummaryGrid.tsx` — Widget 2C 3 metric cards
- ✅ `HealthMetricsDetails.tsx` — Section "Chi tiết chỉ số" collapsible
- ✅ `ReminderList.tsx` — Widget 3 nhắc nhở

**Còn thiếu:**
- ❌ `ComplianceCard.tsx` — Widget 2B "Đã có thực đơn 7 ngày × N bữa"
- ❌ Layout: cần re-organize theo design (xem §3)

**Service layer:**
- `dashboard.service.ts` hiện gọi: `getConstitution()`, `getDashboardMetrics()`, `getWeightHistory(30)`, `getCurrentGoal()`, `getAllPreferences()`
- ❌ Thiếu: `getMealLogHistory(7)` cho Widget 2B

### 0.2. Convention bắt buộc tuân theo

1. **KHÔNG đổi prop interface** của các Widget hiện có — sẽ break `DashboardPage.tsx`
2. **KHÔNG xóa logic service hiện có** — chỉ thêm function mới `getMealLogHistory()`
3. **DÙNG LẠI `DashboardCard.tsx` wrapper** đã có (title typography uppercase + tracking đúng design)
4. **Convert design source kỹ:** Inline style `style={{...}}` từ `dashboard-w2.jsx` → Tailwind classes
5. **KHÔNG hardcode sample data từ design** — bind với real API
6. **Test sau mỗi Phase** — `npm run dev`, screenshot, verify trước khi sang Phase tiếp

### 0.3. BE endpoint đã verify

```
GET /api/meal-log/history?days=7
```

**Response shape (đã verify trong `MealLogHistoryResponse.java`):**

```typescript
interface MealLogHistoryItem {
  id: string;
  mealDate: string;       // ISO yyyy-mm-dd
  mealType: 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';
  planType: string;        // "3_BUA" hoặc "5_BUA"
  goalCode: string;        // "GIAM" | "DUY_TRI" | "TANG"
  mealKcalTarget: number;
  totalKcalActual: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  finalScore: number;
  status: string;          // MealStatus enum
  dishes: Array<{ ... }>;
}
```

**Lưu ý quan trọng:**
- Mỗi response item là **1 BỮA** (vd: sáng thứ 2), KHÔNG phải 1 NGÀY
- Một ngày có thể có 3-5 items (tùy `planType`)
- FE phải **group by `mealDate`** để render thành 7 cột (T2-CN)

---

# PHASE 1 — SERVICE LAYER (~30 phút)

## Fix 1.1 — Tạo `mealLog.service.ts`

**File mới:** `src/services/mealLog.service.ts`

```typescript
import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';

export type MealType = 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';
export type PlanType = '3_BUA' | '5_BUA';

export interface MealLogHistoryItem {
  id: string;
  mealDate: string;          // ISO yyyy-mm-dd
  mealType: MealType;
  planType: PlanType | string;
  goalCode: string;
  mealKcalTarget: number;
  totalKcalActual: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  finalScore: number;
  status: string;
  dishes: unknown[];
}

/**
 * Lấy lịch sử meal log N ngày gần nhất.
 * BE max 30 ngày, default 3. Dashboard dùng days=7.
 */
export const getMealLogHistory = async (days = 7): Promise<MealLogHistoryItem[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryItem[]> | MealLogHistoryItem[]
  >('/api/meal-log/history', { params: { days } });
  return unwrapDataResponse(response.data);
};
```

## Fix 1.2 — Update `dashboard.service.ts`

**Thêm vào đầu file (imports):**

```typescript
import { getMealLogHistory } from './mealLog.service';
import type { MealLogHistoryItem } from './mealLog.service';
```

**Update interface `DashboardOverview`:**

```typescript
export interface DashboardOverview {
  constitution: ConstitutionResponse | null;
  metrics: DashboardMetricsResponse | null;
  weightHistory: HealthHistoryPoint[];
  mealLogHistory: MealLogHistoryItem[];          // ← THÊM
  currentGoal: UserGoalResponse | null;
  preferences: PreferenceResponse[];
  errors: Partial<Record<
    'constitution' | 'metrics' | 'weightHistory' | 'mealLogHistory' | 'currentGoal' | 'preferences',
    string
  >>;
}
```

**Trong function `getDashboardOverview()`, thêm vào `Promise.allSettled` array:**

```typescript
const [
  constitutionResult,
  metricsResult,
  weightHistoryResult,
  mealLogHistoryResult,        // ← THÊM
  currentGoalResult,
  preferencesResult,
] = await Promise.allSettled([
  getConstitution(),
  getDashboardMetrics(),
  getWeightHistory(30),
  getMealLogHistory(7),         // ← THÊM
  getCurrentGoal(),
  getAllPreferences(),
]);
```

**Trong block parse result, thêm:**

```typescript
const mealLogHistory =
  mealLogHistoryResult.status === 'fulfilled' ? mealLogHistoryResult.value : [];

const mealLogHistoryError =
  mealLogHistoryResult.status === 'rejected'
    ? getApiErrorMessage(mealLogHistoryResult.reason, 'Không tải được lịch sử thực đơn')
    : undefined;
```

**Return object thêm field:**

```typescript
return {
  // ... existing fields
  mealLogHistory,
  errors: {
    // ... existing errors
    ...(mealLogHistoryError && { mealLogHistory: mealLogHistoryError }),
  },
};
```

---

# PHASE 2 — BUILD `ComplianceCard.tsx` (~1.5h)

## 2.1. Spec component

**Props:**

```typescript
interface ComplianceCardProps {
  data: MealLogHistoryItem[];      // Đã filter 7 ngày gần nhất
  planType?: '3_BUA' | '5_BUA';    // Mặc định '3_BUA'
  error?: string;
}
```

**Behavior:**
- Empty state: nếu `data.length === 0` → hiển thị empty card với CTA "Tạo thực đơn"
- Group by `mealDate` → 7 ngày (T2 đến CN tuần này)
- Mỗi ngày có **N expected meals** (3 hoặc 5 tùy `planType`)
- Mỗi ô vuông:
  - Có log cho meal đó → `bg-brand-green`
  - Chưa có → `bg-gray-100 border-dashed`
- Header right: hiển thị `X/Y bữa` + percentage
- Progress bar gradient xanh ở top
- Legend ở dưới

## 2.2. Helper functions (đặt trong cùng file)

```typescript
import type { MealLogHistoryItem, MealType, PlanType } from '../../services/mealLog.service';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const MEAL_ORDER_3: MealType[] = ['SANG', 'TRUA', 'TOI'];
const MEAL_ORDER_5: MealType[] = ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];

const MEAL_LABEL: Record<MealType, string> = {
  SANG: 'Sáng',
  PHU_SANG: 'Phụ sáng',
  TRUA: 'Trưa',
  PHU_CHIEU: 'Phụ chiều',
  TOI: 'Tối',
};

/**
 * Lấy 7 ngày gần nhất (Mon → Sun) tính từ hôm nay.
 * Return: array ISO date strings từ thứ 2 đầu tuần đến chủ nhật.
 */
function getWeekDates(today = new Date()): string[] {
  // JS: 0=Sun, 1=Mon ... 6=Sat. Tính offset để lấy thứ 2 đầu tuần.
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date.toISOString().slice(0, 10);
  });
}

/**
 * Group meal logs theo mealDate, return Map<date, Set<mealType>>.
 */
function groupByDate(items: MealLogHistoryItem[]): Map<string, Set<MealType>> {
  const map = new Map<string, Set<MealType>>();
  items.forEach((item) => {
    if (!map.has(item.mealDate)) map.set(item.mealDate, new Set());
    map.get(item.mealDate)!.add(item.mealType as MealType);
  });
  return map;
}

/**
 * Suy ra planType chính của user trong 7 ngày qua (nếu data có).
 * Nếu data trống → return '3_BUA' (default).
 */
function inferPlanType(items: MealLogHistoryItem[]): PlanType {
  const firstWith5 = items.find((i) => i.planType === '5_BUA');
  return firstWith5 ? '5_BUA' : '3_BUA';
}
```

## 2.3. Component code đầy đủ

**File mới:** `src/components/dashboard/ComplianceCard.tsx`

```tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import type { MealLogHistoryItem, MealType, PlanType } from '../../services/mealLog.service';

interface ComplianceCardProps {
  data: MealLogHistoryItem[];
  planType?: PlanType;
  error?: string;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const MEAL_ORDER_3: MealType[] = ['SANG', 'TRUA', 'TOI'];
const MEAL_ORDER_5: MealType[] = ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];

const MEAL_LABEL: Record<MealType, string> = {
  SANG: 'Sáng',
  PHU_SANG: 'Phụ sáng',
  TRUA: 'Trưa',
  PHU_CHIEU: 'Phụ chiều',
  TOI: 'Tối',
};

function getWeekDates(today = new Date()): string[] {
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date.toISOString().slice(0, 10);
  });
}

function groupByDate(items: MealLogHistoryItem[]): Map<string, Set<MealType>> {
  const map = new Map<string, Set<MealType>>();
  items.forEach((item) => {
    if (!map.has(item.mealDate)) map.set(item.mealDate, new Set());
    map.get(item.mealDate)!.add(item.mealType as MealType);
  });
  return map;
}

function inferPlanType(items: MealLogHistoryItem[]): PlanType {
  const firstWith5 = items.find((i) => i.planType === '5_BUA');
  return firstWith5 ? '5_BUA' : '3_BUA';
}

const ComplianceCard: React.FC<ComplianceCardProps> = ({ data, planType, error }) => {
  const computed = useMemo(() => {
    const weekDates = getWeekDates();
    const grouped = groupByDate(data);
    const resolvedPlanType: PlanType = planType ?? inferPlanType(data);
    const mealOrder = resolvedPlanType === '5_BUA' ? MEAL_ORDER_5 : MEAL_ORDER_3;
    const expectedPerDay = mealOrder.length;
    const totalExpected = 7 * expectedPerDay;

    let totalLogged = 0;
    const dayMatrix = weekDates.map((date) => {
      const meals = grouped.get(date) ?? new Set<MealType>();
      const cells = mealOrder.map((m) => meals.has(m));
      totalLogged += cells.filter(Boolean).length;
      return { date, cells, count: cells.filter(Boolean).length, expected: expectedPerDay };
    });

    return {
      mealOrder,
      dayMatrix,
      totalLogged,
      totalExpected,
      percent: totalExpected === 0 ? 0 : Math.round((totalLogged / totalExpected) * 100),
      resolvedPlanType,
    };
  }, [data, planType]);

  // Empty state
  if (!error && data.length === 0) {
    return (
      <DashboardCard title="Đã có thực đơn · 7 ngày">
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <div className="text-3xl">🍽️</div>
          <div className="text-sm font-semibold text-gray-900">Chưa có thực đơn nào</div>
          <p className="max-w-xs text-xs leading-5 text-gray-500">
            Tạo thực đơn đầu tiên để bắt đầu theo dõi tiến độ.
          </p>
          <Link
            to="/nutrition-plan"
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
          >
            Tạo thực đơn
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </DashboardCard>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardCard title="Đã có thực đơn · 7 ngày">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {error}
        </div>
      </DashboardCard>
    );
  }

  const { mealOrder, dayMatrix, totalLogged, totalExpected, percent, resolvedPlanType } = computed;

  return (
    <DashboardCard
      title="Đã có thực đơn · 7 ngày"
      info={`Mỗi cột là 1 ngày (T2 đến CN). Mỗi ô là 1 bữa (${resolvedPlanType === '5_BUA' ? '5 bữa/ngày' : '3 bữa/ngày'}).`}
      rightAction={
        <div className="text-right">
          <div
            className="text-lg font-bold text-gray-900"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {totalLogged}
            <span className="text-sm font-normal text-gray-400">/{totalExpected}</span>
            <span className="ml-1 text-xs font-medium text-gray-500">bữa</span>
          </div>
          <div className="text-xs font-semibold text-brand-green">{percent}%</div>
        </div>
      }
    >
      {/* Progress bar */}
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-2">
        {dayMatrix.map((day, idx) => {
          const dayFull = day.count === day.expected;
          return (
            <div key={day.date} className="flex flex-col items-center">
              <div
                className={`mb-2 text-[11px] font-semibold ${
                  dayFull ? 'text-brand-green-darker' : 'text-gray-400'
                }`}
              >
                {DAY_LABELS[idx]}
              </div>
              <div className="flex w-full flex-col items-center gap-1">
                {mealOrder.map((meal, j) => {
                  const logged = day.cells[j];
                  return (
                    <div
                      key={meal}
                      title={`${MEAL_LABEL[meal]} ${DAY_LABELS[idx]}: ${logged ? 'đã có thực đơn' : 'chưa có'}`}
                      className={`h-3.5 w-full max-w-[28px] rounded-sm transition-colors ${
                        logged
                          ? 'bg-brand-green'
                          : 'border border-dashed border-gray-200 bg-gray-50'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-green" />
          Có thực đơn
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-gray-300 bg-gray-50" />
          Chưa có
        </span>
      </div>
    </DashboardCard>
  );
};

export default ComplianceCard;
```

## 2.4. Verify

Sau khi tạo file:
- [ ] `npx tsc -b --pretty false` không lỗi
- [ ] Import `MealLogHistoryItem` resolve đúng từ `mealLog.service`
- [ ] `DashboardCard` import đúng từ `./DashboardCard`
- [ ] `useMemo` không có dependency miss

---

# PHASE 3 — RE-LAYOUT DASHBOARD (~1h)

## 3.1. Layout target (theo design `1779752528358_dashboard-page.jsx`)

```
┌────────────────────────────────────────────────────┐
│  Greeting Hero (full width)                        │
├──────────────────────────┬─────────────────────────┤
│  ConstitutionCard        │   ReminderList          │ Row 1: 1.2fr | 1fr
│  (Widget 1)              │   (Widget 3)            │
├──────────────────────────┴─────────────────────────┤
│  WeightChartCard (full width)                      │ Row 2
├────────────────────────────────────┬───────────────┤
│  ComplianceCard                    │  Metric       │ Row 3: 1.4fr | 1fr
│  (Widget 2B)                       │  SummaryGrid  │
│                                    │  (Widget 2C)  │
├────────────────────────────────────┴───────────────┤
│  HealthMetricsDetails (collapsible, full width)    │ Row 4
└────────────────────────────────────────────────────┘
```

**Mobile (< xl breakpoint):** Stack vertical đầy đủ — chỉ greeting → Constitution → Reminder → WeightChart → Compliance → MetricSummary → MedicalDetails.

## 3.2. Update `DashboardPage.tsx`

**Tìm block render hiện tại** (từ dòng ~125 sau `</section>` của greeting hero) và REPLACE:

```tsx
{/* GIỮ NGUYÊN: greeting hero section ở trên */}
</section>

{/* === ROW 1: Constitution + Reminders === */}
<div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
  <ConstitutionCard
    constitution={overview?.constitution ?? null}
    bmiMetric={overview?.metrics?.bmi}
    error={overview?.errors.constitution}
    onRetry={loadDashboard}
  />
  <ReminderList
    user={user}
    metrics={overview?.metrics ?? null}
    weightHistory={overview?.weightHistory ?? []}
    currentGoal={overview?.currentGoal ?? null}
  />
</div>

{/* === ROW 2: Weight chart full-width === */}
<WeightChartCard
  data={overview?.weightHistory ?? []}
  error={overview?.errors.weightHistory}
/>

{/* === ROW 3: Compliance + Metric Summary === */}
<div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
  <ComplianceCard
    data={overview?.mealLogHistory ?? []}
    error={overview?.errors.mealLogHistory}
  />
  <MetricSummaryGrid
    metrics={overview?.metrics ?? null}
    weightHistory={overview?.weightHistory ?? []}
  />
</div>

{/* === ROW 4: Medical details collapsed === */}
<HealthMetricsDetails
  metrics={overview?.metrics ?? null}
  error={overview?.errors.metrics}
/>
```

**Quan trọng:**
- Outer container vẫn dùng `<div className="space-y-5">` để gap đều giữa các row
- Grid `xl:grid-cols-[...]` đảm bảo mobile/tablet stack vertical, chỉ desktop từ 1280px+ mới có 2 col

## 3.3. Update import statements

**Đầu file `DashboardPage.tsx`, thêm import:**

```typescript
import ComplianceCard from '../components/dashboard/ComplianceCard';
```

## 3.4. Update `DashboardSkeleton`

Skeleton hiện tại có 3 metric card row + 1 grid 2 col. Update để khớp layout mới:

```tsx
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-5">
    {/* Greeting */}
    <div className="h-24 animate-pulse rounded-3xl bg-gray-100" />

    {/* Row 1: Constitution + Reminders */}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    </div>

    {/* Row 2: Weight chart */}
    <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />

    {/* Row 3: Compliance + Metric Summary */}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
      <div className="h-60 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-60 animate-pulse rounded-2xl bg-gray-100" />
    </div>

    {/* Row 4: Medical details */}
    <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
  </div>
);
```

---

# PHASE 4 — POLISH DETAIL (~30 phút)

## 4.1. Greeting hero rounded-3xl

Verify greeting hero đang dùng `rounded-3xl` (đã làm ở Phase 4 polish UI guide). Nếu chưa:

**File:** `src/pages/DashboardPage.tsx`, tìm `<section className="rounded-...">` của greeting và đảm bảo:

```tsx
<section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-brand-green-light via-emerald-50 to-white p-6 lg:p-7">
```

## 4.2. ComplianceCard rounded-2xl đồng bộ

`DashboardCard` wrapper hiện tại đã dùng `rounded-2xl`. KHÔNG cần đụng.

## 4.3. Spacing đồng bộ giữa các row

Outer container của Dashboard content phải dùng `space-y-5` (gap 20px) — đồng bộ với gap trong grid (`gap-5`).

```tsx
<div className="space-y-5">
  {/* ... rows ... */}
</div>
```

---

# 5. ACCEPTANCE CRITERIA

## 5.1. Build pass

- [ ] `npx tsc -b --pretty false` không lỗi
- [ ] `npm run build` không error (Vite warning chunk size OK, giữ nguyên)
- [ ] CSS output có class `bg-brand-green`, `bg-emerald-400` (đã verify từ Phase A Tailwind)

## 5.2. Visual verify (manual test)

Mở `/dashboard` (sau khi login + onboard xong):

**Layout structure:**
- [ ] Row 1: Constitution bên trái + Reminders bên phải (desktop ≥ 1280px). Mobile: stack
- [ ] Row 2: Weight chart full-width
- [ ] Row 3: Compliance bên trái (rộng hơn) + Metric Summary bên phải (3 cards) (desktop). Mobile: stack
- [ ] Row 4: Medical details collapsible full-width

**Widget 2B Compliance:**
- [ ] Header trái: "Đã có thực đơn · 7 ngày" (uppercase, gray-500)
- [ ] Header phải: số bữa logged/total + % xanh
- [ ] Progress bar gradient xanh ở top
- [ ] 7 cột (T2-CN), mỗi cột 3 ô (hoặc 5 ô nếu plan 5_BUA)
- [ ] Ô có data: `bg-brand-green` xanh đặc
- [ ] Ô chưa có: `bg-gray-50` + border dashed
- [ ] Legend dưới: "Có thực đơn" + "Chưa có"
- [ ] Empty state: emoji 🍽️ + button "Tạo thực đơn"

**Tooltip:**
- [ ] Hover ô vuông hiện title: "Sáng T2: đã có thực đơn" hoặc "Trưa T4: chưa có"

## 5.3. Responsive verify

- [ ] Desktop 1920px: layout 3 grid (1+1, full, 1+1)
- [ ] Tablet 768px: tất cả stack vertical
- [ ] Mobile 380px: tất cả stack, không scroll horizontal

## 5.4. Data verify (cần BE running)

Setup: login user đã có `/api/meal-log/confirm` 2-3 meal logs gần đây.

- [ ] GET `/api/meal-log/history?days=7` → response có items
- [ ] FE render đúng ô xanh tại vị trí ngày + bữa tương ứng
- [ ] Total `X/Y` chính xác (X = số bữa logged, Y = 7 × N expected)

---

# 6. ORDER OF IMPLEMENTATION

**Tổng:** ~3-4h. Làm tuần tự, KHÔNG nhảy phase.

### Phase 1 (~30 phút) — Service layer
1. Tạo `src/services/mealLog.service.ts` (§1.1)
2. Update `src/services/dashboard.service.ts` thêm `getMealLogHistory(7)` vào `Promise.allSettled` (§1.2)
3. Run `npx tsc -b --pretty false` → pass
4. **STOP — commit Phase 1 trước khi sang Phase 2**

### Phase 2 (~1.5h) — Build ComplianceCard
5. Tạo `src/components/dashboard/ComplianceCard.tsx` (§2.3)
6. Test render với mock data (tạo file `__tests__/ComplianceCard.test.tsx` nếu project đã có Jest, KHÔNG bắt buộc)
7. Hoặc test thủ công: thêm `<ComplianceCard data={mockData} />` vào DashboardPage tạm thời với mock `[{ mealDate: '2026-05-25', mealType: 'SANG', ... }]`
8. Verify visual khớp design `dashboard-w2.jsx` W2Compliance component
9. **STOP — commit Phase 2**

### Phase 3 (~1h) — Re-layout
10. Update `DashboardPage.tsx` thay block render (§3.2)
11. Update `DashboardSkeleton` (§3.4)
12. Verify responsive desktop/tablet/mobile
13. **STOP — commit Phase 3 + screenshot báo cáo user**

### Phase 4 (~30 phút) — Polish detail
14. Verify greeting hero `rounded-3xl` (§4.1)
15. Verify spacing đồng bộ `space-y-5` (§4.3)
16. Final visual test với mockup `1779752528358_Dashboard.html` mở browser
17. **STOP — commit Phase 4 + báo cáo final user**

---

# 7. ⚠ ĐIỂM CỰC KỲ DỄ SAI

## 7.1. Group meal logs phải dùng Map, không phải Array

**SAI:**
```tsx
const dayData = days.map((day) => items.filter((i) => i.mealDate === day));
// → O(N*M) performance, slow nếu data nhiều
```

**ĐÚNG:**
```tsx
const grouped = groupByDate(items);  // Map<date, Set<MealType>>
const dayData = days.map((day) => grouped.get(day) ?? new Set());
// → O(N+M), Set lookup O(1)
```

## 7.2. `getWeekDates()` phải tính đúng thứ 2 đầu tuần

JavaScript `Date.getDay()`:
- 0 = Sunday (Chủ nhật)
- 1 = Monday
- ...
- 6 = Saturday

Nếu hôm nay là Chủ nhật (`day === 0`), thứ 2 đầu tuần là **6 ngày trước** (`diffToMonday = -6`), KHÔNG phải +1.

Đây là edge case agent dễ miss → MUST có test với Chủ nhật làm input.

## 7.3. `mealType` của response có thể có giá trị nằm ngoài 5 enum

Defense: BE có thể trả enum mới trong tương lai. Filter sạch trước khi dùng:

```tsx
const validMealTypes = new Set(['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI']);

items.forEach((item) => {
  if (validMealTypes.has(item.mealType)) {
    // safe to use
  }
});
```

KHÔNG bắt buộc cho MVP nhưng đáng thêm nếu dư time.

## 7.4. `planType` mặc định khi data trống

Nếu user mới chưa có meal log nào, `inferPlanType([])` return `'3_BUA'`. Đảm bảo trong empty state KHÔNG render grid (vì sẽ render 7 cột trống trông xấu) → đã handle trong code §2.3 (return empty state trước khi compute matrix).

## 7.5. Title "Đã có thực đơn · 7 ngày" — uppercase tự động

`DashboardCard` wrapper đã tự `uppercase` title qua class. KHÔNG cần viết hoa tay:

```tsx
title="Đã có thực đơn · 7 ngày"   // ← lowercase ở source, CSS render UPPERCASE
```

KHÔNG viết:

```tsx
title="ĐÃ CÓ THỰC ĐƠN · 7 NGÀY"   // ← sai pattern, double uppercase
```

## 7.6. Grid `xl:grid-cols-[...]` thay vì `lg:grid-cols-2`

Design dùng grid asymmetric (1.2fr vs 1fr, 1.4fr vs 1fr) → KHÔNG dùng `grid-cols-2` (đối xứng). Phải dùng arbitrary value `xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]`.

Breakpoint `xl` (1280px) — chỉ desktop rộng mới chia 2 col. Tablet/mobile vẫn stack.

---

# 8. DELIVERABLES

**Files mới:**
- [ ] `src/services/mealLog.service.ts`
- [ ] `src/components/dashboard/ComplianceCard.tsx`

**Files update:**
- [ ] `src/services/dashboard.service.ts` (thêm fetch + interface)
- [ ] `src/pages/DashboardPage.tsx` (re-layout 4 row)
- [ ] `doc/context.md` (log Step 14 — Dashboard Completion)

**Commits gợi ý:**

```bash
git commit -m "feat(dashboard): add mealLog service for compliance widget

Wire GET /api/meal-log/history?days=7 vào dashboard overview
qua Promise.allSettled. Thêm interface MealLogHistoryItem +
helper getMealLogHistory()."

git commit -m "feat(dashboard): build ComplianceCard widget 2B

Group meal logs theo mealDate, render grid 7 cot x N bua
(3 hoac 5 tuy plan). Co empty state, error state, tooltip,
progress bar gradient. Logic compatible voi 3_BUA va 5_BUA."

git commit -m "refactor(dashboard): align layout to design spec

Reorganize Dashboard rows theo design mockup:
- Row 1: Constitution + Reminders (1.2fr 1fr)
- Row 2: WeightChart full width
- Row 3: Compliance + MetricSummary (1.4fr 1fr)
- Row 4: Medical details collapsible
Mobile/tablet van stack vertical."

git commit -m "chore(dashboard): polish spacing + skeleton match new layout"
```

---

# 9. RỦI RO + LƯU Ý

## 9.1. Endpoint `/api/meal-log/history` cần auth header

BE controller yêu cầu `@RequestHeader("X-User-Id")` hoặc legacy `userId`. `apiClient` đã có axios interceptor tự attach JWT — kiểm tra interceptor có set header `X-User-Id` từ token chưa.

Nếu BE reject 401:
- Verify `apiClient` interceptor có decode JWT và set `X-User-Id` từ field `sub` hoặc `userId` của token
- Nếu chưa, agent BE phải update controller chấp nhận tự suy `userId` từ JWT (đa số đã có Spring Security context)

→ **Test bằng Postman trước khi build FE**: gọi `GET /api/meal-log/history?days=7` với Bearer token, đảm bảo response 200.

## 9.2. Goal 5_BUA hiện tại có data không?

Theo `nghiep_vu_de_xuat_thuc_don_v3.3.md`, mặc định goal GIAM/DUY_TRI = 3_BUA, goal TANG có thể 5_BUA. Nếu test user goal là GIAM → data sẽ chỉ có 3_BUA → component render 3 ô/cột.

**Đây không phải bug** — component tự `inferPlanType()` từ data thực tế. Nếu muốn force 5_BUA UI để test, có thể pass prop `planType="5_BUA"` explicit.

## 9.3. KHÔNG đụng các widget khác

- KHÔNG đổi `ConstitutionCard.tsx` (đã polish Phase 3)
- KHÔNG đổi `ReminderList.tsx` (đã polish Phase 3)
- KHÔNG đổi `WeightChartCard.tsx`
- KHÔNG đổi `MetricSummaryGrid.tsx`
- KHÔNG đổi `HealthMetricsDetails.tsx` (đã polish Phase 4)

Chỉ thêm mới + re-arrange order trong `DashboardPage.tsx`.

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 26/05/2026 | v1.0 | Hướng dẫn ban đầu Dashboard completion. Phase 1: service layer (mealLog + dashboard.service update). Phase 2: ComplianceCard widget 2B. Phase 3: re-layout 4 row theo design. Phase 4: polish spacing + skeleton. Verify endpoint BE `/api/meal-log/history?days=7` đã có sẵn, không cần build BE thêm. |
