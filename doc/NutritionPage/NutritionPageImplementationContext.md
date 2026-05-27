# Nutrition Page Implementation Context

## Working Rules

- Implement one step at a time.
- Stop after each completed step for user review.
- Do not commit until the user approves the completed step.
- Update this context file after every completed step.
- Follow frontend repo convention from `CLAUDE.md`: code comments, commit messages, and variable names in English.

## Source Documents Read

- `doc/NutritionPage/HuongDanXayDungNutritionPage.md`
- `doc/NutritionPage/BE/codex-handoff.md`
- Backend DTO/controller files under `doc/NutritionPage/BE/HealthManagement`.

## Confirmed Backend Contract Notes

- Recommendation endpoints are available from `RecommendationController`:
  - `POST /api/recommendation/full-day`
  - `POST /api/recommendation/swap-dish`
  - `POST /api/meal-log/confirm`
  - `GET /api/meal-log/history?days=N`
- Favorite endpoints are available from `FavoriteDishController`:
  - `GET /api/favorite-dishes`
  - `POST /api/favorite-dishes/{dishId}`
  - `DELETE /api/favorite-dishes/{dishId}`
- Actual backend `MealType` enum is `SANG`, `PHU_SANG`, `TRUA`, `PHU_CHIEU`, `TOI`.
- Actual backend `RecommendFullDayRequest.perMealConfig` is a map keyed by backend `MealType`, not an array.
- Actual backend `SwapDishRequest` uses `swappedSlot`, not `targetSlotKey`.
- `DailyPlanResponse` contains `planDate`, `goalCode`, `planType`, `warning`, and `meals`.
- `MealSuggestionResponse` contains both `mealKcalTarget` and `kcalTarget`, plus `proteinTarget`, `fatTarget`, `carbTarget`.
- `DishSuggestionResponse` currently contains `dishKcal`, `actualGrams`, and `servingMultiplier`; it does not expose per-dish protein/fat/carb.
- `DishSuggestionResponse` and `DishOptionResponse` do not expose `imageUrl`.

## Contract Gaps To Handle Later

- Design expects per-dish macros (`protein`, `fat`, `carb`) but backend dish DTO does not return them.
- Design expects image URLs but backend dish DTOs do not return them.
- FE guide uses English meal type names, while backend uses Vietnamese enum codes.

## Step Log

### Step 0 - Contract Review And Context Setup

Status: completed, pending user review.

Work done:
- Read the main FE guide and backend reference files.
- Identified backend contract differences that affect frontend implementation.
- Created this context file.

### Step 1 - Meal Types

Status: committed.

Work done:
- Added `src/types/meal.types.ts`.
- Types mirror current backend DTO/request shapes instead of the older FE guide draft.
- Added separate UI-only state types for card status/expanded state.

Verification:
- `npm run build` passed.

Commit:
- `4b1b477 feat: add nutrition meal types`

### Step 2 - Constants

Status: committed.

Work done:
- Added `src/constants/foodGroup.constants.ts`.
- Added `src/constants/goal.constants.ts`.
- Added `src/constants/mealType.constants.ts`.
- Added `src/constants/score.constants.ts`.
- Added `src/constants/slotCode.constants.ts`.
- Constants use backend enum values confirmed from BE reference files.
- Included labels, meal ordering, meal icons, placeholder palettes, score tiers, and macro deviation helpers.

Verification:
- `npm run build` passed.

Commit:
- `209f1b0 feat: add nutrition constants`

### Step 3 - Service Layer

Status: committed.

Work done:
- Added `src/services/meal.service.ts`.
- Wrapped nutrition recommendation endpoints:
  - `POST /api/recommendation/full-day`
  - `POST /api/recommendation/swap-dish`
- Wrapped meal log endpoints:
  - `POST /api/meal-log/confirm`
  - `GET /api/meal-log/history`
- Wrapped favorite dish endpoints:
  - `GET /api/favorite-dishes`
  - `POST /api/favorite-dishes/{dishId}`
  - `DELETE /api/favorite-dishes/{dishId}`
- Used existing `apiClient` and `unwrapDataResponse` conventions.
- Did not catch errors in service functions; hooks/pages will handle toast/error UI later.

Verification:
- `npm run build` passed.

Commit:
- `5e6fbb1 feat: add nutrition meal service`

### Step 4 - Hooks

Status: committed.

Work done:
- Added `src/hooks/useUserContext.ts`.
  - Loads latest health data, current goal, and constitution.
  - Produces Nutrition-specific context: `goalCode`, `tdee`, `weight`, `height`, `constitution`, `bmi`, `warning`.
  - Marks `emptyHealthData` when required metrics are missing.
- Added `src/hooks/useMealPreferences.ts`.
  - Loads user preferences.
  - Detects first-time setup when `MEAL_PLAN_TYPE` is missing.
  - Saves plan type and per-meal config using existing `userPreferences.service.ts`.
  - Uses preference keys: `MEAL_PLAN_TYPE`, `BREAKFAST_CONFIG`, `SNACK_AM_CONFIG`, `LUNCH_CONFIG`, `SNACK_PM_CONFIG`, `DINNER_CONFIG`.
- Added `src/hooks/useMealPlan.ts`.
  - Generates full-day plans.
  - Restores/persists plan state in `sessionStorage` for 4 hours.
  - Supports swap, revert swap, dismiss score-drop event, confirm eaten, skip, and expand/collapse state.
  - Builds `pinnedDishes` from current meal dishes for swap requests.
- Updated `src/types/refactorUi.types.ts` to allow Nutrition preference keys.

Implementation notes:
- Hooks are logic-only and not connected to any page yet.
- `useMealPreferences` uses user-facing preference keys from the FE guide, then maps configs to backend `MealType` keys for recommendation requests.
- `useUserContext` still depends on current `healthData.service.ts`, which converts some API errors into plain `Error`; true 404 handling may need refinement if backend unavailable errors must be distinguished from missing health data.

Verification:
- `npm run build` passed.

Commit:
- `736db7b feat: add nutrition hooks`

### Step 5 - Common Spinner And Meal Atoms

Status: committed.

Work done:
- Added `src/components/common/Spinner.tsx`.
- Added meal atom components:
  - `DeltaPill`
  - `FoodGroupChip`
  - `FoodThumb`
  - `HeartButton`
  - `MacroBar`
  - `ScoreBadge`
  - `SlotChip`
  - `StatusPill`
- Atoms use existing constants and backend-based types.
- Kept dynamic inline styles only for score tier colors, food placeholder gradients, and macro progress colors.
- Did not implement the ring macro variant because the MVP guide says to use the default bar variant only.

Verification:
- `npm run build` passed.

Commit:
- `f434f51 feat: add nutrition meal atoms`

### Step 6 - InfoStrip And FooterSummary

Status: committed.

Work done:
- Added `src/components/meal/InfoStrip.tsx`.
  - Displays goal, TDEE, constitution, date, change-goal action, and regenerate action.
  - Uses `Spinner` when regenerate is loading.
  - Accepts already-formatted labels from page/hook layer.
- Added `src/components/meal/FooterSummary.tsx`.
  - Displays daily kcal/protein/fat/carb totals against targets.
  - Displays overall score via `ScoreBadge`.
  - Includes macro distribution donut using P*4, F*9, C*4.
- Kept these components presentation-only; plan aggregation will happen in page assembly or helpers later.

Verification:
- `npm run build` passed.

Commit:
- `9f7af8f feat: add nutrition summary components`

### Step 7 - MealCard And FoodRow

Status: committed.

Work done:
- Added `src/components/meal/FoodRow.tsx`.
  - Renders dish thumbnail, name, favorite button, slot chip, food group chip, grams, kcal, serving multiplier, and swap button.
- Added `src/components/meal/MealCard.tsx`.
  - Renders meal header, collapse/expand state, score, status, food rows, macro bar, skip action, and confirm eaten action.
  - Uses backend `MealType` labels/icons from constants.
  - Uses BE macro targets directly: `proteinTarget`, `fatTarget`, `carbTarget`.

Implementation notes:
- Per-dish protein/fat/carb are not shown because current BE `DishSuggestionResponse` does not expose those fields.
- Dish image URLs are not shown because current BE dish DTOs do not expose `imageUrl`; `FoodThumb` placeholder is used.

Verification:
- `npm run build` passed.

Commit:
- `59b81e7 feat: add nutrition meal card`

### Step 8 - SwapDrawer And AlternateCard

Status: committed.

Work done:
- Added `src/components/meal/AlternateCard.tsx`.
  - Renders a replacement dish option with placeholder thumbnail, food group, expected grams/serving, expected score, score delta, favorite button, and selected radio state.
- Added `src/components/meal/SwapDrawer.tsx`.
  - Desktop drawer slides from right with Framer Motion.
  - Mobile drawer behaves as a bottom sheet.
  - Supports empty alternatives state.
  - Supports suggestion banner and apply action.
  - Confirms by calling `onConfirm(newDishId)`.
- Kept sort UI non-interactive; BE already returns alternatives sorted by expected score.

Verification:
- `npm run build` passed.

Commit:
- `e9c1aab feat: add nutrition swap drawer`

### Step 9 - SetupWizard

Status: committed.

Work done:
- Added `src/components/meal/SetupWizard.tsx`.
- Wizard has 3 steps:
  - Choose plan type: `3_BUA` or `5_BUA`.
  - Configure each meal as `COMBO` or `NHIEU_MON`.
  - Review selected plan and per-meal configuration.
- Supports backend meal types:
  - `3_BUA`: `SANG`, `TRUA`, `TOI`.
  - `5_BUA`: `SANG`, `PHU_SANG`, `TRUA`, `PHU_CHIEU`, `TOI`.
- Emits `NutritionPreferences` through `onComplete(preferences)`.
- Component does not save preferences directly; page/hook layer will call `useMealPreferences.savePreferences`.

Verification:
- `npm run build` passed.

Commit:
- `5ae7107 feat: add nutrition setup wizard`

### Step 10 - Banners And Warning Modal

Status: committed.

Work done:
- Added `src/components/meal/banners/ScoreDropBanner.tsx`.
  - Shows original score, new score, score delta, keep action, and revert action.
- Added `src/components/meal/banners/SuggestionBanner.tsx`.
  - Shows suggested replacement and expected score, with apply and dismiss actions.
- Added `src/components/meal/banners/WarningGoalModal.tsx`.
  - Modal for goal/constitution warning with change-goal and continue actions.
  - Accepts either backend `DailyPlanWarningResponse` or a plain warning string.

Implementation notes:
- Components are not connected to page state yet.
- `WarningGoalModal` includes an `open` prop because the page outline renders it conditionally as a modal.

Verification:
- `npm run build` passed.

Commit:
- `318fd28 feat: add nutrition banners`

### Step 11 - Loading And Empty States

Status: committed.

Work done:
- Added `src/components/states/MealPlanLoadingSkeleton.tsx`.
  - Supports skeleton layout and centered spinner variant.
  - Includes meal card skeletons and footer skeleton.
- Added `src/components/states/MealPlanEmptyState.tsx`.
  - Shows empty health-data state with salad bowl illustration.
  - CTA navigates to `/submit-data`.
  - Includes checklist for required health metrics.
- Updated `src/index.css`.
  - Added `dbShimmer` keyframes and `.animate-db-shimmer` utility for skeleton loading.

Verification:
- `npm run build` passed.

Commit:
- `e99ce99 feat: add nutrition page states`

### Step 12 - Main Page Assembly

Status: committed.

Work done:
- Added `src/pages/MealRecommendationPage.tsx`.
  - Wires `useUserContext`, `useMealPreferences`, and `useMealPlan`.
  - Shows loading skeleton, empty health data state, info strip, meal cards, footer summary, setup wizard, warning modal, score-drop banner, and swap drawer.
  - Auto-generates a plan once after user context and preferences are available.
  - Handles wizard completion by saving preferences and letting the page auto-generate afterward.
  - Handles favorite add/remove with optimistic UI update and toast feedback.
- Updated `src/hooks/useMealPlan.ts`.
  - Added `setDishFavorite(dishId, favorite)` so page can update favorite state in current plan and alternatives after API calls.

Implementation notes:
- Route wiring is not done in this step; `App.tsx` still has the existing `/nutrition-plan` placeholder. Routing remains Step 13.
- Auto-generate is guarded with a ref to avoid repeated generate loops if backend returns an error.

Verification:
- `npm run build` passed.

Commit:
- `a553216 feat: assemble nutrition plan page`

### Step 13 - Routing

Status: completed, pending user review.

Work done:
- Updated `src/App.tsx`.
- Replaced `/nutrition-plan` placeholder with protected `MealRecommendationPage`.
- Sidebar already pointed to `/nutrition-plan`; no sidebar change was required.

Verification:
- `npm run build` passed.
