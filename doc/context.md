# Frontend Refactor Context

Last updated: 2026-05-27

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

### Step 11 - Polish UI Final Verification

Status: completed

Completed changes:

- Committed Phase 4 dashboard details polish in commit `ee03d45 feat(ui): phase 4 polish - collapsible details + greeting hero`.
- Ran final checks for all onboarding/dashboard polish phases from `doc/RefactorUI/HuongDanPolishUI.md`.

Verification:

- `npx tsc -b --pretty false` passed.
- Refactor/polish-scoped ESLint passed for:
  - onboarding shared components and steps changed in Phase 1-2;
  - dashboard cards/widgets changed in Phase 1, Phase 3, and Phase 4;
  - `src/pages/DashboardPage.tsx`.
- `npm run build` passed. Vite reported the existing large chunk warning.
- `npm run lint` still fails on pre-existing legacy lint issues outside the polish scope:
  - `src/components/dashboard/TrendChart.tsx`: `no-explicit-any`;
  - `src/contexts/AuthContext.tsx`: `no-explicit-any`, unused eslint-disable warning, fast-refresh warning;
  - `src/contexts/OnboardingContext.tsx`: fast-refresh warning;
  - `src/pages/HomePage.tsx`: `no-explicit-any`, unused eslint-disable warning, `prefer-const`;
  - `src/pages/LoginPage.tsx` and `src/pages/RegisterPage.tsx`: `no-explicit-any`;
  - `src/pages/SubmitHealthDataPage.tsx`: `no-explicit-any`, unused eslint-disable warning;
  - `src/pages/UserProfilePage.tsx`: unused schema value, `no-explicit-any`, missing hook dependency warning;
  - several `src/pages/adminPage/*ConfigPage.tsx` files: `no-explicit-any`;
  - `src/services/auth.service.ts`: unused `_c`;
  - `src/services/healthData.service.ts`: `no-explicit-any`, empty interface type.

Files touched:

- `doc/context.md`

Notes:

- All four polish phases are now committed.
- The only tracked change after this verification step should be this context log entry unless further edits are made.

### Step 12 - Tailwind v4 Brand Token Fix Phase A

Status: completed

Completed changes:

- Read `doc/RefactorUI/Onboarding/HuongDanFixTailwindV426_5.md` and verified the main root cause:
  - project uses Tailwind v4 packages;
  - `src/index.css` only imported Tailwind and did not define `@theme`;
  - brand colors were still only declared in the old `tailwind.config.ts`;
  - generated CSS did not contain `--color-brand-green` or `.bg-brand-green`.
- Added a Tailwind v4 `@theme` block to `src/index.css` so `brand-*` utilities are generated.
- Added the documented brand tokens:
  - `brand-green`, `brand-green-light`, `brand-green-dark`, `brand-green-darker`;
  - `brand-gray`, `brand-gray-light`, `brand-gray-dark`;
  - `font-sans`.
- Added extra token `brand-green-medium` because existing legacy files already use classes such as `focus:border-brand-green-medium` and `focus:ring-brand-green-medium`.
- Kept `tailwind.config.ts` unchanged for this phase to avoid cleanup risk before visual review.
- Did not add `@plugin "@tailwindcss/forms";` in this phase because form plugin side effects should be verified separately.

Verification:

- `npx tsc -b --pretty false` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.
- Verified generated CSS contains:
  - `--color-brand-green:#059669`;
  - `--color-brand-green-medium:#10b981`;
  - `.bg-brand-green`;
  - `.text-brand-green`;
  - `.focus\:ring-brand-green-light:focus`.
- `npx eslint src\index.css` does not lint CSS in the current ESLint config and reports the file as ignored; no JS/TS lint check is applicable for this CSS-only phase.

Files touched:

- `src/index.css`
- `doc/context.md`

Notes:

- This phase addresses the blocker where Tailwind v4 skipped custom brand utility generation.
- Bonus onboarding animations, WizardProgress changes, Step 4 checkmark changes, page transitions, and config cleanup are intentionally deferred to later phases.

### Step 13 - Onboarding Polish Bonus Phase B

Status: completed

Completed changes:

- Updated `WizardProgress` completed state:
  - increased step node size from `h-8 w-8` to `h-9 w-9`;
  - changed completed state to solid brand-green with white checkmark;
  - added a soft brand-green shadow and longer transition.
- Updated Step 2 goal selected checkmark:
  - increased selected badge to `h-7 w-7`;
  - added brand-green shadow;
  - added `wizardPop` animation.
- Updated Step 4 activity selected state:
  - replaced the radio dot with a checkmark SVG;
  - matched Step 2 badge sizing and animation.
- Updated onboarding input styles:
  - changed transition to `transition-all duration-200 ease-out`;
  - added hover border feedback;
  - added brand-green focus ring;
  - made error fields return to white background on focus.
- Added shared `@keyframes wizardPop` in `src/index.css`.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\onboarding\shared\WizardProgress.tsx src\components\onboarding\steps\Step2Goal.tsx src\components\onboarding\steps\Step4Activity.tsx src\components\onboarding\shared\formStyles.ts` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.
- Verified generated CSS contains:
  - `@keyframes wizardPop`;
  - `.focus\:ring-brand-green-light:focus`;
  - `.shadow-brand-green\/30`;
  - `.duration-200`.

Files touched:

- `src/components/onboarding/shared/WizardProgress.tsx`
- `src/components/onboarding/steps/Step2Goal.tsx`
- `src/components/onboarding/steps/Step4Activity.tsx`
- `src/components/onboarding/shared/formStyles.ts`
- `src/index.css`
- `doc/context.md`

Notes:

- This phase only covers Phase B from `doc/RefactorUI/Onboarding/HuongDanFixTailwindV426_5.md`.
- Page transitions with Framer Motion and Tailwind config cleanup are still deferred.

### Step 14 - Onboarding Page Transition Phase C

Status: completed

Completed changes:

- Committed Phase B onboarding polish in commit `0904c5f feat(ui): polish wizard step indicator and checkmarks`.
- Added Framer Motion `AnimatePresence` and `motion.div` around onboarding step rendering.
- Added direction-aware transition handling:
  - next/edit-forward transitions enter from the right and exit to the left;
  - back/edit-backward transitions enter from the left and exit to the right.
- Kept existing onboarding step guard and URL sync behavior.

Verification:

- Initial TypeScript check caught Framer Motion type mismatch when using function values directly in `initial` and `exit`.
- Fixed the mismatch by moving direction-aware motion values into typed `Variants`.
- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\onboarding\OnboardingWizard.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/components/onboarding/OnboardingWizard.tsx`
- `doc/context.md`

Notes:

- This phase covers Phase C from `doc/RefactorUI/Onboarding/HuongDanFixTailwindV4_v1.1.md`.
- Tailwind config cleanup remains deferred.

### Step 15 - Tailwind Config Deprecated Reference Phase D

Status: completed

Completed changes:

- Committed Phase C onboarding transitions in commit `470b3ed feat(ui): smooth onboarding step transitions`.
- Updated `tailwind.config.ts` to make its deprecated status explicit.
- Kept the file as a reference and rollback aid instead of deleting it.
- Added `brand-green.medium` to the reference config so it matches the Tailwind v4 `@theme` block in `src/index.css`.
- Updated reference font stack to match the active `--font-sans` token.
- Did not add `@plugin "@tailwindcss/forms";` to `src/index.css` because no form plugin regression has been verified.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint tailwind.config.ts` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.
- Verified generated CSS still contains:
  - `--color-brand-green:#059669`;
  - `--color-brand-green-medium:#10b981`;
  - `.bg-brand-green`;
  - `.text-brand-green`.

Files touched:

- `tailwind.config.ts`
- `doc/context.md`

Notes:

- Runtime Tailwind v4 tokens still live in `src/index.css`.
- This phase is cleanup/documentation only and should not change generated CSS behavior.

### Step 16 - Compact Handoff Summary

Status: completed

Current branch:

- `feature/onboarding-dashboard-fe`

Latest completed commits:

- `6734fba fix(ui): migrate brand tokens to Tailwind v4 theme`
- `0904c5f feat(ui): polish wizard step indicator and checkmarks`
- `470b3ed feat(ui): smooth onboarding step transitions`

Current uncommitted work at the time of this handoff:

- `tailwind.config.ts`: Phase D deprecated-reference cleanup.
- `doc/context.md`: Step 15 and Step 16 logs.

Untracked guide files intentionally not staged:

- `doc/RefactorUI/HuongDanPolishUI.md`
- `doc/RefactorUI/Onboarding/HuongDanFixTailwindV426_5.md`
- `doc/RefactorUI/Onboarding/HuongDanFixTailwindV4_v1.1.md`

Completed scope:

- Phase A: Tailwind v4 `@theme` brand token fix in `src/index.css`.
- Phase B: onboarding wizard progress/checkmark/input polish.
- Phase C: direction-aware Framer Motion page transitions.
- Phase D: `tailwind.config.ts` marked deprecated and kept as reference.

Verification summary:

- TypeScript checks passed after each phase.
- Scoped ESLint checks passed after each phase.
- Production build passed after each phase; Vite still reports the existing large chunk warning.
- Generated CSS contains active brand tokens/classes from `src/index.css`, including `brand-green-medium`.

Recommended next actions:

- Commit Phase D + handoff logs.
- Push the branch if user wants remote updated.
- Do not add `@plugin "@tailwindcss/forms"` unless a real form regression is observed.
- Do not stage untracked guide files unless the user explicitly asks to version them.

### Step 17 - Dashboard Completion Phase 1 Service Layer

Status: completed

Completed changes:

- Read `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` and scoped Phase 1 to the service layer only.
- Added `src/services/mealLog.service.ts` for `GET /api/meal-log/history?days=7`.
- Added shared meal-log types:
  - `MealType`;
  - `PlanType`;
  - `MealLogHistoryItem`.
- Updated `DashboardOverview` with `mealLogHistory: MealLogHistoryItem[]`.
- Wired `getMealLogHistory(7)` into `getDashboardOverview()`.
- Kept the existing `collect()` pattern in `dashboard.service.ts` instead of switching to `Promise.allSettled`.
- Added a meal-log-specific fallback error message for future `ComplianceCard` rendering.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\services\mealLog.service.ts src\services\dashboard.service.ts` passed.

Files touched:

- `src/services/mealLog.service.ts`
- `src/services/dashboard.service.ts`
- `doc/context.md`

Notes:

- This phase does not add the `ComplianceCard` UI yet.
- This phase does not change Dashboard layout yet.
- `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` is an untracked guide file and was not staged.

### Step 18 - Dashboard Completion Phase 2 ComplianceCard

Status: completed

Completed changes:

- Committed Phase 1 service-layer work in commit `afa0e0c feat(dashboard): add meal log history service`.
- Added `src/components/dashboard/ComplianceCard.tsx` for Widget 2B "Đã có thực đơn · 7 ngày".
- Implemented data grouping by `mealDate` with `Map<string, Set<MealType>>`.
- Rendered a 7-day Monday-to-Sunday compliance grid with 3 meals for `3_BUA` or 5 meals for `5_BUA`.
- Added plan inference from real meal-log data, defaulting to `3_BUA` when no `5_BUA` data exists.
- Used local date formatting for week-date keys instead of `toISOString()` to avoid UTC timezone date drift.
- Added defensive meal-type filtering so unknown backend enum values do not break rendering.
- Added widget states:
  - error state;
  - empty state with CTA to `/nutrition-plan`;
  - data state with right-side total, percentage, progress bar, tooltip titles, and legend.
- Kept this widget independent; it is not wired into `DashboardPage.tsx` until Phase 3.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\components\dashboard\ComplianceCard.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/components/dashboard/ComplianceCard.tsx`
- `doc/context.md`

Notes:

- Phase 2 is complete but not committed yet; waiting for user review.
- Phase 3 should import `ComplianceCard` in `DashboardPage.tsx`, pass `overview?.mealLogHistory ?? []`, and reorganize the Dashboard layout.
- `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` remains an untracked guide file and was not staged.

### Step 19 - Dashboard Completion Phase 3 Layout Alignment

Status: completed

Completed changes:

- Committed Phase 2 `ComplianceCard` work in commit `67277ac feat(dashboard): build compliance card`.
- Imported `ComplianceCard` into `DashboardPage.tsx`.
- Reorganized Dashboard content to match the design guide layout:
  - Greeting hero remains full width at the top.
  - Row 1: `ConstitutionCard` left and `ReminderList` right with `xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]`.
  - Row 2: `WeightChartCard` full width.
  - Row 3: `ComplianceCard` left and `MetricSummaryGrid` right with `xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]`.
  - Row 4: `HealthMetricsDetails` full width.
- Wired `ComplianceCard` to real dashboard overview data:
  - `data={overview?.mealLogHistory ?? []}`;
  - `error={overview?.errors.mealLogHistory}`.
- Updated `DashboardSkeleton` so loading state matches the new row structure and card radii.
- Kept the outer Dashboard content spacing as `space-y-5`.

Verification:

- `npx tsc -b --pretty false` passed.
- `npx eslint src\pages\DashboardPage.tsx src\components\dashboard\ComplianceCard.tsx` passed.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `src/pages/DashboardPage.tsx`
- `doc/context.md`

Notes:

- Phase 3 is complete but not committed yet; waiting for user review.
- Manual browser responsive verification was not run in this phase.
- Phase 4 should do final spacing/polish verification and optional browser review.
- `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` remains an untracked guide file and was not staged.

### Step 20 - Dashboard Completion Phase 4 Polish Verification

Status: completed

Completed changes:

- Committed Phase 3 layout alignment in commit `cca74de refactor(dashboard): align layout to design spec`.
- Rechecked the Dashboard polish requirements from `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md`.
- Verified `DashboardPage.tsx` already matches the required polish structure:
  - outer content uses `space-y-5`;
  - greeting hero uses `rounded-3xl`;
  - desktop row grids use the documented asymmetric `xl:grid-cols-[...]` values;
  - `HealthMetricsDetails` remains full width after the Compliance/Metric row.
- Verified `DashboardCard` still provides `rounded-2xl`, uppercase title typography, `info`, and `rightAction` support.
- Verified `ComplianceCard` uses the shared `DashboardCard` wrapper, a green gradient progress bar, and a 7-column day grid.
- No component code changes were needed in Phase 4.

Verification:

- `npx tsc -b --pretty false` passed.
- Scoped Dashboard ESLint passed for:
  - `src/pages/DashboardPage.tsx`;
  - `src/components/dashboard/DashboardCard.tsx`;
  - `src/components/dashboard/ComplianceCard.tsx`;
  - `src/components/dashboard/ConstitutionCard.tsx`;
  - `src/components/dashboard/WeightChartCard.tsx`;
  - `src/components/dashboard/MetricSummaryGrid.tsx`;
  - `src/components/dashboard/HealthMetricsDetails.tsx`;
  - `src/components/dashboard/ReminderList.tsx`.
- `npm run build` passed. Vite reported the existing large chunk warning.

Files touched:

- `doc/context.md`

Notes:

- Phase 4 is complete but not committed yet; waiting for user review.
- Manual browser responsive verification was not run in this phase.
- `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` remains an untracked guide file and was not staged.

### Step 21 - Dashboard Completion Compact Handoff

Status: completed

Current branch:

- `feature/onboarding-dashboard-fe`

Latest Dashboard completion commits:

- `afa0e0c feat(dashboard): add meal log history service`
- `67277ac feat(dashboard): build compliance card`
- `cca74de refactor(dashboard): align layout to design spec`
- `9a7707f chore(dashboard): record polish verification`

Completed Dashboard scope from `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md`:

- Phase 1: added `mealLog.service.ts` and wired `mealLogHistory` into `getDashboardOverview()`.
- Phase 2: added `ComplianceCard` for Widget 2B with real meal-log data, 3/5 meal support, error state, empty state, progress bar, tooltips, and legend.
- Phase 3: aligned `DashboardPage` layout to the design:
  - hero full width;
  - Constitution + Reminders;
  - Weight chart full width;
  - Compliance + Metric Summary;
  - Health metrics details full width.
- Phase 4: verified Dashboard spacing, radii, wrapper usage, and scoped build/lint checks.

Verification summary:

- `npx tsc -b --pretty false` passed for each Dashboard completion phase.
- Scoped ESLint passed for the touched Dashboard service/page/widget files.
- `npm run build` passed after Phase 2, Phase 3, and Phase 4. Vite still reports the existing large chunk warning.

Current notes for next session:

- No implementation phase remains in `ChinhSuaDashBoard.md`.
- Manual browser responsive verification with real backend data has not been run in this session.
- `doc/RefactorUI/Dashboard/ChinhSuaDashBoard.md` is still an untracked guide file and was intentionally not staged.
