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
