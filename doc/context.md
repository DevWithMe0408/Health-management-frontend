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

### Step 4 - Onboarding UI

Status: completed

Completed changes:

- Added `OnboardingContext` with sessionStorage persistence and step state.
- Added onboarding Zod schemas for goal, personal info, activity/basic metrics, and optional measurements.
- Replaced the temporary `OnboardingWizardPage` placeholder with `OnboardingProvider` + `OnboardingWizard`.
- Added production Tailwind onboarding layout and shared components: shell, card, progress, field, nav row, and form style helper.
- Added all five wizard steps:
  - Step 1: welcome/start
  - Step 2: goal selection
  - Step 3: personal profile
  - Step 4: height/weight/activity
  - Step 5: optional measurements, review, submit
- Added `GoalRecommendationModal` for backend suggested-goal mismatch after onboarding submit.
- Wired Step 5 to `submitOnboarding()`, `refreshUser()`, session reset, and navigation to `/dashboard`.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\onboarding src\contexts\OnboardingContext.tsx src\types\onboarding.schemas.ts src\pages\OnboardingWizardPage.tsx` passed with 0 errors and 1 fast-refresh warning on `OnboardingContext.tsx`.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/contexts/OnboardingContext.tsx`
- `src/types/onboarding.schemas.ts`
- `src/pages/OnboardingWizardPage.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/components/onboarding/GoalRecommendationModal.tsx`
- `src/components/onboarding/shared/OnboardingShell.tsx`
- `src/components/onboarding/shared/WizardCard.tsx`
- `src/components/onboarding/shared/WizardField.tsx`
- `src/components/onboarding/shared/WizardNavRow.tsx`
- `src/components/onboarding/shared/WizardProgress.tsx`
- `src/components/onboarding/shared/formStyles.ts`
- `src/components/onboarding/steps/Step1Welcome.tsx`
- `src/components/onboarding/steps/Step2Goal.tsx`
- `src/components/onboarding/steps/Step3Personal.tsx`
- `src/components/onboarding/steps/Step4Activity.tsx`
- `src/components/onboarding/steps/Step5Review.tsx`
- `doc/context.md`

Notes:

- Full `npm run lint` still fails due pre-existing lint errors in legacy files such as `HomePage`, auth/register/login pages, admin pages, and `healthData.service.ts`.
- This step does not implement the new dashboard UI.

### Step 5 - Dashboard UI

Status: completed

Completed changes:

- Added new `DashboardPage` and routed `/dashboard` to it through the existing `MainLayout`.
- Left legacy `HomePage.tsx` in place, but it is no longer used by the main dashboard route.
- Added dashboard widget components:
  - `DashboardCard`
  - `ConstitutionCard`
  - `WeightChartCard`
  - `MetricSummaryGrid`
  - `HealthMetricsDetails`
  - `ReminderList`
- Wired dashboard UI to `getDashboardOverview()`.
- Rendered constitution state from BE instead of duplicating classification logic in FE.
- Added empty/error states for missing constitution and weight history.
- Added dashboard reminders using available profile, metrics, weight history, and current goal data.
- Added CTA links to existing routes such as `/submit-data`, `/profile`, and `/nutrition-plan`.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\pages\DashboardPage.tsx src\components\dashboard\DashboardCard.tsx src\components\dashboard\ConstitutionCard.tsx src\components\dashboard\WeightChartCard.tsx src\components\dashboard\MetricSummaryGrid.tsx src\components\dashboard\HealthMetricsDetails.tsx src\components\dashboard\ReminderList.tsx src\App.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/pages/DashboardPage.tsx`
- `src/App.tsx`
- `src/components/dashboard/DashboardCard.tsx`
- `src/components/dashboard/ConstitutionCard.tsx`
- `src/components/dashboard/WeightChartCard.tsx`
- `src/components/dashboard/MetricSummaryGrid.tsx`
- `src/components/dashboard/HealthMetricsDetails.tsx`
- `src/components/dashboard/ReminderList.tsx`
- `doc/context.md`

Notes:

- Meal-log and favorite-dish widgets from the full dashboard spec are not wired yet because this step uses only the service endpoints prepared in Step 3.
- Full `npm run lint` still has pre-existing legacy failures outside the Step 5 files.

### Step 6 - Final Verification

Status: completed

Completed checks:

- Ran TypeScript build check across the project.
- Ran ESLint on all files added or modified by the onboarding/dashboard refactor.
- Ran production build.
- Ran full repository lint to document existing repository lint state.
- Started Vite dev server for browser review.

Verification:

- `npx tsc -b --pretty false` passed.
- Refactor-scoped ESLint passed with 0 errors and 1 warning:
  - `src/contexts/OnboardingContext.tsx`: fast-refresh warning because the file exports both provider and hook, matching the existing `AuthContext` pattern.
- `npm run build` passed. Vite reported the existing large chunk warning.
- `npm run lint` failed on pre-existing legacy lint issues outside the new refactor files, including `HomePage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `SubmitHealthDataPage.tsx`, `UserProfilePage.tsx`, several admin pages, `TrendChart.tsx`, `AuthContext.tsx`, `auth.service.ts`, and `healthData.service.ts`.
- Dev server started at `http://127.0.0.1:5173/`.

Files touched:

- `doc/context.md`

Runtime artifacts:

- `vite-dev.log`
- `vite-dev.err.log`

Notes:

- The Vite dev server is running from this workspace on port `5173`.
- Runtime log files should not be committed unless intentionally needed.

### Step 7 - Polish UI Phase 1 Quick Wins

Status: completed

Completed changes:

- Updated `WizardCard` to use larger rounded corners and a softer multi-layer shadow.
- Updated `DashboardCard` visual hierarchy:
  - card radius changed from `rounded-lg` to `rounded-2xl`;
  - card titles now render as small uppercase section labels;
  - added optional `subtitle` and `info` props for later dashboard polish phases.
- Updated onboarding shell brand mark from the `HC` text box to a gradient plus icon and split-color `HealthCare` wordmark.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\onboarding\shared\WizardCard.tsx src\components\onboarding\shared\OnboardingShell.tsx src\components\dashboard\DashboardCard.tsx` passed.

Files touched:

- `src/components/onboarding/shared/WizardCard.tsx`
- `src/components/onboarding/shared/OnboardingShell.tsx`
- `src/components/dashboard/DashboardCard.tsx`
- `doc/context.md`

Notes:

- This step only changes presentation for Phase 1 of `doc/RefactorUI/HuongDanPolishUI.md`.
- Service layer, routing, validation, onboarding submit flow, and dashboard data flow were left unchanged.

### Step 8 - Polish UI Phase 2 Onboarding Visual Identity

Status: completed

Completed changes:

- Committed Phase 1 quick wins in commit `c2925a7 feat(ui): phase 1 polish - card radius + title typography`.
- Rebuilt onboarding welcome screen as a free layout instead of a wizard card:
  - added time pill;
  - added gradient `HealthCare` headline;
  - added three value cards with SVG icons;
  - upgraded CTA styling and privacy microcopy.
- Updated goal selection to a responsive 3-column card grid with SVG goal icons and selected checkmark.
- Replaced gender dropdown with a 3-option segmented control.
- Updated activity selection cards with large emoji markers, larger radius, and selected radio indicator.
- Added Step 5 measurement info banner and changed review edit action from text to a pencil icon button.
- Upgraded onboarding input style to rounded, 2px bordered, larger touch targets.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\onboarding\steps\Step1Welcome.tsx src\components\onboarding\steps\Step2Goal.tsx src\components\onboarding\steps\Step3Personal.tsx src\components\onboarding\steps\Step4Activity.tsx src\components\onboarding\steps\Step5Review.tsx src\components\onboarding\shared\formStyles.ts` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/components/onboarding/steps/Step1Welcome.tsx`
- `src/components/onboarding/steps/Step2Goal.tsx`
- `src/components/onboarding/steps/Step3Personal.tsx`
- `src/components/onboarding/steps/Step4Activity.tsx`
- `src/components/onboarding/steps/Step5Review.tsx`
- `src/components/onboarding/shared/formStyles.ts`
- `doc/context.md`

Notes:

- This step only changes onboarding presentation for Phase 2 of `doc/RefactorUI/HuongDanPolishUI.md`.
- Onboarding state, validation schemas, routing, submit service, goal mismatch modal, and dashboard navigation were left unchanged.

### Step 9 - Polish UI Phase 3 Dashboard Widgets

Status: completed

Completed changes:

- Committed Phase 2 onboarding polish in commit `01c81eb feat(ui): phase 2 polish - onboarding visual identity`.
- Updated `ConstitutionCard`:
  - replaced generic Heroicons in the data state with custom SVG glyphs for thin/check/warn groups;
  - added constitution-specific advice copy;
  - added DashboardCard `info` tooltip text;
  - updated PBF source badge display;
  - changed warning banner to include a direct update CTA;
  - added footer with computed date and detail link.
- Updated BMI scale:
  - segment widths now follow BMI thresholds 14/18.5/23/25/30 instead of equal 25% widths;
  - labels now show numeric thresholds.
- Updated `ReminderList`:
  - replaced generic icons with emoji markers;
  - added card subtitle and `Xem tất cả` action;
  - added a dismiss icon button placeholder;
  - added an empty state when there are no reminders;
  - kept the existing weight-rising reminder and added an emoji for it.
- Updated `MetricSummaryGrid` so values are visually dominant, labels are smaller uppercase text, and cards use larger radius.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\dashboard\ConstitutionCard.tsx src\components\dashboard\ReminderList.tsx src\components\dashboard\MetricSummaryGrid.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/components/dashboard/ConstitutionCard.tsx`
- `src/components/dashboard/ReminderList.tsx`
- `src/components/dashboard/MetricSummaryGrid.tsx`
- `doc/context.md`

Notes:

- This step only changes dashboard widget presentation for Phase 3 of `doc/RefactorUI/HuongDanPolishUI.md`.
- Dashboard services, backend contracts, and `DashboardPage` data loading were left unchanged.

### Step 10 - Polish UI Phase 4 Dashboard Details

Status: completed

Completed changes:

- Committed Phase 3 dashboard widget polish in commit `4587187 feat(ui): phase 3 polish - dashboard widgets visual`.
- Reworked `HealthMetricsDetails` into a collapsible panel:
  - collapsed state shows a compact preview for BMR, TDEE, PBF, and WHR;
  - expanded state shows metric cards;
  - added tooltip text for BMI, BMR, TDEE, PBF, and WHR;
  - preserved existing metrics error display inside the expanded panel.
- Updated dashboard greeting hero:
  - richer rounded gradient container;
  - greeting now includes hand emoji;
  - current goal uses goal-specific emoji and uppercase label;
  - PBF method is shown as a compact pill;
  - update CTA uses the lighter white/emerald style from the polish guide.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\dashboard\HealthMetricsDetails.tsx src\pages\DashboardPage.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/components/dashboard/HealthMetricsDetails.tsx`
- `src/pages/DashboardPage.tsx`
- `doc/context.md`

Notes:

- This step only changes presentation for Phase 4 of `doc/RefactorUI/HuongDanPolishUI.md`.
- Dashboard fetching, route structure, and backend contracts were left unchanged.
