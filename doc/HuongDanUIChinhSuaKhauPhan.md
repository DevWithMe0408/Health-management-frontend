# Hướng dẫn: Chỉnh khẩu phần inline trên MealCard + nút "Cân đối lại"

Tài liệu cho agent Code. Repo FE `Health-management-frontend`, nhánh `feature/UserTuDeXuat`.

Mục tiêu: cho phép người dùng chỉnh khẩu phần (serving) một món **ngay trên MealCard** (không cần mở Swap Drawer). Sau khi chỉnh, bấm **"Cân đối lại"** → BE giữ nguyên món đã chỉnh (coi như pin) và **tối ưu lại serving các món chưa pin** trong bữa để đạt điểm cao nhất; nếu điểm vẫn thấp, BE trả kèm gợi ý đổi món (banner sẵn có).

> **Tin tốt: hạ tầng đã có sẵn, đây gần như thuần FE-wiring.** BE `swapDish` và hook `useMealPlan.applyPin` đã làm hết phần nặng. KHÔNG sửa BE. KHÔNG sửa `useMealPlan`. KHÔNG tự tính tối ưu serving ở FE.

---

## 0. Bối cảnh: cơ chế đã tồn tại

Việc "chỉnh serving 1 món rồi tối ưu serving các món còn lại" về bản chất **đã được mô hình hóa** trong luồng swap hiện tại:

- Hook `useMealPlan` (`src/hooks/useMealPlan.ts`) có hàm:
  ```ts
  applyPin(mealType, swappedSlot, newDishId, overrideGrams)
  ```
  Nó gửi `swapDish` lên BE với toàn bộ pin của bữa, mỗi pin kèm `overrideGrams`.
- BE `RecommendationApiService.swapDish` tách 2 việc:
  - `buildPinnedMap`: chốt **món** cho mọi slot (không đổi món nào).
  - `buildFixedServingByIndex`: chỉ **cố định serving** các slot có `overrideGrams` (= các món đã pin).
  - `bruteForceEngine.findBestServingCombo(...)`: giữ nguyên serving các slot bị cố định, **brute-force tối ưu serving các slot CHƯA pin** để điểm cao nhất.
  - Nếu điểm sau tối ưu vẫn thấp → trả `suggestion` (gợi ý đổi món slot chưa pin). Banner gợi ý đã được render sẵn trong `MealCard`.

**Ánh xạ của tính năng này:** "chỉnh serving inline rồi Cân đối lại" = gọi `applyPin` với **`newDishId` = chính `dishId` của món đang chỉnh** (KHÔNG đổi món, chỉ truyền `overrideGrams` mới).

→ Toàn bộ phần tối ưu + gợi ý là việc của BE. FE chỉ cần: thêm UI stepper inline + nút, và khi bấm "Cân đối lại" thì gọi `applyPin` đúng tham số.

---

## 1. Quyết định thiết kế (đã chốt với người dùng)

1. **Commit tường minh, KHÔNG debounce.** Stepper chỉ đổi state local; chỉ khi bấm "Cân đối lại" mới gọi 1 request `applyPin`. (Tránh spam request và race condition.)
2. **Nhãn giữ "đã ghim".** Sau khi cân đối, món vừa chỉnh serving sẽ thành pin và hiện badge 📌 "đã ghim" như món swap — chấp nhận, không cần nhãn riêng "đã chỉnh".
3. **Mỗi lần chỉ chỉnh & cân đối MỘT món.** Tại một thời điểm chỉ một stepper được mở trong cả MealCard; mở stepper món khác thì đóng stepper đang mở.

---

## 2. Tái dùng component có sẵn — KHÔNG viết stepper mới

Component `src/components/meal/ServingStepper.tsx` ĐÃ tồn tại và đang dùng trong `SwapDrawer`. **Tái dùng đúng component này** cho stepper inline. KHÔNG tạo `InlineServingStepper` mới (mockup design có tạo bản riêng chỉ để preview — trong code thật thì dùng lại `ServingStepper`).

`ServingStepper` hiện nhận props: `name`, `serving`, `unit`, `baseServingG`, `expectedServing`, `onChange`. Nó tự lo lưới 0.5, min, max, hiển thị "≈ Ng", caption "Bước/Min/Max".

> **CHÚ Ý công thức max (đã đúng trong repo, đừng đổi):** `ServingStepper.tsx` tính
> `const max = Math.floor(1.5 * expectedServing * 2) / 2;`
> Dùng `Math.floor` (KHÔNG phải `Math.round`) để max luôn rơi đúng lưới 0.5. Nếu vô tình đổi sang `Math.round`, khi `expectedServing = 1.5` thì max = 2.25 → lệch lưới → nút +/− hỏng. Mockup design dùng `Math.round` là phiên bản cũ; bản code thật giữ `Math.floor`.

---

## 3. Các file cần sửa & cách sửa

### 3.1. `src/components/meal/FoodRow.tsx` — thêm nút "Khẩu phần" + render stepper inline

Hiện `FoodRow` chỉ có 1 nút "Đổi món" (gọi `onSwapClick`). Cần:

**(a) Thêm props:**
```tsx
interface FoodRowProps {
  // ...giữ nguyên các props cũ...
  editingServing?: boolean;            // stepper của row này đang mở?
  onToggleServing?: () => void;        // bật/tắt stepper cho row này
  servingDraft?: number;               // giá trị serving local đang chỉnh
  onServingDraftChange?: (next: number) => void;
  onRebalance?: () => void;            // bấm "Cân đối lại"
  rebalanceLoading?: boolean;          // đang gọi applyPin cho row này
}
```

**(b) Thêm nút "Khẩu phần" đứng TRƯỚC nút "Đổi món"**, cùng kiểu outline-sm, icon dấu `+`/`−` (path `M12 5v14M5 12h14`). Khi `editingServing === true` thì nút có nền xanh nhạt (active): thêm class kiểu `bg-brand-green-light border-brand-green text-brand-green-dark`. Bọc 2 nút trong một `div` flex gap-2:
```tsx
<div className="flex shrink-0 items-center gap-2">
  <button
    type="button"
    disabled={!canSwap}              // dùng cùng điều kiện slotKey như nút Đổi món
    onClick={onToggleServing}
    title="Chỉnh khẩu phần món này"
    className={`...outline-sm...${editingServing ? ' bg-brand-green-light border-brand-green text-brand-green-dark' : ''}`}
  >
    <PlusIcon className="h-3.5 w-3.5" /> Khẩu phần
  </button>
  {/* nút Đổi món hiện tại giữ nguyên */}
</div>
```

**(c) Bọc nội dung row + stepper trong một wrapper dọc.** Hiện row là 1 flex ngang. Đổi thành: ngoài cùng là `div` cột; phần trên là flex ngang (thumbnail + info + cụm nút) như cũ; phần dưới — chỉ khi `editingServing` — là khối stepper, thụt vào thẳng hàng nội dung (margin-left ≈ kích thước thumbnail + gap, ví dụ `ml-[78px]` với thumb 60–64 + gap 14; canh theo giá trị thực tế của thumb đang dùng).

```tsx
{editingServing && (
  <div className="ml-[78px] mt-3">
    <ServingStepper
      name={dishName}
      serving={servingDraft ?? dish.servingMultiplier}
      unit={dish.unit as string}
      baseServingG={dish.baseServingG as number}
      expectedServing={dish.expectedServing ?? dish.servingMultiplier}
      onChange={(next) => onServingDraftChange?.(next)}
    />
    <div className="mt-2.5 flex items-center gap-3.5">
      <span className="min-w-0 flex-1 text-xs leading-snug text-gray-500">
        Giữ nguyên các món đã ghim, hệ thống tự cân đối khẩu phần các món còn lại.
      </span>
      <button
        type="button"
        disabled={rebalanceLoading}
        onClick={onRebalance}
        className="...primary-sm... shrink-0"
      >
        {rebalanceLoading ? (<><Spinner size={14} thin /> Đang cân đối...</>)
          : (<><ArrowPathIcon className="h-4 w-4" /> Cân đối lại</>)}
      </button>
    </div>
  </div>
)}
```

> **Stepper chỉ render khi món có đơn vị khẩu phần** (`dish.unit && dish.baseServingG`). Nếu món không có (`hasUnit === false`), KHÔNG hiện nút "Khẩu phần" — vì không có lưới serving để chỉnh. Dùng lại biến `hasUnit` đã có trong file.

> **`expectedServing` có thể không tồn tại trên `DishSuggestionResponse`.** Type này (món đang trong thực đơn) khác `DishOptionResponse` (món alternative trong drawer, vốn có `expectedServing`). Kiểm tra type `DishSuggestionResponse` trong `src/types/meal.types.ts`:
> - Nếu CÓ field `expectedServing` → dùng nó.
> - Nếu KHÔNG có → fallback `dish.servingMultiplier` làm proxy (đã viết `?? dish.servingMultiplier` ở trên). KHÔNG thêm field mới vào type chỉ vì việc này.

### 3.2. `src/components/meal/MealCard.tsx` — quản lý state "đang mở stepper nào"

`MealCard` map các `FoodRow`. Cần biết row nào đang mở stepper và giá trị draft.

**(a) State trong MealCard** (hoặc nhận từ page — xem mục 3.3 để quyết định nơi đặt state):
- `editingSlotKey: string | null` — slot đang mở stepper.
- `servingDraft: number` — serving local đang chỉnh.

**(b) Khi bấm nút "Khẩu phần" của 1 row:** nếu row đó đang mở → đóng (`editingSlotKey = null`); nếu chưa → mở nó và **seed `servingDraft` = `dish.servingMultiplier` hiện tại** của món đó.

**(c) Truyền xuống mỗi `FoodRow`:**
```tsx
editingServing={editingSlotKey === dish.slotKey}
onToggleServing={() => handleToggleServing(dish)}
servingDraft={editingSlotKey === dish.slotKey ? servingDraft : undefined}
onServingDraftChange={setServingDraft}
onRebalance={() => onRebalanceServing(meal.mealType, dish, servingDraft)}
rebalanceLoading={rebalanceLoadingSlotKey === dish.slotKey}
```

### 3.3. `src/pages/MealRecommendationPage.tsx` — nối "Cân đối lại" vào `applyPin`

Đây là chỗ gọi BE. Logic của "Cân đối lại":

```tsx
const handleRebalanceServing = useCallback(
  async (mealType: MealType, dish: DishSuggestionResponse, draftServing: number) => {
    if (!dish.slotKey || !dish.baseServingG) return;
    const overrideGrams = Math.round(draftServing * dish.baseServingG);
    // newDishId = chính dishId hiện tại → KHÔNG đổi món, chỉ cố định serving mới.
    await mealPlan.applyPin(mealType, dish.slotKey, dish.dishId, overrideGrams);
    // applyPin tự cập nhật plan/score/suggestion/warnings; sau khi xong, đóng stepper.
  },
  [mealPlan]
);
```

Sau khi `applyPin` trả về thành công thì đóng stepper (reset `editingSlotKey = null`). `applyPin` đã tự set lại `plan`, `finalScore`, `suggestion`, `warnings` — banner gợi ý và badge 📌 sẽ tự cập nhật, không cần xử lý thêm.

> **Nơi đặt state `editingSlotKey`/`servingDraft`:** Khuyến nghị đặt trong **`MealCard`** (cục bộ mỗi card), KHÔNG đẩy lên page — vì nó chỉ là trạng thái UI tạm, không cần chia sẻ. Page chỉ cần cung cấp callback `onRebalanceServing` và cờ `rebalanceLoadingSlotKey`. Đặt ở page sẽ khiến page phình ra không cần thiet (over-engineer).

> **`rebalanceLoading` theo slot, không dùng cờ chung.** Hook có `swapLoading` (boolean chung cho cả swap lẫn applyPin). Nếu chỉ disable theo `swapLoading` thì mọi card sẽ bị khóa nút khi 1 món đang cân đối. Chấp nhận được ở scale đồ án nếu muốn đơn giản. Nhưng tốt hơn: trong MealCard, chỉ coi là loading khi `swapLoading === true` VÀ slot đang cân đối chính là `editingSlotKey`. Cách rẻ nhất: lưu `rebalancingSlotKey` cục bộ trong MealCard khi bấm "Cân đối lại", clear khi `applyPin` resolve.

---

## 4. Ràng buộc (để agent không làm lố)

- **KHÔNG** sửa BE (`RecommendationApiService`, `BruteForceEngine`...).
- **KHÔNG** sửa `useMealPlan.ts` — `applyPin` đã đủ. Không thêm hàm mới.
- **KHÔNG** tạo stepper mới — tái dùng `ServingStepper.tsx`.
- **KHÔNG** tự tính tối ưu serving / điểm ở FE — đó là việc của BE.
- **KHÔNG** đổi công thức `max` trong `ServingStepper` (giữ `Math.floor`).
- **KHÔNG** đổi layout/màu/spacing hiện có của MealCard; chỉ THÊM nút + khối stepper inline.
- Mỗi MealCard tại một thời điểm chỉ mở 1 stepper.
- Stepper inline chỉ áp dụng cho món có `unit` + `baseServingG`.

---

## 5. Cách verify

1. Vào `/nutrition-plan`, mở rộng một bữa có ≥ 2 món (vd Bữa Trưa).
2. Mỗi món (có đơn vị) có 2 nút: "Khẩu phần" và "Đổi món".
3. Bấm "Khẩu phần" ở Cơm trắng → stepper hiện inline ngay dưới dòng món, thụt thẳng hàng nội dung (không tràn lên thumbnail). Nút "Khẩu phần" chuyển trạng thái active (nền xanh nhạt).
4. Bấm "Khẩu phần" ở món khác → stepper của Cơm trắng đóng lại, stepper món mới mở (chỉ 1 stepper mở tại một thời điểm).
5. Chỉnh serving Cơm trắng (vd 2 → 1.5 bát), bấm **"Cân đối lại"**:
   - Đúng 1 request được gửi (kiểm tra Network tab).
   - Sau khi xong: Cơm trắng giữ đúng 1.5 bát và có badge 📌 "đã ghim"; serving các món chưa pin có thể thay đổi; điểm bữa cập nhật.
   - Nếu điểm vẫn thấp → banner gợi ý 💡 (đổi món) xuất hiện.
6. Nút "Cân đối lại" + stepper bị disable trong lúc request đang chạy (hiện "Đang cân đối...").
7. Chạy `npm run dev`, không có lỗi TypeScript/ESLint mới.

---

## 6. Commit message gợi ý (tiếng Anh, theo convention dự án)

```
feat(nutrition): inline serving adjustment on MealCard with rebalance

- add "Khẩu phần" button + inline ServingStepper per FoodRow (reuses existing stepper)
- only one stepper open per MealCard at a time; only for dishes with a serving unit
- "Cân đối lại" calls applyPin with the current dishId (no dish change), letting BE
  fix the adjusted serving and re-optimize servings of the remaining unpinned dishes
- per-slot loading state; no BE or useMealPlan changes
```
