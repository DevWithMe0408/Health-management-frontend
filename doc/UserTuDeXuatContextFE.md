# User Tu De Xuat Context — Frontend

## Muc dich

Ghi lai context cho tinh nang **nguoi dung tu de xuat / pin mon va chinh khau phan** trong luong xay dung thuc don, ve phia Frontend (React + TypeScript).

File nay la context dung rieng cho FE, song song voi:

- `doc/UserTuDeXuatContextBE.md` — context BE da hoan thanh.
- `doc/HuongDanXayDungTinhNangNguoiDungXayDungThucDon-FE.md` — huong dan FE chi tiet.

## Quy trinh lam viec

- Thuc hien tung step nho.
- Sau moi step phai cap nhat state vao file nay.
- Sau moi step phai dung lai de user review.
- Chi thuc hien step tiep theo khi user xac nhan OK.
- Convention: phan tich / review / log bang tieng Viet; code comment, commit message, ten bien bang tieng Anh.

## Trang thai BE (input cho FE)

BE da hoan thanh toan bo (Step 1-8 trong `UserTuDeXuatContextBE.md`):

- `GET /api/nutrition/dishes/search?slotCode=&q=&slotKcalTarget=` — tra `DataResponse<List<DishOptionResponse>>`, `expectedScore = null`, gioi han 20 ket qua, populate `unit/baseServingG/favorite`.
- `POST /api/recommendation/swap-dish` — nhan `pinnedDishes[].overrideGrams` (nullable), tra `SwapResultResponse.warnings: List<WarningResponse>` (vi du `CARB_BOMB`).
- Response full-day / swap / alternatives da co `unit`, `baseServingG`.
- Meal-log history co the null `unit/baseServingG` — FE phai fallback gram.

## Trang thai FE Phase 1 (truoc khi vao Phase 2)

Da co san:

- Types: `src/types/meal.types.ts` (chua co `unit`, `baseServingG`, `overrideGrams`, `warnings`).
- Services: `src/services/meal.service.ts` voi `recommendFullDay`, `swapDish`, `confirmMeal`, `getFavoriteDishes`, `addFavoriteDish`, `removeFavoriteDish`.
- Components: `MealCard`, `FoodRow`, `AlternateCard`, `SwapDrawer`, `FooterSummary`, `InfoStrip`, `SetupWizard`, banners.
- Atoms: `DeltaPill`, `FoodGroupChip`, `FoodThumb`, `HeartButton`, `MacroBar`, `ScoreBadge`, `SlotChip`, `StatusPill`.
- Hook: `useMealPlan` — quan ly plan + swap don / confirm / skip / favorite / score drop / revert.
- Page: `MealRecommendationPage` — wire toan bo.

`useMealPlan.swap()` hien tu auto-pin tat ca slot khac swappedSlot (line 143-153). Phase 2 can chuyen sang pin tich luy do FE quan ly.

## Danh gia khả thi

KHA THI — co. BE da xong, FE chi can mo rong contract va component.

## Cac van de / sai lech voi huong dan

| # | Van de | Cach giai |
|---|--------|----------|
| 1 | Huong dan dung prop `food` o `FoodRow`, code thuc te dung `dish`. | Giu `dish` de khong pha `MealCard`. |
| 2 | `lastSwapSuggestion?.mealType` — interface `SwapSuggestion` khong co field `mealType`. | Hook luu cap `{ mealType, suggestion }` rieng, khong sua DTO. |
| 3 | `useMealPlan.swap()` hien auto-pin slot khac. Phase 2 yeu cau pin tich luy do FE quan ly. | Giu `swap()` cu, them `applyPin()` + `unpin()` moi. |
| 4 | Huong dan doi cho dung class `emerald-*`. Convention project dung `brand-green` / `brand-green-dark` / `brand-green-light`. | Refactor sang brand token khi viet. |
| 5 | Khi `generate()` lai plan, pin state phai reset (huong dan khong ghi ro). | Clear `pinsByMeal` trong `generate()`. |
| 6 | `expectedScore` hien type `number` non-null. BE search tra `null`. | Doi `expectedScore: number \| null`, sua `AlternateCard` xu ly null cho ca `delta` va render. |
| 7 | Reset state noi bo cua `SwapDrawer` khi dong (query, selected, warnings...). | `useEffect` reset khi `open` chuyen false. |
| 8 | `slotKcalTarget` cho search: huong dan dung `currentDish.dishKcal` lam proxy. | Chap nhan; BE chi dung de snap serving. |
| 9 | `unit/baseServingG` co the null voi data tu history. | Wrap render `unit && baseServingG ? ... : ...`. |
| 10 | `lastWarnings` can duoc tham chieu trong drawer va reset dung luc. | Hook expose `lastWarnings`; page truyen vao drawer; drawer reset khi dong / khi user click "Dieu chinh lai". |

## Ke hoach cac buoc

| Step | Noi dung | Files chinh |
|---|---|---|
| 0 | Tao file context FE (file nay). | `doc/UserTuDeXuatContextFE.md` |
| 1 | Cap nhat `meal.types.ts`. | `src/types/meal.types.ts` |
| 2 | Them service `dish.service.ts`. | `src/services/dish.service.ts` |
| 3 | Sua `AlternateCard.tsx`: don vi Viet, xu ly `expectedScore` null. | `src/components/meal/AlternateCard.tsx` |
| 4 | Sua `FoodRow.tsx`: prop `pinned`, badge pin, vien trai, don vi Viet. | `src/components/meal/FoodRow.tsx` |
| 5 | Tao `SearchBar.tsx`, `PinnedStrip.tsx`, `ServingStepper.tsx` (bug fix snap 0.5). | `src/components/meal/{SearchBar,PinnedStrip,ServingStepper}.tsx` |
| 6 | Sua `MealCard.tsx`: chip pinned count, banner suggestion, truyen pin xuong `FoodRow`. | `src/components/meal/MealCard.tsx` |
| 7 | Sua `SwapDrawer.tsx`: search + debounce 300ms, pin strip, stepper, warning banner mode B, doi label nut, reset state. | `src/components/meal/SwapDrawer.tsx` |
| 8 | Sua `useMealPlan.ts`: `pinsByMeal`, `applyPin`, `unpin`, `lastWarnings`, gan `mealType` cho `lastSwapSuggestion`, reset pin khi `generate`. | `src/hooks/useMealPlan.ts` |
| 9 | Sua `MealRecommendationPage.tsx`: helpers `getOtherPins`, `getKeepNames`; wire pin state vao `SwapDrawer` va `MealCard`. | `src/pages/MealRecommendationPage.tsx` |
| 10 | Kiem tra tong the: `npm run lint`, `npm run build`, smoke test UI. | — |

## Phu luc — Task khac (ngoai scope tinh nang nay)

- **Sidebar collapse / expand button**: user yeu cau giu thiet ke Sidebar hien tai, chi them nut thu gon / mo rong. Task nay doc lap, se lam sau khi xong tinh nang user tu de xuat. Tach PR rieng.

## Nhat ky step

### Step 0 - Tao file context FE

Status: DONE. Committed: `664039c docs(nutrition): add user proposed meal FE context`.

Noi dung da lam:

- Tao `doc/UserTuDeXuatContextFE.md`.
- Ghi muc dich, quy trinh lam viec, trang thai BE va FE hien tai.
- Liet ke 10 van de / sai lech voi huong dan va cach giai.
- Liet ke ke hoach 10 step.
- Ghi note Sidebar collapse / expand la task rieng, lam sau.

Files changed:

- `doc/UserTuDeXuatContextFE.md` (file moi)

Verification:

- Chua dung den code; khong can build / lint.

Review can user xac nhan:

- File context dung vi tri va dung muc dich.
- Ke hoach 10 step chap nhan duoc.
- 10 van de / sai lech voi huong dan da xu ly hop ly.
- Sidebar tach ra lam sau, OK.

---

### Step 1 - Cap nhat `meal.types.ts`

Status: DONE. Committed: `737dfe3 feat(meal): extend types for user proposed meal feature`.

Noi dung da lam:

- `DishSuggestionResponse`: them `unit: string | null`, `baseServingG: number | null`. Nullable de fallback voi data history.
- `DishOptionResponse`: them `unit: string | null`, `baseServingG: number | null`; doi `expectedScore: number` -> `number | null` (search endpoint khong tinh score).
- `PinnedDish`: them `overrideGrams?: number` optional. Khong gui hoac null = engine tu toi uu serving; co gia tri = ep fixed grams.
- Tao moi `WarningType = 'CARB_BOMB' | (string & {})` va `WarningResponse { type, message }`. Dung pattern `string & {}` de giu autocomplete `'CARB_BOMB'` ma van chap nhan type khac tu BE tuong lai.
- `SwapResultResponse`: them `warnings: WarningResponse[]` (BE tra `[]` khi khong co warning).

Files changed:

- `src/types/meal.types.ts`

Anh huong predictable:

- `AlternateCard.tsx:29,63` se fail typecheck vi `expectedScore` gio nullable. Day la cho da biet truoc, se fix o Step 3 cung voi viec doi hien thi don vi Viet.

Verification:

- Chay `npx tsc -b` -> chi co dung 2 loi predictable o `AlternateCard.tsx:29,63`. Khong file nao khac bi anh huong.
- Khong chay lint vi build hien tai dang fail typecheck cho den khi Step 3 xong.

Ghi chu cho cac step sau:

- Tat ca callsite render `unit` / `baseServingG` phai check null va fallback gram.
- Khi build `PinnedDish` o hook, neu user khong ep gram thi bo qua field `overrideGrams` thay vi gui `null` (giu request goi).
- Khi nhan `warnings` tu `SwapResultResponse`, neu BE lo tra null thi normalize sang `[]` o boundary service.

Review can user xac nhan:

- Cach pattern hoa `WarningType = 'CARB_BOMB' | (string & {})` chap nhan duoc khong, hay user muon enum cung `type WarningType = 'CARB_BOMB'` thuan?
- Chap nhan 2 loi typecheck tam thoi o `AlternateCard.tsx` cho den khi Step 3 fix?

---

### Step 2 - Them service `dish.service.ts`

Status: DONE. Committed: `3a4a429 feat(meal): add dish search service for swap drawer`. Da push len remote.

Noi dung da lam:

- Tao moi file `src/services/dish.service.ts`.
- Export `SearchDishesParams { slotCode, q, slotKcalTarget }`.
- Export `searchDishes(params)` -> `Promise<DishOptionResponse[]>`:
  - Goi `apiClient.get('/api/nutrition/dishes/search', { params })`.
  - Trim `q` truoc khi gui (mac du BE cung trim, FE trim de chac chan).
  - Unwrap `DataResponse<List<DishOptionResponse>>` qua helper `unwrapDataResponse`.
- Khong tu gan header `X-User-Id`. `apiClient` da co interceptor gan Bearer token; gateway/BE resolve userId tu JWT.
- Khong them debounce o service. Debounce 300ms se nam o caller (`SwapDrawer`) theo huong dan.

Files changed:

- `src/services/dish.service.ts` (file moi)

Verification:

- `npx tsc -b` -> chi co 2 loi predictable o `AlternateCard.tsx:29,63` (con tu Step 1). Service moi compile sach.

Ghi chu cho cac step sau:

- Caller phai chu dong debounce 300ms va huy request cu khi co query moi (de tranh race khi user go nhanh).
- BE tra `expectedScore = null` cho moi item; `AlternateCard` se phai an phan render score khi `null` (Step 3).
- BE gioi han 20 ket qua, FE khong can paginate.

Review can user xac nhan:

- Pattern dung `apiClient` + `unwrapDataResponse` dung convention hien co?
- Khong them retry / cancel o service-layer, chap nhan?

---

### Step 3 - Sua `AlternateCard.tsx`: don vi Viet + xu ly `expectedScore` null

Status: DONE. Committed: `290a5e6 feat(meal): show Vietnamese serving unit and handle null score`.

Noi dung da lam:

- Sua dong khau phan: render don vi Viet truoc, gram trong ngoac. Vi du `1.5 bat (215g)`. Khi `unit` null thi fallback `215g`.
- Dung `Math.round(option.expectedActualGrams)` thay vi `formatNumber(...)g`. Gram khong can decimal.
- Doi helper `formatNumber` -> `formatServing` voi `toFixed(2).replace(/\.?0+$/, '')`. Ly do: BE serving steps co `0.75`, neu dung `toFixed(1)` se ra `0.8` sai. Format moi:
  - `0.5` -> `'0.5'`
  - `0.75` -> `'0.75'`
  - `1.0` -> `'1'`
  - `1.5` -> `'1.5'`
- Score block: an toan bo `<span>` chua star + DeltaPill + "so voi hien tai" khi `option.expectedScore === null` (search ket qua). Khi co score, render binh thuong.
- `delta` calc: dung `(option.expectedScore ?? 0) - currentScore`. Khi score null, delta khong duoc render vi toan bo block bi an, nhung `??` van giu type-safe.

Files changed:

- `src/components/meal/AlternateCard.tsx`

Verification:

- `npx tsc -b` -> pass, khong loi nao.
- `npx eslint src/components/meal/AlternateCard.tsx src/types/meal.types.ts src/services/dish.service.ts` -> pass, khong warning.

Ghi chu cho cac step sau:

- Tat ca cho render serving khac (vd `FoodRow`, `PinnedStrip`, `ServingStepper`) nen dung pattern format `0.75`-safe tuong tu. Co the cancel scope: refactor helper ra `src/utils/format.ts` neu tai nhieu noi. Tam thoi giu cuc bo theo file.
- Khi search ket qua tra ve, user co the click chon mon ma chua co score -> cardselected style van work, OK.

Review can user xac nhan:

- Format `formatServing` 2 decimals strip zero chap nhan duoc khong, hay user muon hardcode `toFixed(1)`?
- An toan bo block score khi null (thay vi render `—`) la lua chon thiet ke duoc khong?

---

### Step 4 - Sua `FoodRow.tsx`: prop pinned + badge + vien trai + don vi Viet

Status: DONE. Committed: `a714d5d feat(meal): add pin indicator and Vietnamese serving to FoodRow`.

Noi dung da lam:

- Them props `pinned?: boolean` va `onTogglePin?: (slotKey: string) => void`. Mac dinh `pinned = false`, nen call site cu khong can sua.
- Container ngoai: them class `border-l-4 border-l-brand-green pl-3` khi `pinned = true`. Build class qua mang -> `filter(Boolean).join(' ')` cho de doc.
- Badge pin: render sau `HeartButton` khi `pinned = true`. La button click vao se goi `onTogglePin(dish.slotKey)`. Style `bg-brand-green-light` + `border-brand-green` theo convention brand token (Tailwind v4 doc tu `@theme` trong `src/index.css`). User yeu cau dung Heroicon thay vi emoji 📌 -> chon `MapPinIcon` solid tu `@heroicons/react/24/solid` cho nhat quan voi cac icon Heroicon khac trong project. Hover: `bg-brand-green text-white` de feedback ro hon.
- Sua dong khau phan: render `1.5 bat (215g) · 525 kcal` khi `unit && baseServingG`, fallback `215g · 525 kcal`. Bo phan "Khau phan x{serving}" vi serving da nam trong cum dau tien.
- Them helper local `formatServing` (giong AlternateCard, giu chinh xac 0.75) va `formatKcal` (lam tron 1 decimal cho kcal).
- Giu prop ten `dish` (khong doi sang `food` nhu huong dan) -> `MealCard` callsite khong can sua.

Files changed:

- `src/components/meal/FoodRow.tsx`

Verification:

- `npx tsc -b` -> pass.
- `npx eslint src/components/meal/FoodRow.tsx` -> pass.

Ghi chu cho cac step sau:

- `MealCard` chua truyen `pinned` va `onTogglePin` xuong `FoodRow`. Vi 2 prop deu optional, hien tai `FoodRow` se render nhu cu (khong co badge / vien). Step 6 se truyen prop xuong.
- Helper `formatServing` da xuat hien o 2 file (`AlternateCard`, `FoodRow`). Neu can dung them lan nua (Step 5 `PinnedStrip` / `ServingStepper`), nen refactor ra `src/utils/format.ts`. Tam thoi keep cuc bo theo file.

Review da xac nhan:

- Dong khau phan giu giong thiet ke design (`{serving} {unit} ({grams}g) · {kcal} kcal`), khop voi design jsx `nutrition-meal-card.jsx` va `nutrition-phase2.jsx`.
- Badge pin dung Heroicon `MapPinIcon` solid (user yeu cau).

---

### Step 5 - Tao SearchBar.tsx, PinnedStrip.tsx, ServingStepper.tsx

Status: DONE. Committed: `18f7420 feat(meal): add search, pinned strip and serving stepper components`.

Noi dung da lam:

**Refactor — `src/utils/format.ts` (file moi):**

- Tao `formatServing(value: number): string` dung chung cho moi component.
- `AlternateCard` va `FoodRow` da import tu day, bo `formatServing` cuc bo.
- `src/utils/` truoc do la folder rong; tao file dau tien.

**`src/components/meal/SearchBar.tsx` (file moi):**

- Props: `value: string`, `onChange: (next) => void`, `mobile?: boolean`.
- Local state mirror `value` qua `useEffect(() => setLocal(value), [value])` de typing khong giat khi parent re-render.
- Debounce KHONG nam o day; parent (`SwapDrawer`) chu dong debounce 300ms.
- Icon `MagnifyingGlassIcon` ben trai, nut `XCircleIcon` ben phai khi co value.
- Class style theo huong dan: `h-10`, ring `brand-green`, padding `px-[38px]` chua icon 2 ben.

**`src/components/meal/PinnedStrip.tsx` (file moi):**

- Export `PinnedItem { slotKey, dishId, dishName, foodGroup, serving, unit, grams }`.
- Props: `pins: PinnedItem[]`, `onUnpin`, `mobile?`.
- Return `null` khi `pins.length === 0`. Caller khong can guard.
- Render header `Đang ghim · sẽ giữ nguyên khi áp dụng` + horizontal scroll cac chip.
- Moi chip co `FoodThumb size={28}`, ten + serving, nut `XMarkIcon` bo ghim.
- Dung `bg-brand-green-light` cho strip background theo brand convention (#16.9).
- Caller (`SwapDrawer`) phai tu loc bo pin cua slot dang mo truoc khi truyen vao day.

**`src/components/meal/ServingStepper.tsx` (file moi):**

- Props: `name`, `serving`, `unit`, `baseServingG`, `expectedServing`, `onChange`.
- Const: `STEP = 0.5`, `MIN = 0.5`.
- **Bug fix §16.1:** `max = Math.floor(1.5 * expectedServing * 2) / 2` — KHONG dung `Math.round(...)/10`. Snap ve boi 0.5. Verified manually:
  - `expectedServing=1.5` -> max=2.0
  - `expectedServing=1.0` -> max=1.5
  - `expectedServing=0.75` -> max=1.0
  - `expectedServing=0.5` -> max=0.5 (= MIN, button + disabled ngay tu dau)
- 2 nut +/- `MinusIcon`, `PlusIcon`, disable khi cham bien.
- Render `{formatServing(serving)} {unit}` (kich thuoc lon) + `≈ {grams}g` (nho).
- Helper line: `Bước 0.5 {unit} · Min 0.5 · Max {max}`.
- Dung `bg-brand-green-light`, `border-brand-green`, `text-brand-green-dark` / `darker`. Border ngoai dung `border-brand-green/30` cho shade nhat (tailwind opacity utility) vi brand token khong co alias rieng cho shade 200/300.

Files changed:

- `src/utils/format.ts` (file moi)
- `src/components/meal/AlternateCard.tsx` (refactor: import `formatServing` tu utils)
- `src/components/meal/FoodRow.tsx` (refactor: import `formatServing` tu utils)
- `src/components/meal/SearchBar.tsx` (file moi)
- `src/components/meal/PinnedStrip.tsx` (file moi)
- `src/components/meal/ServingStepper.tsx` (file moi)

Verification:

- `npx tsc -b` -> pass, khong loi nao.
- `npx eslint` 6 file -> pass, khong warning.

Ghi chu cho cac step sau:

- `SwapDrawer` (Step 7) phai:
  - Truyen `pins` (loc bo slot dang mo) vao `PinnedStrip`.
  - Reset `serving` ve `expectedServing` khi user chon mon moi.
  - Khi nhan `onConfirm`, tinh `overrideGrams = serving * baseServingG`, lam tron.
- `useMealPlan` (Step 8) chua thay doi.

Review can user xac nhan:

- Format `formatServing` o utils du dung, hay can them helper khac (formatKcal, formatGram)?
- Bug fix snap 0.5 da verify dung cac edge case, OK?
- 3 component moi style dung brand convention (`bg-brand-green-light`, `text-brand-green-dark`)?

---

### Step 6 - Sua `MealCard.tsx`: chip pinnedCount + banner suggestion + truyen pin xuong FoodRow

Status: DONE. Committed: `7b2fef6 feat(meal): add pin count chip and suggestion banner to MealCard`.

Noi dung da lam:

- Them 5 props moi, tat ca **optional** de callsite `MealRecommendationPage.tsx` chua phai sua o Step 6:
  - `pinnedSlotKeys?: Set<string>` (default `EMPTY_PINNED_SLOTS` = `new Set()`).
  - `onTogglePin?: (slotKey: string) => void` (no-op khi khong truyen).
  - `suggestion?: SwapSuggestion | null` (default `null`).
  - `onApplySuggestion?: (suggestion) => void` (chi render nut "Áp dụng gợi ý" khi co handler).
  - `onDismissSuggestion?: () => void` (chi render nut X khi co handler).
- Chip "X mon da ghim" trong header, render khi `pinnedSlotKeys.size > 0`. Dat giua `StatusPill` va `<div>` chua `ScoreBadge`. Style brand convention: `bg-brand-green-light`, `text-brand-green-darker`, `ring-brand-green/30`. Icon dung `MapPinIcon` solid de dong bo voi badge trong `FoodRow`.
- Banner suggestion render trong expanded body, **truoc** list food. Style amber (giu theo design vi nghia "gợi ý"). Icon dung `LightBulbIcon` outline thay emoji 💡. Nut "Áp dụng gợi ý" + nut X dismiss render co dieu kien khi handler co.
- Truyen `pinned` va `onTogglePin` xuong moi `FoodRow`. `pinned` tinh tu `dish.slotKey ? pinnedSlotKeys.has(dish.slotKey) : false`.
- Dat const `EMPTY_PINNED_SLOTS` o module-level (khong tao Set moi moi render).

Files changed:

- `src/components/meal/MealCard.tsx`

Verification:

- `npx tsc -b` -> pass.
- `npx eslint src/components/meal/MealCard.tsx` -> pass.

Ghi chu cho cac step sau:

- Step 9 se wire `pinnedSlotKeys`, `onTogglePin`, `suggestion`, `onApplySuggestion`, `onDismissSuggestion` o `MealRecommendationPage.tsx`.
- Suggestion sau swap dang luu o `lastSwapSuggestion` (single value). Step 8 se mo rong de gan kem `mealType` -> page se filter `suggestion={lastSwapSuggestion?.mealType === meal.mealType ? lastSwapSuggestion.value : null}`.
- `onApplySuggestion` o page co the de no-op tam thoi (user chu dong mo drawer lai); huong dan §14 cung note nhu vay.

Review can user xac nhan:

- Lam props optional thay vi required (huong dan §11 ghi required) chap nhan duoc? Co the giam friction cho Step 6 nhung tang nguy co quen wire o Step 9.
- Chip dung `bg-brand-green-light` + `ring-brand-green/30` (thay vi `bg-emerald-50` + `ring-emerald-300/60` nhu huong dan) co dung brand convention?
- Banner suggestion dung `LightBulbIcon` thay 💡 OK?

---

### Step 7 - Sua `SwapDrawer.tsx`: search + pin strip + stepper + warning + reset state

Status: DONE. Committed: `a8f9836 feat(meal): rewrite SwapDrawer with search, pinned strip and serving stepper`.

Noi dung da lam:

**Props moi (tat ca optional, page chua phai sua o Step 7):**

- `slotKcalTarget?: number` — fallback `currentDish.dishKcal` neu khong truyen (proxy theo §16.3).
- `pins?: PinnedItem[]` — default `[]`. Caller phai loc bo slot dang mo truoc khi truyen.
- `keepDishNames?: string` — default `''`. Chuoi 2 mon con lai cho cum "Giữ nguyên X + Y".
- `warning?: WarningResponse | null` — default `null`. Khi co warning -> render banner mode B thay nut apply.
- `onUnpin?: (slotKey) => void` — neu khong truyen, `PinnedStrip` khong render (bao ve case page chua wire).
- `onDismissWarning?: () => void` — handler khi user click "Điều chỉnh lại" trong mode B.

**Signature `onConfirm` thay doi:**

- Cu: `(newDishId) => void | Promise<void>`.
- Moi: `(newDishId, overrideGrams) => void | Promise<void>`.
- TypeScript chap nhan callsite cu vi function fewer-params assignable to more-params. Page cu se nhan `newDishId` va bo qua `overrideGrams` cho den khi Step 9 wire.

**State noi bo:**

- `query`, `debouncedQuery`, `searchResults`, `searchLoading`, `selectedDishId`, `serving`.
- Reset toan bo khi `open` chuyen false (§16.8).
- Khi `open` chuyen true, pick initial selection theo `findInitialDishId(alternatives, suggestion)`; set `serving = expectedServing` cua mon do.
- Debounce 300ms qua `setTimeout` -> `debouncedQuery`. Effect fetch su dung co `cancelled` de tranh race khi user go nhanh.
- `displayList = debouncedQuery ? searchResults : alternatives`. `selectedOption` lookup tu `displayList`.
- Khong dung `useEffect` de sync serving theo `selectedOption` (de tranh exhaustive-deps warning va loop). Thay vao do, `handleSelect(option)` set ca `selectedDishId` lan `serving` cung luc.

**Layout (top -> bottom):**

1. Header (giu nguyen).
2. `PinnedStrip` (chi render khi co `onUnpin`).
3. `SearchBar`.
4. Section heading -> hien thi "X kết quả cho '...'" hoac "X lựa chọn thay thế".
5. Scrollable list `AlternateCard` (loading spinner, empty state co nut "Xoá tìm kiếm").
6. Footer:
   - `ServingStepper` (chi khi `selectedOption.unit && baseServingG`).
   - Mode A (no warning): nut "Áp dụng & cân đối lại bữa" + caption "Giữ nguyên X" (neu co `keepDishNames`) hoac "Khẩu phần áp dụng: ..." fallback.
   - Mode B (warning): banner amber + "Vẫn áp dụng" (goi `onClose`) + "Điều chỉnh lại" (goi `onDismissWarning`).

**Bo suggestion banner khoi drawer footer:**

- Phase 1 drawer co banner suggestion o footer. Phase 2 (Step 6) da chuyen banner suggestion vao `MealCard`. Drawer chi giu prop `suggestion` de auto-select mon goi y khi mo. Khong render banner.

**Quyet dinh "Vẫn áp dụng":**

- Huong dan §15 step 20 ghi "applyPin lan nua voi cung payload" — hieu la goi BE lan 2. Tuy nhien plan da update tu lan 1 (warning hien ra SAU swap thanh cong). Goi lai BE la lang phi.
- Thay vao do: "Vẫn áp dụng" = `onClose()` -> page se clear warning state va dong drawer. Tiet kiem 1 API call, behavior identical tu goc nhin nguoi dung.

**Icon thay emoji (de nhat quan voi rule trong context, Step 4):**

- Banner warning: `ExclamationTriangleIcon` outline thay 💡 (vi warning, khong phai suggestion).
- Empty state search: `MagnifyingGlassIcon` outline.

Files changed:

- `src/components/meal/SwapDrawer.tsx`

Verification:

- `npx tsc -b` -> pass.
- `npx eslint src/components/meal/SwapDrawer.tsx` -> pass (sau khi refactor `useEffect[selectedOption]` sang inline `handleSelect`).

Ghi chu cho cac step sau:

- `useMealPlan` (Step 8) phai expose `pinsByMeal`, `applyPin`, `unpin`, `lastWarnings`, va `dismissWarnings`. Cap nhat `lastSwapSuggestion` luu kem `mealType` de page filter dung bua.
- `MealRecommendationPage` (Step 9) phai:
  - Build `pins = getOtherPins(mealType, swappedSlot)` -> `PinnedItem[]`.
  - Build `keepDishNames = getKeepNames(mealType, swappedSlot)` -> `string`.
  - Wire `onConfirm(dishId, grams) => applyPin(...)`.
  - Wire `onUnpin(slotKey) => unpin(mealType, slotKey)`.
  - Wire `onDismissWarning => dismissWarnings()`.
  - Trong `closeSwapDrawer`, clear `lastWarnings` va `lastSwapSuggestion` neu can.
- Smoke test khi xong: mo drawer, search "com", chon mon, chinh stepper, click apply -> kiem tra grams gui qua BE dung.

Review can user xac nhan:

- Quyet dinh "Vẫn áp dụng" = `onClose()` (khong goi BE lai) co dung mo hinh UX user mong muon, hay phai re-call BE nhu §15 step 20 noi?
- Suggestion banner da chuyen sang `MealCard` -> drawer khong co banner suggestion nua, chap nhan?
- Layout footer (stepper o tren cung khi co selectedOption) dung thiet ke?
- `onConfirm(newDishId, overrideGrams)` signature thay doi nhung TypeScript chap nhan callsite cu, OK?

---

### Step 8 - Sua `useMealPlan.ts`: pin tich luy + applyPin + unpin + lastWarnings

Status: DONE. Committed: `07b1939 feat(meal): add cumulative pin state and applyPin to useMealPlan`.

Noi dung da lam:

**State moi (3):**

- `pinsByMeal: PinsByMeal = Map<MealType, Map<slotKey, { dishId, overrideGrams }>>`. Map of map ho tro pin tich luy tung bua.
- `lastWarnings: WarningResponse[]` — luu warnings tu lan swap/applyPin gan nhat.
- `lastSwapSuggestionMealType: MealType | null` — gan kem voi `lastSwapSuggestion` (giu shape cu) de page filter dung bua. Khong sua `SwapSuggestion` DTO.

**Type moi (export):**

- `PinsByMeal` type alias de page import.
- `PinEntry` interface noi bo.

**Method moi (3):**

- `applyPin(mealType, swappedSlot, newDishId, overrideGrams)`:
  - Build pinnedDishes = tat ca pin hien co cua bua (loc bo swappedSlot neu trung) + 1 pin moi cho swappedSlot.
  - Call `swapDish` voi pinnedDishes day du.
  - Update plan, `pinsByMeal[mealType][swappedSlot] = { dishId, overrideGrams }`.
  - Update `lastSwapSuggestion`, `lastSwapSuggestionMealType`, `lastWarnings`, `scoreDropEvent`.
  - Tao `swapSnapshot` truoc -> ho tro `revertSwap` cho luong moi.
- `unpin(mealType, slotKey)`:
  - Chi xoa khoi state, KHONG goi API (theo huong dan §13 - scope thesis).
  - Lan applyPin sau cua bua se khong gui pin nay nua.
- `dismissWarnings()`: clear `lastWarnings` ve `[]`. Page wire vao "Điều chỉnh lại" cua drawer.

**Sua `generate()`:**

- Reset them `pinsByMeal = new Map()`, `lastWarnings = []`, `lastSwapSuggestionMealType = null`. Tranh stale state khi re-gen plan.

**Sua `swap()` (legacy):**

- Bo sung set `lastSwapSuggestionMealType` va `lastWarnings` de behavior cu cung tra ve metadata day du. Logic auto-pin slot khac giu nguyen.
- Note: sau Step 9, page se goi `applyPin` thay vi `swap`. `swap` se thanh dead code; co the xoa o cleanup sau, ngoai scope.

**Sua `revertSwap()`:**

- Reset them `lastSwapSuggestionMealType`, `lastWarnings`.

**Expose them:**

- `lastSwapSuggestionMealType`, `lastWarnings`, `pinsByMeal`, `applyPin`, `unpin`, `dismissWarnings`.

Files changed:

- `src/hooks/useMealPlan.ts`

Verification:

- `npx tsc -b` -> pass. Page hien tai van compile vi `mealPlan.lastSwapSuggestion` shape khong doi.
- `npx eslint src/hooks/useMealPlan.ts` -> pass.

Ghi chu cho cac step sau:

- Step 9 page se:
  - Lay `pinsByMeal.get(meal.mealType)?.keys() ?? []` -> `pinnedSlotKeys: Set<string>` truyen vao MealCard.
  - Compute `getOtherPins(mealType, currentSlotKey): PinnedItem[]` doc tu `pinsByMeal` + `topCombination.dishes` (lay dishName/foodGroup/unit/baseServingG).
  - Compute `getKeepNames(mealType, currentSlotKey): string`.
  - Doi callsite `onConfirm` tu `(newDishId) => swap(...)` sang `(newDishId, overrideGrams) => applyPin(...)`.
  - Wire `onUnpin`, `onDismissWarning`, `warning` (lay tu `lastWarnings.find(w => w.type === 'CARB_BOMB')`).
  - Wire `suggestion` cho MealCard (`lastSwapSuggestionMealType === meal.mealType ? lastSwapSuggestion : null`).
- Co the consider remove `swap()` o cleanup PR sau, ngoai scope tinh nang nay.

Review can user xac nhan:

- Pattern `Map<MealType, Map<slotKey, PinEntry>>` chap nhan duoc, hay user muon `Record<MealType, Record<slotKey, PinEntry>>` (plain object)?
- Giu `swap()` cu va them `applyPin()` rieng (huong tien hoa) chap nhan duoc, hay nen refactor `swap()` thanh wrapper goi `applyPin()`?
- `unpin` chi clear state, khong goi BE — chap nhan trade-off (BE engine se khong tu doi serving cua slot vua unpin)?

---

### Step 9 - Sua `MealRecommendationPage.tsx`: wire pin state vao SwapDrawer va MealCard

Status: DONE. Committed: `6097430 feat(meal): wire pin state and warning banner into MealRecommendationPage`.

Noi dung da lam:

**Bo sung tweak hook `useMealPlan.ts` (Step 9 wiring):**

- Doi return type cua `applyPin`: tu `Promise<DailyPlanResponse | null>` -> `Promise<SwapResultResponse | null>`. Ly do: page can doc `result.warnings` ngay sau await de quyet dinh dong drawer hay khong (state React async, khong the doc `lastWarnings` ngay sau setState).
- Them method `dismissSuggestion()`: clear ca `lastSwapSuggestion` lan `lastSwapSuggestionMealType`. Page wire vao nut X dismiss banner suggestion o MealCard.
- Expose `dismissSuggestion` trong return.

**Sua page `MealRecommendationPage.tsx`:**

- Import: them `PinnedItem` tu `PinnedStrip`, `SwapSuggestion` tu types, `useCallback` tu react.
- `closeSwapDrawer`: dung `useCallback`, them goi `mealPlan.dismissWarnings()` -> dong drawer cung clear warnings (trang thai tieng vang khi mo lai slot khac).
- `openSwapDrawer(mealType, slotKey, currentDish)`: helper tap trung viec set state drawer.
- `getOtherPins(mealType, currentSlotKey): PinnedItem[]`:
  - Doc `pinsByMeal.get(mealType)`, loc bo `currentSlotKey`.
  - Loop pin, lookup dish info tu `topCombination.dishes`.
  - Skip khi `dish.unit` hoac `dish.baseServingG` null (history fallback).
  - Compute `serving = pin.overrideGrams / dish.baseServingG`.
- `getKeepNames(mealType, currentSlotKey): string`: join ten cua 2 mon con lai bang `' + '`.
- `handleApplySuggestion(mealType, suggestion)`: tim dish o slot `targetSlotKey` cua mealType, mo drawer voi dish do. Drawer se auto-select goi y theo `suggestion` prop.
- Render `MealCard`:
  - `pinnedSlotKeys = new Set(mealPlan.pinsByMeal.get(meal.mealType)?.keys() ?? [])`.
  - `onTogglePin = (slot) => mealPlan.unpin(meal.mealType, slot)`.
  - `suggestion = lastSwapSuggestionMealType === meal.mealType ? lastSwapSuggestion : null`. (Filter theo bua.)
  - `onApplySuggestion = (s) => handleApplySuggestion(meal.mealType, s)`.
  - `onDismissSuggestion = mealPlan.dismissSuggestion`.
- Render `SwapDrawer`:
  - Wire `slotKcalTarget = currentDish.dishKcal` (proxy theo §16.3).
  - Wire `pins = getOtherPins(...)`, `keepDishNames = getKeepNames(...)`.
  - Wire `warning = lastWarnings.find(w => w.type === 'CARB_BOMB') ?? null`.
  - `onConfirm` doi sang goi `applyPin(...)`. Sau await, check `result.warnings`. Neu khong co warning -> `closeSwapDrawer()`. Neu co warning -> giu drawer mo (mode B).
  - `onUnpin = (slot) => mealPlan.unpin(swapDrawerState.mealType, slot)`.
  - `onDismissWarning = mealPlan.dismissWarnings`.
  - Bo callsite cu `mealPlan.swap(...)`. Hook `swap()` thanh dead code (cleanup sau, ngoai scope).

Files changed:

- `src/hooks/useMealPlan.ts` (tweak `applyPin` return type, them `dismissSuggestion`)
- `src/pages/MealRecommendationPage.tsx`

Verification:

- `npx tsc -b` -> pass.
- `npx eslint src/pages/MealRecommendationPage.tsx src/hooks/useMealPlan.ts` -> 1 warning duy nhat o `MealRecommendationPage.tsx` line 181 (`react-hooks/exhaustive-deps` cua useEffect auto-generate). Da verify warning nay co san tu Phase 1 (tech debt), khong phai do Step 9 gay ra. Reverted code stash de confirm: warning xuat hien tai line 179 trong file goc, line 181 sau khi them imports/helpers.

Ghi chu cho cac step sau:

- Step 10: smoke test UI manual khi BE chay (dev server + login).
- `swap()` legacy giu lai trong hook nhung khong con callsite. Cleanup PR rieng neu can.
- Warning `react-hooks/exhaustive-deps` o useEffect auto-generate la tech debt, khong nen fix trong scope nay (rui ro infinite loop neu add `mealPlan` whole object vao dep).

Review can user xac nhan:

- Doi `applyPin` return tu `DailyPlanResponse` -> `SwapResultResponse` chap nhan duoc?
- Them `dismissSuggestion` o hook (cho MealCard banner) hop ly?
- `onApplySuggestion` mo drawer voi slot dich -> drawer auto-select goi y. UX nay dung mong muon?
- "Vẫn áp dụng" (drawer mode B) -> `onClose()` -> page goi `dismissWarnings()` -> drawer dong. OK?

---

### Step 10 - Kiem tra tong the: tsc + eslint + production build + smoke test plan

Status: DONE — cho user review (smoke test runtime do user thuc hien).

Noi dung da lam:

**1) Lint full project (`npm run lint`):**

- Tong: 25 problems (19 errors, 6 warnings).
- TAT CA error nam ngoai scope tinh nang nay (`RegisterPage`, `SubmitHealthDataPage`, `adminPage/*`, `services/auth.service.ts`, `services/healthData.service.ts`). Day la tech debt co san tu truoc.
- File trong scope (12 file): 0 error, 1 warning (`MealRecommendationPage.tsx:181` `react-hooks/exhaustive-deps` — da verify pre-existing).

**2) Lint files trong scope (12 file):**

```
src/types/meal.types.ts
src/services/dish.service.ts
src/components/meal/{AlternateCard,FoodRow,SearchBar,PinnedStrip,ServingStepper,MealCard,SwapDrawer}.tsx
src/hooks/useMealPlan.ts
src/pages/MealRecommendationPage.tsx
src/utils/format.ts
```

Ket qua: **0 error**, **1 warning** (pre-existing tech debt, da ghi nhan).

**3) Production build (`npm run build`):**

- `tsc -b` (project TypeScript references) -> PASS.
- `vite build` -> PASS, **built in 6.74s**, 1863 modules transformed.
- Warning chunk size (>500kB) la khuyen nghi code-splitting, khong lien quan feature.

**4) Smoke test UI manual (user thuc hien):**

User can chay BE va FE roi go theo checklist sau de verify Phase 2:

**Setup:**
- BE: chay `eureka-server`, `gateway`, `nutrition-service`, va cac service phu thuoc (`user-service` cho auth/profile).
- FE: `npm run dev` -> mo `http://localhost:5173`.
- Login bang account co data (cac chi so suc khoe va plan).

**A. Luong base (Phase 1 khong regression):**

- [ ] Vao `/nutrition-plan`. 3 MealCard hien thi, mac dinh expand bua sang.
- [ ] Click "Đổi món" mot slot -> drawer mo. Header hien ten slot + mon hien tai.
- [ ] List alternatives hien thi, co `unit (g)` o moi card neu BE da seed du lieu.

**B. Don vi Viet (Step 3, 4):**

- [ ] `FoodRow` o `MealCard`: dong khau phan hien dang `1 bát (200g) · 220 kcal` khi du lieu co `unit/baseServingG`.
- [ ] `AlternateCard` trong drawer: khau phan hien dang `1 bát (200g)` khi co `unit`.
- [ ] Format `0.75` o ket qua search hien thi `0.75` (KHONG ra `0.8`).

**C. Search box (Step 5, 7):**

- [ ] Drawer hien SearchBar (icon kinh lup trai, nut X phai khi co value).
- [ ] Go "com" -> sau 300ms, list cap nhat thanh ket qua search.
- [ ] Section heading doi sang `N kết quả cho "com"`.
- [ ] Card search khong hien score (vi `expectedScore = null`).
- [ ] Click nut X -> clear query, list ve alternatives mac dinh.
- [ ] Empty state khi search khong co ket qua -> hien icon + msg + nut "Xoá tìm kiếm".

**D. Serving stepper (Step 5, 7):**

- [ ] Chon mot mon -> ServingStepper hien o footer voi `serving = expectedServing`.
- [ ] Click `+` / `-` -> step 0.5. Min/Max snap dung boi 0.5 (vd expectedServing=1.5 -> max=2.0).
- [ ] Helper line cuoi stepper: `Bước 0.5 bát · Min 0.5 · Max 2`.
- [ ] Gram preview cap nhat dung `serving × baseServingG`.

**E. Apply + pin tich luy (Step 4, 5, 6, 7, 8, 9):**

- [ ] Click "Áp dụng & cân đối lại bữa" -> drawer dong, MealCard update.
- [ ] FoodRow cua slot vua apply hien badge `MapPinIcon` + vien trai `brand-green`.
- [ ] Header MealCard hien chip "1 món đã ghim".
- [ ] Mo drawer cho slot khac (cung bua) -> PinnedStrip hien chip mon vua pin (slot khac, khong phai slot dang mo).
- [ ] Apply slot thu 2 -> chip "2 món đã ghim". 2 FoodRow co badge pin.
- [ ] Click badge pin tren FoodRow -> bo pin. Chip header giam so. Lan apply tiep theo cua bua khong gui pin nay.

**F. Suggestion banner (Step 6, 9):**

- [ ] Khi swap lam diem giam, BE tra `suggestion` -> banner amber hien tren list food (icon `LightBulbIcon`).
- [ ] Click "Áp dụng gợi ý" -> drawer mo o slot goi y, mon goi y auto-select.
- [ ] Click X dismiss -> banner bien mat.
- [ ] Khi xem bua khac, banner KHONG hien (filter dung `mealType`).

**G. Warning carb-bomb (Step 7, 8, 9):**

- [ ] Mo drawer slot tinh bot (vd Cơm), chon mon, tang stepper len 3 bát.
- [ ] Click apply -> drawer KHONG dong, hien banner amber voi message warning va 2 nut.
- [ ] "Vẫn áp dụng" -> drawer dong, pin van apply.
- [ ] "Điều chỉnh lại" -> banner bien mat, stepper van con de user chinh, drawer mo.

**H. Regen plan reset pin (Step 8):**

- [ ] Pin vai mon -> click "Gen lại cả ngày" tren InfoStrip.
- [ ] Plan moi tra ve, chip pin biến mất, `pinsByMeal` reset.

Files changed:

- (khong sua code o Step 10)
- `doc/UserTuDeXuatContextFE.md` (cap nhat log)

Tong ket commit Phase 2 FE:

- `664039c` docs(nutrition): add user proposed meal FE context (Step 0)
- `737dfe3` feat(meal): extend types for user proposed meal feature (Step 1)
- `3a4a429` feat(meal): add dish search service for swap drawer (Step 2)
- `290a5e6` feat(meal): show Vietnamese serving unit and handle null score (Step 3)
- `a714d5d` feat(meal): add pin indicator and Vietnamese serving to FoodRow (Step 4)
- `18f7420` feat(meal): add search, pinned strip and serving stepper components (Step 5)
- `7b2fef6` feat(meal): add pin count chip and suggestion banner to MealCard (Step 6)
- `a8f9836` feat(meal): rewrite SwapDrawer with search, pinned strip and serving stepper (Step 7)
- `07b1939` feat(meal): add cumulative pin state and applyPin to useMealPlan (Step 8)
- `6097430` feat(meal): wire pin state and warning banner into MealRecommendationPage (Step 9)

Tat ca 10 commit nam tren branch `feature/UserTuDeXuat`. Commit `664039c`, `737dfe3`, `3a4a429` da push len remote (Step 2 push). Cac commit con lai chua push.

Review can user xac nhan:

- Chap nhan ket qua lint + build, hieu rang ESLint errors ngoai scope la tech debt co san.
- Lay checklist smoke test ra chay manual khi BE chay.
- Sau khi xong smoke test va dat: push noi dung con lai (commit 4-9) len remote va mo PR.
- Tach Step 11 (Sidebar collapse/expand) lam PR rieng.

---

## Trang thai tong the

- Phase 2 FE: hoan thanh 10/10 step.
- Tat ca code change da pass `tsc -b` va ESLint trong scope.
- Production build pass.
- Smoke test runtime: chua thuc hien (can user chay BE).
- Sidebar collapse/expand: chua bat dau, tach PR rieng theo thoa thuan.
