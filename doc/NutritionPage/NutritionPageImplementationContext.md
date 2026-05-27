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

Status: completed, pending user review.

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
