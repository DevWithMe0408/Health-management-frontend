# Hướng Dẫn Xây Dựng Tính Năng Người Dùng Xây Dựng Thực Đơn — Frontend

> **Đọc trước khi code:** file này tự đủ context. Không cần đọc lịch sử chat khác.

---

## 1. Mục tiêu tính năng

Phase 1 đã có: trang `/nutrition-plan` với InfoStrip, 3 MealCard (Sáng/Trưa/Tối), swap đơn slot qua `SwapDrawer`, FooterSummary.

Phase 2 cần thêm vào **`SwapDrawer` hiện có**:
- Search box (tìm món theo tên cùng slotCode)
- Strip "Đang ghim" (hiển thị các món đã pin ở slot khác cùng bữa)
- Serving stepper (chỉnh khẩu phần theo đơn vị Việt: bát, tô, đĩa...)
- Đổi label nút thành "Áp dụng & cân đối lại bữa"
- Banner 2 modes (suggest A / warn B)

Và vào **`MealCard` + `FoodRow`**:
- Badge 📌 + viền trái xanh cho món đã ghim
- Chip "X món đã ghim" trong header card
- Banner suggestion phía trên list food (khi điểm thấp)

**Mô hình UX đã chốt (mô hình C):** Mỗi click "Đổi món" = pin món + chỉnh serving. Hệ thống GIỮ NGUYÊN các món ở slot khác, CHỈ tối ưu lại serving của chúng. Đa pin tích lũy theo từng bữa.

---

## 2. Quyết định kiến trúc đã chốt

1. **Tái sử dụng endpoint `POST /api/recommendation/swap-dish`** đã có (BE đã mở rộng). Không gọi endpoint mới.
2. **Endpoint mới `GET /api/nutrition/dishes/search`** cho search box trong drawer.
3. **State pin tích lũy theo MealType** trong hook `useMealPlan` (hoặc state cấp page).
4. **Đa pin:** mỗi lần user "Áp dụng" → FE gửi TẤT CẢ pin của bữa đó (không chỉ pin mới).
5. **Bỏ flag `outOfRange`** — không render chip cảnh báo này.

---

## 3. Tóm tắt thay đổi (checklist)

**Types (1 file):**
- [ ] `src/types/meal.types.ts` — thêm field vào `DishSuggestionResponse`, `DishOptionResponse`, `PinnedDish`, `SwapResultResponse`; thêm `WarningResponse`

**Services (2 files):**
- [ ] `src/services/meal.service.ts` — không đổi signature, vẫn dùng `swapDish` cũ
- [ ] `src/services/dish.service.ts` — file mới, hàm `searchDishes`

**Components mới (3 files):**
- [ ] `src/components/meal/SearchBar.tsx`
- [ ] `src/components/meal/PinnedStrip.tsx`
- [ ] `src/components/meal/ServingStepper.tsx`

**Components sửa (4 files):**
- [ ] `src/components/meal/AlternateCard.tsx` — hiển thị đơn vị Việt
- [ ] `src/components/meal/SwapDrawer.tsx` — thêm search/pin/stepper, đổi label nút
- [ ] `src/components/meal/FoodRow.tsx` — prop `pinned`, badge 📌, viền trái
- [ ] `src/components/meal/MealCard.tsx` — chip pinnedCount, banner suggestion

**Hook + page (2 files):**
- [ ] `src/hooks/useMealPlan.ts` — state pin tích lũy + logic apply
- [ ] `src/pages/MealRecommendationPage.tsx` — wire pin state vào SwapDrawer

---

## 4. Types — `src/types/meal.types.ts`

Sửa các interface hiện có + thêm interface mới:

```typescript
// SỬA: thêm 2 field
export interface DishSuggestionResponse {
  slotKey: string | null;
  dishId: string;
  dishName: string | null;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  servingMultiplier: number;
  actualGrams: number;
  dishKcal: number;
  unit: string | null;           // NEW — đơn vị Việt: 'bát', 'tô', 'đĩa', ...
  baseServingG: number | null;   // NEW — gram base của 1 đơn vị
  favorite: boolean;
}

// SỬA: thêm 2 field + nullable expectedScore
export interface DishOptionResponse {
  dishId: string;
  dishName: string;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  expectedScore: number | null;  // SỬA: null khi đến từ search (BE không tính score)
  expectedServing: number;
  expectedActualGrams: number;
  unit: string | null;           // NEW
  baseServingG: number | null;   // NEW
  favorite: boolean;
}

// SỬA: thêm overrideGrams optional
export interface PinnedDish {
  slotKey: string;
  dishId: string;
  overrideGrams?: number;        // NEW: null = engine tự optimize serving; có giá trị = ép fixed serving
}

// SỬA: thêm warnings
export interface SwapResultResponse {
  updatedMeal: MealSuggestionResponse;
  newFinalScore: number;
  originalFinalScore: number;
  scoreDropTriggered: boolean;
  suggestion: SwapSuggestion | null;
  warnings: WarningResponse[];   // NEW
}

// MỚI
export interface WarningResponse {
  type: 'CARB_BOMB' | string;    // future-proof: chấp nhận string khác
  message: string;
}
```

**Lưu ý:** giữ `SwapDishRequest` y nguyên — `PinnedDish` đã có `overrideGrams` rồi.

---

## 5. Service mới — `src/services/dish.service.ts`

File hoàn toàn mới:

```typescript
import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type { DishOptionResponse, SlotCode } from '../types/meal.types';

export interface SearchDishesParams {
  slotCode: SlotCode;
  q: string;
  slotKcalTarget: number;
}

/**
 * Tìm món theo tên trong cùng slotCode.
 * BE trả expectedServing đã snap về bội 0.5, expectedScore = null (search không tính score).
 */
export const searchDishes = async (
  params: SearchDishesParams
): Promise<DishOptionResponse[]> => {
  const response = await apiClient.get<
    DataResponse<DishOptionResponse[]> | DishOptionResponse[]
  >('/api/nutrition/dishes/search', {
    params: {
      slotCode: params.slotCode,
      q: params.q.trim(),
      slotKcalTarget: params.slotKcalTarget,
    },
  });
  return unwrapDataResponse(response.data);
};
```

---

## 6. Component mới — `SearchBar.tsx`

File: `src/components/meal/SearchBar.tsx`

Search bar 40px height, icon kính lúp trái, nút × phải, debounce 300ms ở component cha (không trong này).

```tsx
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  mobile?: boolean;
}

const SearchBar = ({ value, onChange, mobile = false }: SearchBarProps) => {
  // Local state để input không bị "controlled stutter"; debounce diễn ra ở cha
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    onChange(next);
  };

  return (
    <div className={mobile ? 'px-[18px] py-[14px]' : 'px-[22px] py-[16px]'}>
      <div className="relative flex items-center">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-gray-500" />
        <input
          type="text"
          value={local}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Tìm món... (vd: cơm trắng, cá kho)"
          aria-label="Tìm món"
          className={
            'h-10 w-full rounded-[10px] border border-gray-200 bg-white px-[38px] text-sm text-gray-800 outline-none transition ' +
            (local
              ? 'ring-2 ring-brand-green ring-offset-1'
              : 'focus:ring-2 focus:ring-brand-green focus:ring-offset-1')
          }
        />
        {local && (
          <button
            type="button"
            onClick={() => handleChange('')}
            aria-label="Xoá tìm kiếm"
            className="absolute right-2 p-0.5 text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
```

---

## 7. Component mới — `PinnedStrip.tsx`

File: `src/components/meal/PinnedStrip.tsx`

Strip hiển thị các món đã ghim ở slot KHÁC của cùng bữa. Có nút × để bỏ ghim.

```tsx
import { XMarkIcon } from '@heroicons/react/24/outline';
import FoodThumb from './atoms/FoodThumb';
import type { FoodGroup } from '../../types/meal.types';

export interface PinnedItem {
  slotKey: string;
  dishId: string;
  dishName: string;
  foodGroup: FoodGroup;
  serving: number;
  unit: string;
  grams: number;
}

interface PinnedStripProps {
  pins: PinnedItem[];
  onUnpin: (slotKey: string) => void;
  mobile?: boolean;
}

const fmtServing = (n: number) =>
  Number.isInteger(n) ? n.toString() : n.toFixed(1);

const PinnedStrip = ({ pins, onUnpin, mobile = false }: PinnedStripProps) => {
  if (pins.length === 0) return null;

  return (
    <div
      className={
        'border-b border-gray-100 bg-emerald-50 ' +
        (mobile ? 'px-[18px] py-2.5' : 'px-[22px] py-3')
      }
    >
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-500">
        Đang ghim · sẽ giữ nguyên khi áp dụng
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
        {pins.map((pin) => (
          <div
            key={pin.slotKey}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5"
          >
            <FoodThumb name={pin.dishName} foodGroup={pin.foodGroup} size={28} />
            <div className="min-w-0">
              <div className="max-w-[120px] truncate text-[13px] font-semibold text-gray-800">
                {pin.dishName}
              </div>
              <div className="text-[11.5px] tabular-nums text-gray-500">
                {fmtServing(pin.serving)} {pin.unit} ({pin.grams}g)
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUnpin(pin.slotKey);
              }}
              aria-label="Bỏ ghim"
              title="Bỏ ghim"
              className="shrink-0 p-0.5 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-[14px] w-[14px]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedStrip;
```

---

## 8. Component mới — `ServingStepper.tsx`

File: `src/components/meal/ServingStepper.tsx`

Stepper chỉnh khẩu phần, bước 0.5 đơn vị, snap về bội 0.5.

**Lưu ý sửa bug từ design v2:** `max = Math.floor((1.5 * expectedServing) * 2) / 2` để snap về 0.5. Không dùng `Math.round(...)/10` như design — sẽ ra giá trị không nằm trên lưới.

```tsx
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ServingStepperProps {
  name: string;
  serving: number;
  unit: string;
  baseServingG: number;
  expectedServing: number;
  onChange: (nextServing: number) => void;
}

const fmtServing = (n: number) =>
  Number.isInteger(n) ? n.toString() : n.toFixed(1);

const STEP = 0.5;
const MIN = 0.5;

const ServingStepper = ({
  name,
  serving,
  unit,
  baseServingG,
  expectedServing,
  onChange,
}: ServingStepperProps) => {
  // Max snap về bội 0.5 (không dùng Math.round vì sẽ ra số ngoài lưới)
  const max = Math.floor(1.5 * expectedServing * 2) / 2;
  const atMin = serving <= MIN;
  const atMax = serving >= max;
  const grams = Math.round(serving * baseServingG);

  return (
    <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
      <div className="flex items-center gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-emerald-800">
            Khẩu phần
          </div>
          <div className="mt-0.5 truncate text-[13.5px] font-semibold text-gray-900">
            {name}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            disabled={atMin}
            onClick={() => onChange(Math.max(MIN, serving - STEP))}
            aria-label="Giảm khẩu phần"
            className={
              'grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-brand-green bg-white text-emerald-700 ' +
              (atMin ? 'cursor-not-allowed opacity-35' : 'cursor-pointer hover:bg-emerald-50')
            }
          >
            <MinusIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <div className="mx-3 min-w-[90px] text-center">
            <div className="leading-tight">
              <span className="text-[22px] font-bold tabular-nums text-gray-900">
                {fmtServing(serving)}
              </span>
              <span className="ml-1 text-sm font-medium text-gray-700">{unit}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] tabular-nums text-gray-400">
              ≈ {grams}g
            </div>
          </div>

          <button
            type="button"
            disabled={atMax}
            onClick={() => onChange(Math.min(max, serving + STEP))}
            aria-label="Tăng khẩu phần"
            className={
              'grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-brand-green bg-white text-emerald-700 ' +
              (atMax ? 'cursor-not-allowed opacity-35' : 'cursor-pointer hover:bg-emerald-50')
            }
          >
            <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-gray-500">
        Bước 0.5 {unit} · Min {fmtServing(MIN)} · Max {fmtServing(max)}
      </div>
    </div>
  );
};

export default ServingStepper;
```

---

## 9. Component sửa — `AlternateCard.tsx`

Chỗ duy nhất cần sửa: dòng khẩu phần, hiển thị đơn vị Việt trước, gram trong ngoặc.

Tìm đoạn (khoảng giữa file):

```tsx
<span className="mt-2 block text-xs text-gray-500 tabular-nums">
  Khẩu phần:{' '}
  <b className="font-semibold text-gray-700">
    {formatNumber(option.expectedActualGrams)}g
  </b>
  <span className="mx-1.5 text-gray-300">·</span>
  Serving x{formatNumber(option.expectedServing)}
</span>
```

Thay bằng:

```tsx
<span className="mt-2 block text-xs text-gray-500 tabular-nums">
  Khẩu phần:{' '}
  <b className="font-semibold text-gray-700">
    {option.unit
      ? `${formatNumber(option.expectedServing)} ${option.unit} (${Math.round(option.expectedActualGrams)}g)`
      : `${Math.round(option.expectedActualGrams)}g`}
  </b>
</span>
```

**Score render — handle null:** tìm đoạn render điểm:

```tsx
<span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 tabular-nums">
  <StarIcon className="h-3 w-3 text-amber-500" />
  {option.expectedScore.toFixed(1)}
</span>
<DeltaPill value={delta} />
```

Sửa thành (xử lý null cho search):

```tsx
{option.expectedScore !== null && (
  <>
    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 tabular-nums">
      <StarIcon className="h-3 w-3 text-amber-500" />
      {option.expectedScore.toFixed(1)}
    </span>
    <DeltaPill value={delta} />
  </>
)}
```

Cũng phải sửa `delta` calc để tránh crash khi null:
```tsx
const delta = (option.expectedScore ?? 0) - currentScore;
```

---

## 10. Component sửa — `FoodRow.tsx`

Thêm prop `pinned` và `onTogglePin`:

```tsx
interface FoodRowProps {
  food: DishSuggestionResponse;
  isLast: boolean;
  pinned?: boolean;                          // NEW
  onSwapClick: (slotKey: string, food: DishSuggestionResponse) => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
  onTogglePin?: (slotKey: string) => void;   // NEW
}
```

Trong render container ngoài cùng, thêm border-left + padding-left khi pinned:

```tsx
<div
  className={
    'flex items-center gap-3.5 ' +
    (isLast ? '' : 'border-b border-gray-100 ') +
    (pinned
      ? 'border-l-4 border-l-brand-green pl-3 py-3.5'
      : 'py-3.5')
  }
>
```

Sau tên món (trước nút HeartButton), thêm badge 📌:

```tsx
{pinned && (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      if (food.slotKey && onTogglePin) onTogglePin(food.slotKey);
    }}
    title="Đã ghim - bấm để bỏ ghim"
    aria-label="Bỏ ghim món này"
    className="grid h-[22px] w-[22px] shrink-0 cursor-pointer place-items-center rounded-md border border-brand-green bg-emerald-50 text-[13px] leading-none"
  >
    📌
  </button>
)}
```

Sửa dòng khẩu phần để dùng đơn vị Việt:

```tsx
<span className="font-semibold text-gray-800 tabular-nums">
  {food.unit && food.baseServingG
    ? `${formatNumber(food.servingMultiplier)} ${food.unit} (${Math.round(food.actualGrams)}g)`
    : `${Math.round(food.actualGrams)}g`}
</span>
```

---

## 11. Component sửa — `MealCard.tsx`

Thêm props mới và logic chip pinned count + banner suggestion.

```tsx
interface MealCardProps {
  // ... existing ...
  suggestion?: SwapSuggestion | null;        // NEW: banner gợi ý sau apply
  onApplySuggestion?: (suggestion: SwapSuggestion) => void;
  onDismissSuggestion?: () => void;
  pinnedSlotKeys: Set<string>;               // NEW: set slot đã ghim của bữa này
  onTogglePin: (slotKey: string) => void;    // NEW
}
```

Trong header MealCard, giữa `StatusPill` và `ScoreBadge`, thêm chip đếm pin:

```tsx
{pinnedSlotKeys.size > 0 && (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-[5px] text-[12.5px] font-semibold text-emerald-800 ring-1 ring-emerald-300/60">
    <span className="text-xs leading-none">📌</span>
    {pinnedSlotKeys.size} món đã ghim
  </span>
)}
```

Trong expanded body, **TRƯỚC** list food, thêm banner suggestion:

```tsx
{suggestion && (
  <div className="mx-1 mb-4 mt-1 flex items-center gap-2.5 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3.5 py-3">
    <span className="shrink-0 text-base leading-none">💡</span>
    <div className="min-w-0 flex-1 text-[12.5px] leading-snug text-amber-900">
      <b>Gợi ý:</b> {suggestion.message}
    </div>
    <button
      type="button"
      onClick={() => onApplySuggestion?.(suggestion)}
      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
    >
      Áp dụng gợi ý
    </button>
    <button
      type="button"
      onClick={onDismissSuggestion}
      title="Bỏ qua gợi ý"
      className="shrink-0 p-0.5 text-amber-900 opacity-50 hover:opacity-100"
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  </div>
)}
```

Truyền `pinned` + `onTogglePin` xuống mỗi `FoodRow`:

```tsx
{meal.topCombination.dishes.map((dish, index) => (
  <FoodRow
    key={`${dish.dishId}-${index}`}
    food={dish}
    isLast={index === meal.topCombination.dishes.length - 1}
    pinned={dish.slotKey ? pinnedSlotKeys.has(dish.slotKey) : false}
    onSwapClick={onSwapClick}
    onToggleFavorite={onToggleFavorite}
    onTogglePin={onTogglePin}
  />
))}
```

---

## 12. Component sửa — `SwapDrawer.tsx`

Đây là file thay đổi nhiều nhất. Cấu trúc mới (top → bottom):

```
┌─────────────────────────────────────┐
│ Header: tên slot + món hiện tại + × │
├─────────────────────────────────────┤
│ PinnedStrip (nếu có pin slot khác)  │   ← NEW
├─────────────────────────────────────┤
│ SearchBar                            │   ← NEW
├─────────────────────────────────────┤
│ Section heading: "X lựa chọn ..."   │
├─────────────────────────────────────┤
│ Scrollable list AlternateCard       │
│ (hoặc empty state khi search rỗng)  │
├─────────────────────────────────────┤
│ ServingStepper (chỉ khi đã chọn)    │   ← NEW
│ Warning banner (mode B nếu có)      │   ← NEW
│ Nút "Áp dụng & cân đối lại bữa"     │
│ + phụ đề "Giữ nguyên X, Y..."       │
└─────────────────────────────────────┘
```

Mở rộng props:

```tsx
interface SwapDrawerProps {
  open: boolean;
  mobile?: boolean;
  currentDish: DishSuggestionResponse;
  currentMealScore: number;
  slotKcalTarget: number;                       // NEW: cho search
  alternatives: DishOptionResponse[];           // gợi ý mặc định (khi search rỗng)
  suggestion?: SwapSuggestion | null;
  pins: PinnedItem[];                           // NEW: các slot KHÁC đang ghim
  keepDishNames: string;                        // NEW: chuỗi 2 món còn lại
  confirmLoading: boolean;
  warning?: WarningResponse | null;             // NEW: warning từ lần apply trước (mode B)
  onClose: () => void;
  onConfirm: (newDishId: string, overrideGrams: number) => void | Promise<void>;
  onUnpin: (slotKey: string) => void;           // NEW
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
}
```

State nội bộ:

```tsx
const [query, setQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');
const [searchResults, setSearchResults] = useState<DishOptionResponse[]>([]);
const [searchLoading, setSearchLoading] = useState(false);
const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
const [serving, setServing] = useState(0);  // sẽ set khi chọn món

// Debounce 300ms
useEffect(() => {
  const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
  return () => clearTimeout(id);
}, [query]);

// Gọi search khi debouncedQuery thay đổi
useEffect(() => {
  if (!debouncedQuery) {
    setSearchResults([]);
    return;
  }
  let cancelled = false;
  setSearchLoading(true);
  searchDishes({
    slotCode: currentDish.slotCode,
    q: debouncedQuery,
    slotKcalTarget,
  })
    .then((res) => { if (!cancelled) setSearchResults(res); })
    .finally(() => { if (!cancelled) setSearchLoading(false); });
  return () => { cancelled = true; };
}, [debouncedQuery, currentDish.slotCode, slotKcalTarget]);

// Danh sách hiển thị: search results nếu đang search, ngược lại gợi ý mặc định
const displayList = debouncedQuery ? searchResults : alternatives;
const selectedOption = displayList.find((o) => o.dishId === selectedDishId);

// Khi đổi món được chọn, reset serving về expectedServing
useEffect(() => {
  if (selectedOption) setServing(selectedOption.expectedServing);
}, [selectedDishId, selectedOption?.expectedServing]);
```

Render structure (thay phần body hiện tại):

```tsx
{/* Header (giữ nguyên) */}
<header>...</header>

{/* NEW: PinnedStrip */}
<PinnedStrip pins={pins} onUnpin={onUnpin} mobile={mobile} />

{/* NEW: SearchBar */}
<SearchBar value={query} onChange={setQuery} mobile={mobile} />

{/* Section heading - thay đổi nội dung theo query */}
<div className="flex shrink-0 items-center justify-between gap-3 px-5 py-2">
  <div className="text-sm font-bold text-gray-700">
    {debouncedQuery
      ? `${displayList.length} kết quả cho "${debouncedQuery}"`
      : `${displayList.length} lựa chọn thay thế`}
  </div>
  <div className="text-xs text-gray-400">Điểm cao → thấp</div>
</div>

{/* Scrollable list */}
<div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4">
  {searchLoading ? (
    <div className="grid place-items-center py-10"><Spinner size={20} /></div>
  ) : displayList.length === 0 ? (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5 py-10 text-center">
      <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
      <div className="text-sm text-gray-500">
        {debouncedQuery
          ? `Không tìm thấy món nào với "${debouncedQuery}"`
          : 'Không có lựa chọn thay thế phù hợp.'}
      </div>
      {debouncedQuery && (
        <button
          onClick={() => setQuery('')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Xoá tìm kiếm
        </button>
      )}
    </div>
  ) : (
    displayList.map((option) => (
      <AlternateCard
        key={option.dishId}
        option={option}
        currentScore={currentMealScore}
        selected={option.dishId === selectedDishId}
        onSelect={() => setSelectedDishId(option.dishId)}
        onToggleFavorite={onToggleFavorite}
        mobile={mobile}
      />
    ))
  )}
</div>

{/* Footer */}
<footer className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
  {/* NEW: ServingStepper khi đã chọn */}
  {selectedOption && selectedOption.unit && selectedOption.baseServingG && (
    <ServingStepper
      name={selectedOption.dishName}
      serving={serving}
      unit={selectedOption.unit}
      baseServingG={selectedOption.baseServingG}
      expectedServing={selectedOption.expectedServing}
      onChange={setServing}
    />
  )}

  {/* Warning banner mode B (thay nút Áp dụng nếu warning carb-bomb từ lần apply trước) */}
  {warning ? (
    <div className="flex items-start gap-2.5 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2.5">
      <span className="shrink-0 text-base">💡</span>
      <div className="min-w-0 flex-1 text-[12.5px] leading-snug text-amber-900">
        {warning.message}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => selectedOption && onConfirm(selectedOption.dishId, serving * (selectedOption.baseServingG ?? 0))}
          className="rounded-lg border border-amber-500 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"
        >
          Vẫn áp dụng
        </button>
        <button
          onClick={() => { /* clear warning, để user chỉnh lại stepper */ }}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-800"
        >
          Điều chỉnh lại
        </button>
      </div>
    </div>
  ) : (
    <>
      <button
        type="button"
        disabled={!selectedOption || confirmLoading}
        onClick={() => {
          if (selectedOption && selectedOption.baseServingG) {
            void onConfirm(selectedOption.dishId, serving * selectedOption.baseServingG);
          }
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
      >
        {confirmLoading ? (
          <><Spinner size={14} thin /> Đang cân đối...</>
        ) : (
          <><ArrowPathIcon className="h-4 w-4" /> Áp dụng & cân đối lại bữa</>
        )}
      </button>
      {selectedOption && (
        <p className="mt-2 text-center text-xs leading-snug text-gray-500">
          Giữ nguyên <b className="text-gray-700">{keepDishNames}</b>, hệ thống tự cân đối khẩu phần
        </p>
      )}
    </>
  )}
</footer>
```

---

## 13. Hook integration — `useMealPlan.ts`

State pin tích lũy + logic apply. Hook hiện tại đã có `swap()` — mở rộng để hỗ trợ pin.

Thêm state:

```typescript
// Map<mealType, Map<slotKey, { dishId, overrideGrams }>>
const [pinsByMeal, setPinsByMeal] = useState<
  Map<MealType, Map<string, { dishId: string; overrideGrams: number }>>
>(new Map());
```

Sửa method `swap` (hoặc tạo method mới `applyPin`):

```typescript
const applyPin = useCallback(async (
  mealType: MealType,
  swappedSlot: string,
  newDishId: string,
  overrideGrams: number,
) => {
  setSwapLoading(true);
  try {
    // Build pinned list = TẤT CẢ pin hiện có của bữa này + pin mới
    const currentPins = pinsByMeal.get(mealType) ?? new Map();
    const pinnedDishes: PinnedDish[] = [];

    // Pin các slot KHÁC swappedSlot từ state hiện tại
    for (const [slotKey, pin] of currentPins) {
      if (slotKey !== swappedSlot) {
        pinnedDishes.push({
          slotKey,
          dishId: pin.dishId,
          overrideGrams: pin.overrideGrams,
        });
      }
    }
    // Pin slot mới (slot vừa apply)
    pinnedDishes.push({
      slotKey: swappedSlot,
      dishId: newDishId,
      overrideGrams,
    });

    const result = await swapDish({
      currentPlan: plan,
      mealType,
      swappedSlot,
      newDishId,
      pinnedDishes,
    });

    // Update plan
    setPlan(prev => ({
      ...prev,
      meals: prev.meals.map(m =>
        m.mealType === mealType ? result.updatedMeal : m),
    }));

    // Update pin state: thêm pin mới
    setPinsByMeal(prev => {
      const next = new Map(prev);
      const mealPins = new Map(next.get(mealType) ?? new Map());
      mealPins.set(swappedSlot, { dishId: newDishId, overrideGrams });
      next.set(mealType, mealPins);
      return next;
    });

    // Lưu suggestion + warnings nếu có để render trên MealCard
    setLastSwapSuggestion(result.suggestion);
    setLastWarnings(result.warnings ?? []);
  } finally {
    setSwapLoading(false);
  }
}, [plan, pinsByMeal]);

// Method bỏ ghim 1 slot
const unpin = useCallback(async (mealType: MealType, slotKey: string) => {
  // Cách đơn giản: chỉ xóa khỏi state, không trigger API.
  // Lần apply tiếp theo (nếu user pin món khác) sẽ không gửi pin của slot này.
  setPinsByMeal(prev => {
    const next = new Map(prev);
    const mealPins = new Map(next.get(mealType) ?? new Map());
    mealPins.delete(slotKey);
    if (mealPins.size === 0) next.delete(mealType);
    else next.set(mealType, mealPins);
    return next;
  });

  // OPTION: nếu muốn engine optimize lại serving khi unpin → call swap-dish
  // với pinnedDishes mới (không có slot này). Tạm bỏ qua cho scope thesis.
}, []);

return {
  // ... existing returns ...
  pinsByMeal,
  applyPin,
  unpin,
  lastSwapSuggestion,
  lastWarnings,
};
```

**Quyết định scope:** `unpin` đơn giản chỉ xóa state, không gọi API. Lý do: tránh request thừa, edge case ít. Nếu sau này muốn engine "free serving" cho slot vừa unpin, gọi lại `swap-dish` với pin list mới (không kèm slot đó).

---

## 14. Page integration — `MealRecommendationPage.tsx`

Wire pin state từ hook vào SwapDrawer và MealCard.

```tsx
const mealPlan = useMealPlan();
const { pinsByMeal, applyPin, unpin, lastSwapSuggestion, lastWarnings } = mealPlan;

// Helper: lấy danh sách pin của 1 bữa, trừ slot đang mở
const getOtherPins = useCallback(
  (mealType: MealType, currentSlotKey: string): PinnedItem[] => {
    const meal = mealPlan.plan?.meals.find(m => m.mealType === mealType);
    if (!meal) return [];
    const pins = pinsByMeal.get(mealType);
    if (!pins) return [];

    const result: PinnedItem[] = [];
    for (const [slotKey, pin] of pins) {
      if (slotKey === currentSlotKey) continue;
      const dish = meal.topCombination.dishes.find(d => d.slotKey === slotKey);
      if (!dish || !dish.unit || !dish.baseServingG) continue;
      result.push({
        slotKey,
        dishId: pin.dishId,
        dishName: dish.dishName ?? 'Món ăn',
        foodGroup: dish.foodGroupCode,
        serving: pin.overrideGrams / dish.baseServingG,
        unit: dish.unit,
        grams: pin.overrideGrams,
      });
    }
    return result;
  },
  [mealPlan.plan, pinsByMeal],
);

// Helper: chuỗi tên 2 món còn lại
const getKeepNames = (mealType: MealType, currentSlotKey: string): string => {
  const meal = mealPlan.plan?.meals.find(m => m.mealType === mealType);
  if (!meal) return '';
  return meal.topCombination.dishes
    .filter(d => d.slotKey !== currentSlotKey)
    .map(d => d.dishName ?? '?')
    .join(' + ');
};
```

Render từng MealCard với pin state + suggestion:

```tsx
{mealPlan.mealStates.map(({ meal, status, expanded }) => {
  const mealPins = pinsByMeal.get(meal.mealType);
  const pinnedSlotKeys = new Set(mealPins ? mealPins.keys() : []);
  const mealSuggestion = lastSwapSuggestion?.mealType === meal.mealType
    ? lastSwapSuggestion
    : null;

  return (
    <MealCard
      key={meal.mealType}
      meal={meal}
      // ... existing props ...
      pinnedSlotKeys={pinnedSlotKeys}
      onTogglePin={(slotKey) => unpin(meal.mealType, slotKey)}
      suggestion={mealSuggestion}
      onApplySuggestion={(s) => {
        // Mở drawer với món suggestion preselected
        // (tạm thời: không cần auto - user tự mở drawer)
      }}
      onDismissSuggestion={() => setLastSwapSuggestion(null)}
    />
  );
})}
```

Render SwapDrawer với props mới:

```tsx
{swapDrawerState.open && swapDrawerState.currentDish && selectedMealState && (
  <SwapDrawer
    open
    currentDish={swapDrawerState.currentDish}
    currentMealScore={selectedMealState.meal.topCombination.finalScore}
    slotKcalTarget={swapDrawerState.currentDish.dishKcal}  // proxy: kcal món hiện tại
    alternatives={alternatives}
    pins={getOtherPins(swapDrawerState.mealType, swapDrawerState.slotKey)}
    keepDishNames={getKeepNames(swapDrawerState.mealType, swapDrawerState.slotKey)}
    suggestion={mealPlan.lastSwapSuggestion}
    warning={lastWarnings.find(w => w.type === 'CARB_BOMB') ?? null}
    confirmLoading={mealPlan.swapLoading}
    onClose={closeSwapDrawer}
    onUnpin={(slotKey) => unpin(swapDrawerState.mealType!, slotKey)}
    onConfirm={async (newDishId, overrideGrams) => {
      if (!swapDrawerState.mealType || !swapDrawerState.slotKey) return;
      await applyPin(
        swapDrawerState.mealType,
        swapDrawerState.slotKey,
        newDishId,
        overrideGrams,
      );
      closeSwapDrawer();
    }}
    onToggleFavorite={handleToggleFavorite}
  />
)}
```

---

## 15. UX flow chi tiết

**Luồng thường:**
1. User vào `/nutrition-plan` → engine generate tổ hợp tốt nhất → 3 MealCard hiển thị
2. User click "Đổi món" trên FoodRow (vd slot TINH_BOT bữa Trưa)
3. SwapDrawer mở → load `alternatives` từ `meal.slotAlternatives[slotKey]`
4. User gõ "cơm" → debounce 300ms → call `searchDishes` → list update
5. User chọn "Cơm gạo lứt" → stepper hiện với `serving = expectedServing` (vd 1.5)
6. User chỉnh stepper xuống 1.0 → preview cập nhật `1 bát (~110g)`
7. User click "Áp dụng & cân đối lại bữa" → `applyPin(mealType, slotKey, dishId, 110)`
8. BE swap-dish với `pinnedDishes: [{slotKey, dishId, overrideGrams: 110}]`
9. Response trả `updatedMeal` (cơm gạo lứt 1 bát + 2 món cũ giữ nguyên dishId, serving được engine cân đối)
10. FE đóng drawer, MealCard update, badge 📌 hiện trên row cơm gạo lứt

**Luồng pin thứ 2:**
11. User click "Đổi món" trên row Món chính (Gà luộc)
12. SwapDrawer mở → strip "Đang ghim" hiện chip cơm gạo lứt
13. User search "cá hồi" → chọn → click áp dụng
14. `applyPin` gửi `pinnedDishes: [{cơm gạo lứt overrideGrams 110}, {cá hồi overrideGrams 150}]`
15. Engine pin 2 món, chỉ cân serving cho slot RAU
16. MealCard có 2 badge 📌 + chip "2 món đã ghim" trong header

**Luồng warning carb-bomb:**
17. User chỉnh stepper "Cơm trắng" lên 3 bát (300g) → click áp dụng
18. BE compute `carbRatio = 78%` > `0.70` → trả `warnings: [{ type: 'CARB_BOMB', message: '...' }]`
19. FE nhận warning, drawer không đóng, hiển thị banner mode B (2 nút)
20. User click "Vẫn áp dụng" → `applyPin` lần nữa với cùng payload, drawer đóng
21. Hoặc "Điều chỉnh lại" → clear warning state, user chỉnh stepper

---

## 16. Lưu ý quan trọng

**(1) Bug fix stepper bound:** dùng `Math.floor(1.5 * expectedServing * 2) / 2` chứ KHÔNG dùng `Math.round(...) / 10` như design v2. Lý do: phải snap về bội 0.5 (lưới serving), không phải làm tròn 1 chữ số thập phân.

**(2) Comment + commit tiếng Việt:** Theo convention project. Commit ví dụ: `feat(meal): them search va serving stepper cho swap drawer` / `feat(meal): hien thi badge pin va canh bao carb-bomb`.

**(3) `slotKcalTarget` cho search:** dùng `currentDish.dishKcal` làm proxy. Không cần truyền `goalCode/planType/perMealConfig` cho search — quá phức tạp. Sai số tối đa 25% là acceptable cho UX gợi ý.

**(4) `unit`/`baseServingG` có thể null:** với data từ history (`MealLogHistoryResponse`), BE trả null cho 2 field này (scope thesis). FE phải fallback dùng gram. Code đã wrap `food.unit && food.baseServingG ? ... : ...`.

**(5) Không refactor `useMealPlan`:** chỉ thêm state pin + method mới. Giữ `swap()` cũ nếu có nơi khác gọi.

**(6) Performance debounce search:** 300ms đủ. Không cần cache kết quả search (BE response nhanh, < 100ms vì query MySQL có index trên `(slot_code, is_active)`).

**(7) Edge case: user gõ search trong khi đang select 1 món:** khi `displayList` thay đổi, nếu `selectedDishId` không còn trong list → tự động deselect. Logic: `selectedOption = displayList.find(o => o.dishId === selectedDishId)` — null là OK, footer sẽ disable nút apply.

**(8) Reset state khi đóng drawer:** đóng drawer → `setQuery('')`, `setSelectedDishId(null)`, `setSearchResults([])`. Đảm bảo lần mở sau khởi tạo sạch.

**(9) Brand color trong Tailwind:** project hiện dùng `brand-green` / `brand-green-dark` / `brand-green-light` (đã cấu hình trong `tailwind.config`). Tất cả code mới phải dùng các token này thay vì `emerald-*`.

---

## 17. Câu hỏi tự kiểm tra trước khi PR

- [ ] `meal.types.ts` đã có `unit`, `baseServingG` (nullable), `overrideGrams`, `WarningResponse`?
- [ ] `dish.service.ts` đã có `searchDishes` với debounce ở caller?
- [ ] `ServingStepper` snap đúng bội 0.5 (test với `expectedServing = 1.5` → max = 2.0, không phải 2.25)?
- [ ] `SwapDrawer` reset state khi `onClose`?
- [ ] `MealCard` chip "X món đã ghim" chỉ hiện khi `pinnedSlotKeys.size > 0`?
- [ ] `FoodRow` viền trái xanh + badge 📌 không đè lên HeartButton?
- [ ] `applyPin` gửi TẤT CẢ pin của bữa, không chỉ pin mới?
- [ ] Warning carb-bomb hiển thị banner mode B, drawer không đóng?
- [ ] Tất cả comment TypeScript mới đều tiếng Việt?
