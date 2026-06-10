# Feature 1 — Xem thực đơn "Ngày mai" (FE)

> **Repo:** `Health-management-frontend`. Chạy trong session Agent Code mở tại repo FE.
> **Tiền đề:** guide BE đã chạy (request `/api/recommendation/full-day` nhận thêm `planDay`).
> **Phạm vi (Phương án 1):** thêm bộ chọn **[Hôm nay] · [Ngày mai]** trên trang Đề xuất. "Hôm nay" giữ nguyên hành vi; "Ngày mai" gọi gen với `planDay=TOMORROW` (trọn ngày mai). Chưa làm consolidation.

## Tổng quan thay đổi

| Việc | File |
|---|---|
| 1. Thêm type `PlanDay` + field `planDay` vào request | `src/types/meal.types.ts` |
| 2. Cache theo scope + gửi `planDay` + expose `planDay` | `src/hooks/useMealPlan.ts` |
| 3. Component bộ chọn ngày | `src/components/meal/DaySelector.tsx` (**tạo mới**) |
| 4. Gắn toggle + đổi nhãn ngày | `src/pages/MealRecommendationPage.tsx` |

---

## Bước 1 — `meal.types.ts`: type `PlanDay` + field request

File `src/types/meal.types.ts`.

**1a.** Thêm type (đặt cạnh các type khác, vd gần `PlanType`):

```ts
export type PlanDay = 'TODAY' | 'TOMORROW';
```

**1b.** Thêm field optional vào `RecommendFullDayRequest`:

```ts
export interface RecommendFullDayRequest {
  tdee: number;
  goalCode: GoalCode;
  planType: PlanType;
  constitution: ConstitutionCode;
  constitutionConfirmed?: boolean;
  perMealConfig: PerMealConfigMap;
  forceCompute?: boolean;
  planDay?: PlanDay;
}
```

> `meal.service.ts` không cần sửa — `recommendFullDay(payload)` truyền nguyên payload, chỉ cần type có field mới.

## Bước 2 — `useMealPlan.ts`: cache theo scope + gửi `planDay`

File `src/hooks/useMealPlan.ts`.

**2a.** Thêm `PlanDay` vào dòng import type từ `meal.types`:

```ts
import type { /* ...cac type cu... */, PlanDay } from '../types/meal.types';
```

**2b.** `getCacheKey`: thêm scope theo ngày (để gen ngày mai không đè cache hôm nay). Thay:

```ts
const getCacheKey = (userId: string | null | undefined) => {
  return `nutrition-plan-${userId ?? 'anonymous'}-${getTodayKey()}`;
};
```
bằng:
```ts
const getCacheKey = (userId: string | null | undefined, planDay: PlanDay) => {
  return `nutrition-plan-${userId ?? 'anonymous'}-${getTodayKey()}-${planDay}`;
};
```

**2c.** `GenerateMealPlanOptions`: thêm `planDay`:

```ts
interface GenerateMealPlanOptions {
  forceCompute?: boolean;
  constitutionConfirmed?: boolean;
  planDay?: PlanDay;
}
```

**2d.** Thêm state `planDay` (đặt cạnh các `useState` khác trong hook, vd gần `swapSnapshot`):

```ts
  const [planDay, setPlanDay] = useState<PlanDay>('TODAY');
```

**2e.** `cacheKey` memo: thêm `planDay`. Thay:

```ts
  const cacheKey = useMemo(() => getCacheKey(user?.userId), [user?.userId]);
```
bằng:
```ts
  const cacheKey = useMemo(() => getCacheKey(user?.userId, planDay), [user?.userId, planDay]);
```

**2f.** `persistPlan`: cho phép truyền key (để ghi đúng scope khi gen ngày khác). Thay:

```ts
  const persistPlan = useCallback((nextPlan: DailyPlanResponse, nextStates: UIMealState[]) => {
    setPlan(nextPlan);
    setMealStates(nextStates);
    writeCachedMealPlan(cacheKey, nextPlan, nextStates);
  }, [cacheKey]);
```
bằng:
```ts
  const persistPlan = useCallback(
    (nextPlan: DailyPlanResponse, nextStates: UIMealState[], key: string = cacheKey) => {
      setPlan(nextPlan);
      setMealStates(nextStates);
      writeCachedMealPlan(key, nextPlan, nextStates);
    },
    [cacheKey]
  );
```

**2g.** `generate`: tính ngày hiệu lực + key hiệu lực, gửi `planDay`, ghi/đọc đúng key. Thay **toàn bộ** hàm `generate` bằng:

```ts
  const generate = useCallback(async (options: GenerateMealPlanOptions = {}) => {
    if (!userContext || !preferences) return null;

    const effectiveDay: PlanDay = options.planDay ?? planDay;
    const effectiveKey = getCacheKey(user?.userId, effectiveDay);
    // Dong bo UI + cacheKey cho lan render sau (vd toggle sang ngay mai)
    if (effectiveDay !== planDay) setPlanDay(effectiveDay);

    setLoading(true);
    setError(null);
    setScoreDropEvent(null);
    setLastSwapSuggestion(null);
    setLastSwapSuggestionMealType(null);
    setLastWarnings([]);
    setPinsByMeal(new Map());
    setSwapSnapshot(null);

    try {
      const nextPlan = await recommendFullDay({
        tdee: userContext.tdee,
        goalCode: userContext.goalCode,
        planType: preferences.planType,
        constitution: userContext.constitution,
        constitutionConfirmed: options.constitutionConfirmed ?? false,
        perMealConfig: preferences.perMealConfig,
        forceCompute: options.forceCompute ?? false,
        planDay: effectiveDay,
      });
      const nextStates = buildInitialMealStates(nextPlan);
      const needsConstitutionConfirmation = Boolean(
        nextPlan.warning?.requireConfirm &&
          nextPlan.meals.length === 0 &&
          !options.constitutionConfirmed
      );

      if (needsConstitutionConfirmation) {
        setPlan(null);
        setMealStates([]);
        sessionStorage.removeItem(effectiveKey);
        return nextPlan;
      }

      const invalidMealCount = getInvalidMealCount(nextPlan);
      if (invalidMealCount > 0) {
        setError(getUnavailableMealMessage(invalidMealCount, nextPlan.meals.length));
      }

      if (nextStates.length === 0) {
        setPlan(null);
        setMealStates([]);
        sessionStorage.removeItem(effectiveKey);
        return nextPlan;
      }

      persistPlan(nextPlan, nextStates, effectiveKey);
      return nextPlan;
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'Không thể tạo thực đơn.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userContext, preferences, planDay, user?.userId, persistPlan]);
```

> Lưu ý: hàm vẫn dùng `userContext`/`preferences` như cũ — chỉ thêm `planDay` vào payload và dùng `effectiveKey` cho `removeItem`/`persistPlan`. Nếu deps cũ của bạn khác, giữ đủ các biến hàm thực sự dùng: `userContext, preferences, planDay, user?.userId, persistPlan`.

**2h.** Expose `planDay` trong object return của hook (thêm cạnh `generate`):

```ts
    planDay,
    generate,
```

> Không đụng tới mount-effect đọc cache (nó dùng `cacheKey` của scope hiện tại — reload sẽ về `TODAY` và nạp cache hôm nay, đúng ý muốn). Toggle sẽ **gen lại** mỗi lần (không tái dùng cache khi đổi ngày) — chấp nhận được; cache chủ yếu phục vụ reload.

## Bước 3 — Tạo `components/meal/DaySelector.tsx`

Đây là bản Tailwind hoá từ thiết kế (`nutrition-day-selector.jsx`): segmented control + `TomorrowChip`. Khác bản thiết kế ở chỗ **dùng thẳng giá trị `PlanDay` (`'TODAY'/'TOMORROW'`)** thay cho `'today'/'tomorrow'`, để khớp API và khỏi map.

```tsx
import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { PlanDay } from '../../types/meal.types';

interface DaySelectorProps {
  value: PlanDay;
  onChange: (day: PlanDay) => void;
  disabled?: boolean;
  full?: boolean; // mobile: chiem full chieu ngang
}

const ITEMS: { key: PlanDay; label: string }[] = [
  { key: 'TODAY', label: 'Hôm nay' },
  { key: 'TOMORROW', label: 'Ngày mai' },
];

// Bo chon ngay - cung phong cach segmented control o trang Nhat ky bua an
const DaySelector: React.FC<DaySelectorProps> = ({ value, onChange, disabled, full = false }) => (
  <div
    role="tablist"
    aria-label="Chọn ngày thực đơn"
    className={`gap-0.5 rounded-xl border border-gray-200 bg-gray-50 p-1 ${full ? 'flex w-full' : 'inline-flex'}`}
  >
    {ITEMS.map((item) => {
      const active = value === item.key;
      return (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={active}
          disabled={disabled}
          onClick={() => onChange(item.key)}
          className={`min-w-[92px] rounded-[9px] px-[18px] py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            full ? 'flex-1' : ''
          } ${active ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);

// Chip "Ngày mai" - dat canh tieu de khi dang xem ngay mai
export const TomorrowChip: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-brand-green-darker ring-1 ring-inset ring-emerald-200">
    <CalendarDaysIcon className="h-3.5 w-3.5" />
    Ngày mai
  </span>
);

export default DaySelector;
```

## Bước 4 — `MealRecommendationPage.tsx`: gắn toggle + đổi nhãn ngày

File `src/pages/MealRecommendationPage.tsx`.

**4a.** Thêm imports:

```tsx
import DaySelector, { TomorrowChip } from '../components/meal/DaySelector';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { PlanDay } from '../types/meal.types';
```

> Nếu file đã import sẵn một nhóm icon từ `@heroicons/react/24/outline`, chỉ cần thêm `InformationCircleIcon` vào nhóm đó thay vì thêm dòng import mới.

**4b.** Thêm nhãn ngày mai cạnh `todayLabel` (dòng `const todayLabel = useMemo(...)`):

```tsx
  const tomorrowLabel = useMemo(
    () => formatVietnameseDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    []
  );
  const dateLabel = mealPlan.planDay === 'TOMORROW' ? tomorrowLabel : todayLabel;
```

**4c.** Thêm handler đổi ngày (đặt cạnh `generateAndHandleWarning`):

```tsx
  const handleDayChange = useCallback(
    (day: PlanDay) => {
      if (day === mealPlan.planDay) return;
      if (preferences.isFirstTime) {
        setWizardOpen(true);
        toast.info('Hãy thiết lập bữa ăn trước khi tạo thực đơn.');
        return;
      }
      void generateAndHandleWarning({ planDay: day, constitutionConfirmed });
    },
    [mealPlan.planDay, preferences.isFirstTime, generateAndHandleWarning, constitutionConfirmed]
  );
```

**4d.** Thay **cả khối header** (hàng tiêu đề + nút) để thêm chip "Ngày mai", dòng ghi chú, và bộ chọn ngày. Thay:

```tsx
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đề xuất thực đơn</h1>
          <p className="mt-1 text-sm text-gray-500">
            Thực đơn cá nhân hóa theo mục tiêu, TDEE và thể trạng hiện tại.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-emerald-50"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          {preferences.isFirstTime ? 'Thiết lập bữa ăn' : 'Đổi thiết lập'}
        </button>
      </div>
```
bằng:
```tsx
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">Đề xuất thực đơn</h1>
            {mealPlan.planDay === 'TOMORROW' && <TomorrowChip />}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Thực đơn cá nhân hóa theo mục tiêu, TDEE và thể trạng hiện tại.
          </p>
          {mealPlan.planDay === 'TOMORROW' && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-green-darker">
              <InformationCircleIcon className="h-3.5 w-3.5 flex-shrink-0" />
              Đề xuất chuẩn bị trước cho ngày mai
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DaySelector
            value={mealPlan.planDay}
            onChange={handleDayChange}
            disabled={mealPlan.loading}
          />
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-emerald-50"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            {preferences.isFirstTime ? 'Thiết lập bữa ăn' : 'Đổi thiết lập'}
          </button>
        </div>
      </div>
```

> Bản thiết kế ghi "chưa có bữa nào được ghi nhận"; tôi đổi thành **"Đề xuất chuẩn bị trước cho ngày mai"** vì sau khi bạn xác nhận một bữa cho ngày mai thì câu cũ sẽ sai. Nếu muốn giữ nguyên chữ thiết kế, đổi lại dòng text trong khối trên.

**4e.** Đổi `date` của InfoStrip sang `dateLabel`. Trong `<InfoStrip ... />`, sửa:

```tsx
          date={todayLabel}
```
thành:
```tsx
          date={dateLabel}
```

---

## Kiểm thử (thủ công)

1. `npm run dev`, đăng nhập, vào trang **Đề xuất thực đơn**. Mặc định **Hôm nay** active.
2. Bấm **Ngày mai** → có spinner, rồi hiện **trọn ngày mai** (đủ các bữa, kể cả khi đang là buổi tối). Cạnh tiêu đề xuất hiện **chip "Ngày mai"** + dòng ghi chú "Đề xuất chuẩn bị trước cho ngày mai"; dải InfoStrip đổi ngày sang ngày mai. Network: `POST /api/recommendation/full-day` body có `"planDay":"TOMORROW"`, response `planDate` = ngày mai.
3. Bấm lại **Hôm nay** → trở về hành vi cũ (buổi tối chỉ các bữa còn lại theo giờ). Network: `"planDay":"TODAY"`.
4. Nút **"Gen lại cả ngày"** khi đang ở Ngày mai → gen lại đúng ngày mai (không nhảy về hôm nay).
5. Khi đang xem **Ngày mai**, bấm **"Đánh dấu đã ăn"** một bữa → kiểm tra `meal_log` có dòng **mealDate = ngày mai** (bữa được lưu cho đúng ngày). Đây là tiền đề tốt cho consolidation sau.
6. **Reload** trang → quay về **Hôm nay** (mặc định), nạp cache hôm nay. Cache ngày mai không đè cache hôm nay.
7. `npm run lint` và `npm run build` (hoặc `tsc -b`) → 0 lỗi.

## Lưu ý

- **"Hôm nay" không đổi** — vẫn lọc theo giờ. Đây là chủ ý của Phương án 1. Việc cho "Hôm nay" hiện trọn ngày + tự đổ vào Nhật ký để dành cho đợt consolidation.
- Mỗi lần đổi ngày sẽ **gen lại** (không tái dùng cache khi đổi). Chấp nhận được; có thể tối ưu sau.
- Trong lúc fetch ngày mới, danh sách bữa cũ có thể nháy thoáng dưới spinner — không ảnh hưởng dữ liệu.
- Bữa xác nhận khi đang xem Ngày mai sẽ được lưu `meal_log` đúng ngày mai (nhờ `plan.planDate`), khớp sẵn với hướng consolidation.
