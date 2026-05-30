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

Status: DONE — cho user review.

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

Status: PENDING.

(Se cap nhat sau khi user xac nhan Step 1.)
