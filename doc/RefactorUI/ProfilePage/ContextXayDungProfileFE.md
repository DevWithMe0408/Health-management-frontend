# Context xay dung Profile Page FE

Ngay tao: 2026-05-27

Muc dich file nay:
- Ghi lai tien do FE khi rebuild trang `/profile`.
- Lam context ngan gon de tiep tuc neu session bi rut gon.
- Truy vet tung step, file da sua, verify da chay, va cac viec chua lam.

## Quyet dinh da chot voi user

- Thay hoan toan `UserProfilePage.tsx` cu bang Profile page moi.
- Backend da duoc user test Postman va API ok.
- `GoalChangeModal` MVP chi chon `GIAM` / `DUY_TRI` / `TANG`, gui `targetDurationMonths: 6`, khong them input `targetWeightKg`.
- Lam tung step, dung lai sau moi step de user review.
- Chi commit sau khi user review va dong y.

## Step FE-0 - Regression update healthData.service.ts

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Chi sua `src/services/healthData.service.ts`.
- Chua dung route `/profile`.
- Chua dung `UserProfilePage.tsx`.
- Chua tao Profile UI/service layer moi.

Ly do:
- Backend health-data da refactor cac endpoint lien quan sang `DataResponse<T>`.
- `src/services/healthData.service.ts` cu van parse raw `response.data`, co nguy co lam hong cac man hinh hien co sau BE merge.
- Strategy la dung `unwrapDataResponse()` de support ca 2 shape: raw cu va `DataResponse<T>` moi.

File da sua:
- `src/services/healthData.service.ts`

Noi dung da sua:
- Them import:
  - `unwrapDataResponse` tu `./apiResponse`
  - type `DataResponse` tu `./apiResponse`
- Cap nhat `getLatestHealthData()`:
  - Axios response type: `DataResponse<LatestHealthDataApiResponse> | LatestHealthDataApiResponse`
  - Return `unwrapDataResponse(response.data)`
- Cap nhat `getDashboardMetrics()`:
  - Axios response type: `DataResponse<DashboardMetricsApiResponse> | DashboardMetricsApiResponse`
  - Return `unwrapDataResponse(response.data)`
- Cap nhat `getHistoricalHealthData()`:
  - Axios response type: `DataResponse<HistoricalDataApiResponse> | HistoricalDataApiResponse`
  - Return `unwrapDataResponse(response.data)`

Expected affected consumers:
- `src/pages/SubmitHealthDataPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/dashboard/TrendChart.tsx`

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.

Manual can verify sau khi BE/dev server san sang:
  - `/submit-data` load latest metrics ok.
  - `/dashboard` render dashboard ok.
  - Trend chart render history ok.

## Cac step chua lam

- FE-2: route/page replacement va Header label.
- FE-3: shared atoms va 6 sections.
- FE-4: GoalChangeModal va ProfileSkeleton.
- FE-5: integration/manual test full flow.

## Step FE-1 - Service layer cho Profile

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Cap nhat type/service can cho Profile page.
- Chua dung route `/profile`.
- Chua thay `UserProfilePage.tsx`.
- Chua tao UI components.

Files da sua:
- `src/services/auth.service.ts`
- `src/services/userGoals.service.ts`
- `src/services/user.service.ts`

Files moi:
- `src/services/password.service.ts`
- `src/services/profile.service.ts`

Noi dung da sua/them:
- `UserProfileData` them:
  - `email?: string | null`
  - `createdAt?: string | null`
- `UserGoalResponse` them:
  - `startWeightKg: number | null`
- `getCurrentGoal()`:
  - Support response raw hoac `DataResponse<UserGoalResponse>`.
  - Handle `404` hoac BE business code `GOAL-001` thanh `null` de Profile render empty state.
- `getGoalHistory()`:
  - Support response raw hoac `DataResponse<UserGoalResponse[]>`.
- `user.service.ts`:
  - Them `UpdateProfilePayload`.
  - Them `updateUserProfile(payload)` goi `PUT /api/user/profile` bang `apiClient`.
  - Giu nguyen API cu `getUserAccountDetails()` / `updateUserAccountDetails()` de tranh pha man hien tai trong step nay.
- `password.service.ts`:
  - Them `changePassword({ currentPassword, newPassword })`.
  - Khong co `confirmPassword` trong service payload.
- `profile.service.ts`:
  - Them `getProfileOverview()`.
  - Load song song current goal, goal history, preferences, dashboard metrics, constitution.
  - Dung `Promise.allSettled()` de page co the render partial data.
  - Gom loi rieng vao `errors`.

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.
