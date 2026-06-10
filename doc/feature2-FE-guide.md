# Feature 2 — Nhật ký bữa ăn & Tuân thủ (FE)

> **Repo:** `Health-management-frontend`. Chạy trong session Agent Code mở tại repo FE.
> **Tiền đề:** guide BE đã chạy xong (đã có `PATCH /api/meal-log/{id}/status`, `GET /api/meal-log/history-range`, field `customNote`, và `dishName` trong history).
> **Quyết định đã chốt:** cập nhật trạng thái theo `id`; điều hướng tuần/tháng refetch qua endpoint range.

## Tổng quan thay đổi

| Việc | File |
|---|---|
| 1. Đặt bộ file thiết kế | `src/pages/nutritionHistory/...` (giữ nguyên, chỉ đổi tên dấu chấm) |
| 2. Mở rộng service | `src/services/mealLog.service.ts` |
| 3. Tích hợp trang (fetch + handler API) | `src/pages/nutritionHistory/NutritionHistoryPage.tsx` (thay nguyên file) |
| 4. Route | `src/App.tsx` |
| 5. Sidebar (mục thứ 6) | `src/components/layout/Sidebar.tsx` |

---

## Bước 1 — Đặt bộ file thiết kế vào `src/pages/nutritionHistory/`

Tạo thư mục `src/pages/nutritionHistory/` và đặt các file thiết kế vào đúng cấu trúc sau. **Quan trọng:** file upload bị đổi dấu `.` thành `_`; phải lưu lại với **tên có dấu chấm** để khớp các `import` trong code (vd `./nutritionHistory.types`).

```
src/pages/nutritionHistory/
  NutritionHistoryPage.tsx          # SE THAY o Buoc 3 (dung ban tich hop)
  nutritionHistory.types.ts         # giu nguyen ban thiet ke
  nutritionHistory.constants.ts     # giu nguyen
  nutritionHistory.utils.ts         # giu nguyen
  nutritionHistory.mock.ts          # giu nguyen (DayView dung getSuggestedDishes lam fallback)
  components/
    RangeSegmentedControl.tsx
    ComplianceRing.tsx
    ComplianceSummaryCard.tsx
    StatusBadge.tsx
    MealLogRow.tsx
    RangeCard.tsx
    NutritionHistoryEmptyState.tsx
  views/
    DayView.tsx
    WeekView.tsx
    MonthView.tsx
```

Tất cả các file (trừ `NutritionHistoryPage.tsx` sẽ thay ở Bước 3) giữ **nguyên nội dung bản thiết kế**. Chúng là presentational, dùng đúng token `brand-green`/`amber`/card `rounded-2xl` của app, không cần sửa.

> Ghi chú: `nutritionHistory.mock.ts` vẫn cần giữ vì `DayView` import `getSuggestedDishes` làm fallback. Với dữ liệu thật, bữa SUGGESTED đã có sẵn danh sách món (từ lúc confirm) nên fallback gần như không bao giờ được dùng — giữ lại vô hại.

## Bước 2 — Mở rộng `src/services/mealLog.service.ts`

Service hiện có `getMealLogHistory(days)`. Thêm: kiểu món có tên, field `customNote`, và 2 hàm mới (`getMealLogHistoryRange`, `updateMealStatus`). Tất cả **tương thích ngược**.

**2a.** Thêm kiểu món + bổ sung `customNote`/`dishes` cho `MealLogHistoryItem`. Thay khối `export interface MealLogHistoryItem { ... }` hiện tại bằng:

```ts
export interface MealLogHistoryDish {
  dishId: string;
  dishName: string | null;
  dishKcal: number;
  servingMultiplier?: number;
  actualGrams?: number;
}

export interface MealLogHistoryItem {
  id: string;
  mealDate: string;
  mealType: MealType;
  planType: PlanType | string;
  goalCode: string;
  mealKcalTarget: number;
  totalKcalActual: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  finalScore: number;
  status: string; // SUGGESTED | FOLLOWED | MODIFIED | CUSTOM | SKIPPED
  customNote: string | null;
  dishes: MealLogHistoryDish[];
}
```

**2b.** Thêm 2 hàm mới ở cuối file (sau `getMealLogHistory`):

```ts
/** Lich su bua an trong khoang [from, to] (YYYY-MM-DD). Dung cho trang Nhat ky bua an. */
export const getMealLogHistoryRange = async (
  from: string,
  to: string
): Promise<MealLogHistoryItem[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryItem[]> | MealLogHistoryItem[]
  >('/api/meal-log/history-range', { params: { from, to } });
  return unwrapDataResponse(response.data);
};

/** Cap nhat trang thai mot bua (theo id). customNote chi co y nghia khi status = CUSTOM. */
export const updateMealStatus = async (
  id: string,
  status: 'SUGGESTED' | 'FOLLOWED' | 'CUSTOM' | 'SKIPPED',
  customNote?: string | null
): Promise<MealLogHistoryItem> => {
  const response = await apiClient.patch<
    DataResponse<MealLogHistoryItem> | MealLogHistoryItem
  >(`/api/meal-log/${id}/status`, { status, customNote: customNote ?? null });
  return unwrapDataResponse(response.data);
};
```

> Không cần truyền token — `apiClient` đã tự gắn `Authorization` qua interceptor (giống `getMealLogHistory`).

## Bước 3 — Thay `NutritionHistoryPage.tsx` bằng bản tích hợp

Thay **toàn bộ** `src/pages/nutritionHistory/NutritionHistoryPage.tsx` bằng nội dung dưới. So với bản thiết kế: bỏ mock, fetch thật theo khoảng đang xem (refetch khi đổi chế độ/điều hướng), 2 handler gọi API kèm cập nhật lạc quan (rollback nếu lỗi), `today` dùng `new Date()`, và **ẩn kcal cho bữa CUSTOM** (vì chưa có kcal thực tế của món tự ăn).

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MealLogRecord, MealLogStatus, RangeMode } from './nutritionHistory.types';
import {
  addDays,
  fmtKey,
  logsForMonth,
  logsForWeek,
  parseKey,
  startOfWeek,
} from './nutritionHistory.utils';
import {
  getMealLogHistoryRange,
  updateMealStatus,
  type MealLogHistoryItem,
} from '../../services/mealLog.service';
import { getApiErrorMessage } from '../../services/apiResponse';
import { RangeSegmentedControl } from './components/RangeSegmentedControl';
import { ComplianceSummaryCard } from './components/ComplianceSummaryCard';
import { NutritionHistoryEmptyState } from './components/NutritionHistoryEmptyState';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';

// BE co 5 trang thai; UI dung 4. Gop MODIFIED -> CUSTOM.
const STATUS_MAP: Record<string, MealLogStatus> = {
  SUGGESTED: 'SUGGESTED',
  FOLLOWED: 'FOLLOWED',
  MODIFIED: 'CUSTOM',
  CUSTOM: 'CUSTOM',
  SKIPPED: 'SKIPPED',
};

// Map ban ghi API -> MealLogRecord cua trang.
function toRecord(item: MealLogHistoryItem): MealLogRecord {
  const status = STATUS_MAP[item.status] ?? 'SUGGESTED';
  return {
    id: item.id,
    mealDate: item.mealDate,
    mealType: item.mealType,
    status,
    customNote: item.customNote ?? null,
    // CUSTOM: chua noi DB thuc pham nen khong co kcal thuc te -> de 0 de an di.
    totalKcalActual: status === 'CUSTOM' ? 0 : Math.round(Number(item.totalKcalActual) || 0),
    dishes: (item.dishes ?? []).map((d) => ({
      dishName: d.dishName ?? 'Món ăn',
      dishKcal: Math.round(Number(d.dishKcal) || 0),
    })),
  };
}

/**
 * Trang "Nhật ký bữa ăn & Tuân thủ" — /nutrition-history.
 * Fetch theo khoang dang xem; doi che do/dieu huong -> refetch.
 */
const NutritionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = fmtKey(today);

  const [range, setRange] = useState<RangeMode>('day');
  const [dayKey, setDayKey] = useState(todayKey);
  const [weekAnchor, setWeekAnchor] = useState(todayKey);
  const [monthAnchor, setMonthAnchor] = useState(todayKey);

  const [logs, setLogs] = useState<MealLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khoang ngay can fetch theo che do + moc dang chon.
  const fetchRange = useMemo(() => {
    if (range === 'day') return { from: dayKey, to: dayKey };
    if (range === 'week') {
      const mon = startOfWeek(parseKey(weekAnchor));
      return { from: fmtKey(mon), to: fmtKey(addDays(mon, 6)) };
    }
    const a = parseKey(monthAnchor);
    const first = new Date(a.getFullYear(), a.getMonth(), 1);
    const last = new Date(a.getFullYear(), a.getMonth() + 1, 0);
    return { from: fmtKey(first), to: fmtKey(last) };
  }, [range, dayKey, weekAnchor, monthAnchor]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getMealLogHistoryRange(fetchRange.from, fetchRange.to);
        if (!cancelled) setLogs(items.map(toRecord));
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e, 'Không tải được nhật ký bữa ăn.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchRange.from, fetchRange.to]);

  // Logs trong khoang dang chon -> the tom tat tuan thu.
  const rangeLogs = useMemo(() => {
    if (range === 'day') return logs.filter((l) => l.mealDate === dayKey);
    if (range === 'week') return logsForWeek(logs, weekAnchor);
    return logsForMonth(logs, monthAnchor);
  }, [range, dayKey, weekAnchor, monthAnchor, logs]);

  const rangeLabel = range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng';

  // --- handlers: cap nhat lac quan + goi API; loi thi rollback ---
  const handleSetStatus = async (log: MealLogRecord, status: MealLogStatus) => {
    const prev = logs;
    setLogs((p) =>
      p.map((l) =>
        l.id === log.id
          ? { ...l, status, customNote: null, totalKcalActual: status === 'FOLLOWED' ? l.totalKcalActual : 0 }
          : l
      )
    );
    try {
      await updateMealStatus(log.id, status, null);
    } catch (e) {
      setLogs(prev);
      setError(getApiErrorMessage(e, 'Không cập nhật được trạng thái bữa ăn.'));
    }
  };

  const handleSaveCustom = async (log: MealLogRecord, note: string) => {
    const finalNote = note.trim() || 'Đã ăn món khác';
    const prev = logs;
    setLogs((p) =>
      p.map((l) => (l.id === log.id ? { ...l, status: 'CUSTOM', customNote: finalNote, totalKcalActual: 0 } : l))
    );
    try {
      await updateMealStatus(log.id, 'CUSTOM', finalNote);
    } catch (e) {
      setLogs(prev);
      setError(getApiErrorMessage(e, 'Không lưu được ghi chú bữa ăn.'));
    }
  };

  const handlePickDay = (key: string) => {
    setDayKey(key);
    setRange('day');
  };

  // Chi hien empty state lon khi vao trang lan dau (ngay hom nay, chua co gi).
  const showEmpty = !isLoading && logs.length === 0 && range === 'day' && dayKey === todayKey;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký bữa ăn</h1>
          <p className="mt-1 text-sm text-gray-500">Xem bạn đã ăn gì và mức độ bám sát thực đơn.</p>
        </div>
        <RangeSegmentedControl value={range} onChange={setRange} />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-green" />
          <p className="ml-3 text-sm text-gray-500">Đang tải nhật ký...</p>
        </div>
      ) : showEmpty ? (
        <NutritionHistoryEmptyState onCreatePlan={() => navigate('/nutrition-plan')} />
      ) : (
        <div className="flex flex-col gap-5">
          <ComplianceSummaryCard rangeLabel={rangeLabel} logs={rangeLogs} />

          {range === 'day' && (
            <DayView
              dateKey={dayKey}
              logs={logs}
              onNav={(n) => setDayKey(fmtKey(addDays(parseKey(dayKey), n)))}
              onSetStatus={handleSetStatus}
              onSaveCustom={handleSaveCustom}
            />
          )}
          {range === 'week' && (
            <WeekView
              anchorKey={weekAnchor}
              logs={logs}
              today={today}
              onNav={(n) => setWeekAnchor(fmtKey(addDays(parseKey(weekAnchor), n)))}
              onPickDay={handlePickDay}
            />
          )}
          {range === 'month' && (
            <MonthView
              anchorKey={monthAnchor}
              logs={logs}
              today={today}
              onNav={(n) => {
                const a = parseKey(monthAnchor);
                setMonthAnchor(fmtKey(new Date(a.getFullYear(), a.getMonth() + n, 1)));
              }}
              onPickDay={handlePickDay}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionHistoryPage;
```

## Bước 4 — Route trong `src/App.tsx`

Thêm import (cạnh các import page khác):

```tsx
import NutritionHistoryPage from './pages/nutritionHistory/NutritionHistoryPage';
```

Thêm route trong `<Routes>`:

```tsx
<Route
  path="/nutrition-history"
  element={
    <ProtectedRoute>
      <MainLayout><NutritionHistoryPage /></MainLayout>
    </ProtectedRoute>
  }
/>
```

## Bước 5 — Mục sidebar thứ 6 (`src/components/layout/Sidebar.tsx`)

Thêm `CalendarDaysIcon` vào import heroicons (giữ nguyên các icon cũ, kể cả `PresentationChartLineIcon` đã thêm ở Feature 3):

```tsx
import { HomeIcon, PencilSquareIcon, BeakerIcon, BellIcon, ArrowLeftOnRectangleIcon, PresentationChartLineIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
```

Thêm `NavItem` mới làm **mục thứ 6** (ngay sau "Lịch sử Chỉ số"):

```tsx
<nav className="flex-grow space-y-2">
  <NavItem to="/dashboard" icon={HomeIcon} label="Thông số Sức khỏe" />
  <NavItem to="/submit-data" icon={PencilSquareIcon} label="Cập nhật Chỉ số" />
  <NavItem to="/nutrition-plan" icon={BeakerIcon} label="Đề xuất Thực đơn" />
  <NavItem to="/notifications" icon={BellIcon} label="Thông báo" />
  <NavItem to="/indicators-history" icon={PresentationChartLineIcon} label="Lịch sử Chỉ số" />
  <NavItem to="/nutrition-history" icon={CalendarDaysIcon} label="Nhật ký bữa ăn" />
</nav>
```

---

## Kiểm thử (thủ công)

Tài khoản test cần có vài bữa đã **confirm** (nhật ký chỉ hiện bữa đã được lưu kế hoạch). Nếu chưa có: vào `/nutrition-plan`, tạo + confirm vài bữa cho hôm nay và vài ngày trước.

1. `npm run dev`, đăng nhập. Sidebar có mục "Nhật ký bữa ăn" (thứ 6) → bấm vào `/nutrition-history`.
2. **Chế độ Ngày:** thấy thẻ "Mức độ tuân thủ · Ngày" + danh sách bữa hôm nay. Mỗi bữa có 3 nút: Đã ăn đúng / Ăn khác / Bỏ bữa.
3. Bấm **"Đã ăn đúng"** → badge đổi xanh ngay (lạc quan). Mở Network: `PATCH /api/meal-log/{id}/status` body `{"status":"FOLLOWED"}` → 200.
4. Bấm **"Ăn khác"** → mở ô input, gõ "bún bò Huế", Enter/Lưu → badge amber, dòng hiện "Đã ăn: bún bò Huế", **không hiện kcal**. Network: `{"status":"CUSTOM","customNote":"bún bò Huế"}`.
5. Bấm **"Bỏ bữa"** → badge xám, "Đã bỏ bữa này."
6. Bữa **FOLLOWED** hiển thị **tên món + kcal** (xác nhận BE đã điền `dishName`, không bị trống tên).
7. Reload trang → trạng thái vừa đặt vẫn giữ (đã lưu DB).
8. **Chế độ Tuần/Tháng:** chuyển bằng segmented control. Mỗi ô tô màu theo trạng thái; bấm prev/next → `GET /api/meal-log/history-range?from&to` cho kỳ mới. Bấm một ngày → nhảy về chế độ Ngày của ngày đó.
9. Thẻ "Mức độ tuân thủ" đổi theo kỳ; vòng tròn % = FOLLOWED/(FOLLOWED+CUSTOM+SKIPPED).
10. `npm run lint` và `npm run build` (hoặc `tsc --noEmit`) → 0 lỗi.

## Lưu ý quan trọng

- **Nhật ký chỉ hiện bữa đã confirm.** Bữa chưa từng tạo/confirm sẽ không có dòng → ô tuần/tháng hiện viền đứt "chưa báo cáo". Đây là hành vi đúng theo thiết kế (PATCH theo id, bữa phải tồn tại trước).
- **Bữa CUSTOM không có kcal thực tế** (chưa nối DB thực phẩm) — đã chủ động để 0 trong `toRecord` để khỏi hiển thị con số sai (kcal cũ là của thực đơn đề xuất, không phải món tự ăn).
- Mỗi lần đổi chế độ/điều hướng đều **refetch** một lần — bình thường và đúng thiết kế.
- Cập nhật trạng thái dùng **optimistic update**: đổi UI ngay, nếu API lỗi sẽ rollback + hiện banner lỗi.
