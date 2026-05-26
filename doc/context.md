# Frontend Refactor Context

Last updated: 2026-05-26

Purpose: track the implementation of the Onboarding and Dashboard refactor so the work can be reviewed step by step and recovered after context/session loss.

## Source Documents

- `doc/RefactorUI/implementation_context.md`: latest backend implementation state. Treat this as the current backend contract.
- `doc/RefactorUI/HuongDanXayDungOnboarding.md`: frontend onboarding implementation guide adapted to this repo.
- `doc/RefactorUI/onboarding_spec.md`: original onboarding product/design spec.
- `doc/RefactorUI/dashboard_spec_v3.md`: dashboard product/design spec.
- `doc/RefactorUI/backend_endpoint_spec_v3.md`: backend endpoint details and history.

## Working Rules

- Implement one step at a time, then stop for user review before continuing.
- Do not commit automatically.
- Keep UI copy in Vietnamese for user-facing onboarding/dashboard surfaces.
- Keep backend enums and API payload values exactly as specified, for example `GIAM`, `DUY_TRI`, `TANG`, `MALE`, `FEMALE`, `OTHER`.
- Prefer current backend state from `implementation_context.md` when older specs disagree.

## Step Log

### Step 1 - Auth Contract Foundation

Status: completed

Completed changes:

- Extend frontend `UserProfileData` to include profile fields returned by `GET /api/user/currentUser`.
- Add `refreshUser()` to `AuthContext` so onboarding can refresh `profileCompleted` after successful submit.
- Create this context log file.

Verification:

- `npx tsc -b --pretty false` passed.

Files touched:

- `src/services/auth.service.ts`
- `src/contexts/AuthContext.tsx`
- `doc/context.md`

Notes:

- This step does not add onboarding routes or UI.
- This step does not replace the current dashboard page.

### Step 2 - Onboarding Routing Guards

Status: completed

Completed changes:

- Added `OnboardingRoute` for `/onboarding/wizard`.
- Updated `ProtectedRoute` so authenticated users with `profileCompleted === false` are redirected to `/onboarding/wizard`.
- Added the `/onboarding/wizard` route in `App.tsx`.
- Added a minimal `OnboardingWizardPage` placeholder so routing can compile before the full onboarding UI step.

Verification:

- `npx tsc -b --pretty false` passed.

Files touched:

- `src/components/common/OnboardingRoute.tsx`
- `src/components/common/ProtectedRoute.tsx`
- `src/pages/OnboardingWizardPage.tsx`
- `src/App.tsx`
- `doc/context.md`

Notes:

- The placeholder page is temporary and should be replaced in the onboarding UI step.
- Login still navigates to `/dashboard`; `ProtectedRoute` performs the onboarding redirect when needed.

### Step 3 - Service Layer Foundation

Status: completed

Completed changes:

- Added shared `DataResponse<T>` unwrap/error helpers for backend wrapped responses.
- Added shared refactor UI types for gender, goal, constitution, PBF method, preference key, and onboarding base metric names.
- Added user goal service for `GET/PUT /api/user-goals/current` and `GET /api/user-goals/history`.
- Added user preference service for `GET/PUT/DELETE /api/user-preferences`.
- Added constitution service for `GET /api/health-data/constitution` with retry support for temporary 422 sync states.
- Added onboarding submit service that performs the backend write flow: profile update, health metrics submit, goal update, profile-completed mark, then constitution fetch.
- Added dashboard service foundation for dashboard metrics, weight history, current goal, preferences, and constitution aggregation.

Verification:

- `npx tsc -b --pretty false` passed.

Files touched:

- `src/services/apiResponse.ts`
- `src/types/refactorUi.types.ts`
- `src/services/userGoals.service.ts`
- `src/services/userPreferences.service.ts`
- `src/services/constitution.service.ts`
- `src/services/onboarding.service.ts`
- `src/services/dashboard.service.ts`
- `doc/context.md`

Notes:

- No UI was wired to these services yet.
- Existing legacy `healthData.service.ts` was left unchanged to avoid breaking current pages.
- Dashboard service intentionally uses BE constitution classification and does not reimplement body classification logic in FE.
