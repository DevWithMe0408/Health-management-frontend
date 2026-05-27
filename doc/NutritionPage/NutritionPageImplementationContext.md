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

Status: completed, pending user review.

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
