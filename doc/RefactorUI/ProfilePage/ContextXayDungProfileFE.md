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

- FE-4: ProfileSkeleton va polish.
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

## Step FE-2 - Route/page replacement va Header label

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Thay `/profile` sang Profile page shell moi.
- Xoa page profile cu khoi source.
- Doi label user menu trong Header.
- Chua tao shared atoms.
- Chua tao 6 sections.
- Chua tao modal/skeleton that.

Files da sua:
- `src/App.tsx`
- `src/components/layout/Header.tsx`

Files moi:
- `src/pages/ProfilePage.tsx`

Files da xoa:
- `src/pages/UserProfilePage.tsx`

Noi dung da sua/them:
- `src/App.tsx`:
  - Import `ProfilePage` thay cho `UserProfilePage`.
  - Route `/profile` render `<ProfilePage />` trong `MainLayout`.
- `src/components/layout/Header.tsx`:
  - Link dropdown `/profile` doi label tu `Thong tin tai khoan` sang `Ho so cua toi`.
- `src/pages/ProfilePage.tsx`:
  - Tao shell toi thieu cho trang Profile moi.
  - Dung `useAuth()` de lay user.
  - Dung `getProfileOverview()` de pre-wire data loading cho cac section sau.
  - Render breadcrumb/title/copy dung scope Profile.
  - Hien placeholder "Profile shell da san sang..." sau loading.
- `src/pages/UserProfilePage.tsx`:
  - Xoa hoan toan vi user da chot thay bang Profile moi.

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.

## Step FE-3a - Validation schemas va shared atoms

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Tao validation schema dung cho cac form Profile.
- Tao shared atoms dung chung cho cac section Profile.
- Chua noi cac atoms vao `ProfilePage`.
- Chua tao 6 section.
- Chua tao modal/skeleton.

Files moi:
- `src/types/profile.schemas.ts`
- `src/components/profile/shared/SectionCard.tsx`
- `src/components/profile/shared/Avatar.tsx`
- `src/components/profile/shared/ConstitutionPill.tsx`
- `src/components/profile/shared/FieldRow.tsx`
- `src/components/profile/shared/Segmented.tsx`
- `src/components/profile/shared/ProgressBar.tsx`
- `src/components/profile/shared/EditIconButton.tsx`

Noi dung da them:
- `profile.schemas.ts`:
  - `computeAge(birthDate)`.
  - `personalInfoSchema` validate name, birthDate age 13-100, gender, phone.
  - `changePasswordSchema` validate current password, new password policy, confirm password match, new password khac current password.
  - Export `PersonalInfoData`, `ChangePasswordData`.
- `SectionCard`:
  - Shell card dung chung, ho tro `title`, `subtitle`, `rightSlot`, `variant='danger'`.
- `Avatar`:
  - Initial avatar tu ten/username.
- `ConstitutionPill`:
  - Nhan enum code `GAY | CAN_DOI | THUA_CAN | BEO_PHI`, map ra label hien thi.
- `FieldRow`:
  - Readonly label/value/help, co empty placeholder `Chua cap nhat`.
- `Segmented`:
  - Generic segmented control co `options`, `value`, `onChange`, `disabled`.
- `ProgressBar`:
  - Clamp progress 0-100, co aria progressbar.
- `EditIconButton`:
  - Dung Heroicons `PencilSquareIcon`, khong them dependency.

Verify da chay:
- Lan 1 `npx tsc -b --pretty false`: FAIL do `Segmented.tsx` import `React` khong dung.
- Da sua: bo import `React` thua trong `Segmented.tsx`.
- Lan 2 `npx tsc -b --pretty false`: PASS.

## Step FE-3b1 - S1 Profile Header va S2 Personal Info

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Tao section Header va Personal Info.
- Wire 2 section nay vao `ProfilePage`.
- Chua tao `S3Goal`, `S4HealthSettings`, `S5Security`, `S6DangerZone`.
- Chua tao `GoalChangeModal`.
- Chua tao `ProfileSkeleton` that.

Files moi:
- `src/components/profile/sections/S1ProfileHeader.tsx`
- `src/components/profile/sections/S2PersonalInfo.tsx`

Files da sua:
- `src/pages/ProfilePage.tsx`
- `doc/RefactorUI/ProfilePage/ContextXayDungProfileFE.md`

Noi dung da them/sua:
- `S1ProfileHeader`:
  - Nhan `user` tu `useAuth()`.
  - Hien avatar initial, name/username, email neu co.
  - Hien joined date tu `user.createdAt`, fallback `Khong xac dinh`.
  - Hien `ConstitutionPill` tu `overview.constitution.constitution`.
- `S2PersonalInfo`:
  - View mode hien 4 field: name, birthDate, gender, phone.
  - Edit mode dung `react-hook-form` + `zodResolver(personalInfoSchema)`.
  - Save goi `updateUserProfile()` -> `PUT /api/user/profile`.
  - Convert phone rong thanh `null` de clear phone o BE.
  - Sau save goi `onUpdated()` de `refreshUser()`.
  - UI copy/toast tieng Viet.
- `ProfilePage`:
  - Import va render `S1ProfileHeader`, `S2PersonalInfo`.
  - Truyen `refreshUser` vao S2.
  - Giu placeholder rieng cho cac section con lai de step sau thay the.

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.

## Step FE-3b2 - S3 Goal va GoalChangeModal

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Tao `GoalChangeModal` theo MVP.
- Tao `S3Goal`.
- Wire `S3Goal` vao `ProfilePage`.
- Chua tao `S4HealthSettings`, `S5Security`, `S6DangerZone`.
- Chua tao `ProfileSkeleton` that.

Files moi:
- `src/components/profile/modals/GoalChangeModal.tsx`
- `src/components/profile/sections/S3Goal.tsx`

Files da sua:
- `src/pages/ProfilePage.tsx`
- `doc/RefactorUI/ProfilePage/ContextXayDungProfileFE.md`

Noi dung da them/sua:
- `GoalChangeModal`:
  - Chi cho chon `GIAM`, `DUY_TRI`, `TANG`.
  - Submit goi `updateCurrentGoal({ goalCode: selected, targetDurationMonths: 6 })`.
  - Khong them input `targetWeightKg`, dung dung MVP user da chot.
  - Neu chon lai goal hien tai thi chi dong modal.
  - UI copy/toast tieng Viet.
- `S3Goal`:
  - Hien current goal card voi icon Heroicons, label, startDate, duration.
  - Button `Doi muc tieu` mo `GoalChangeModal`.
  - Progress bar chi tinh cho `GIAM` va `TANG`.
  - Khong tinh progress cho `DUY_TRI`.
  - Fallback khi thieu `startWeightKg`, `targetWeightKg`, hoac `currentWeight`.
  - History collapsible, empty state khong render table rong.
- `ProfilePage`:
  - Render `S3Goal` sau S2.
  - Truyen `overview.currentGoal`, `overview.goalHistory`, `overview.metrics?.weight?.value`.
  - `onGoalChanged` goi lai `loadProfile()`.

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.

## Step FE-3b3 - S4 Health Settings, S5 Security, S6 Danger Zone

Trang thai: DA THUC HIEN, CHUA COMMIT.

Pham vi:
- Tao 3 section con lai cua Profile MVP.
- Wire du 6 section vao `ProfilePage`.
- Chua tao `ProfileSkeleton` that.
- Chua chay manual integration tren browser.

Files moi:
- `src/components/profile/sections/S4HealthSettings.tsx`
- `src/components/profile/sections/S5Security.tsx`
- `src/components/profile/sections/S6DangerZone.tsx`

Files da sua:
- `src/pages/ProfilePage.tsx`
- `doc/RefactorUI/ProfilePage/ContextXayDungProfileFE.md`

Noi dung da them/sua:
- `S4HealthSettings`:
  - Lay current PBF method tu preference `pbf_method`, fallback `FORMULA`.
  - Toggle `FORMULA` / `MODEL_1`.
  - Submit goi `updatePreference('pbf_method', { prefValue, valueType: 'STRING' })`.
  - Sau save goi `onPreferenceChanged()` de load lai overview.
- `S5Security`:
  - Dung `react-hook-form` + `zodResolver(changePasswordSchema)`.
  - Submit chi gui `currentPassword`, `newPassword`, khong gui `confirmPassword`.
  - Handle BE error `AUTH-011` vao field current password.
  - Handle BE error `AUTH-012` vao field new password.
  - Change password thanh cong thi toast va reset form, khong logout user.
- `S6DangerZone`:
  - Placeholder theo MVP.
  - Button `Xoa tai khoan` chi toast info.
  - Khong goi DELETE account endpoint.
- `ProfilePage`:
  - Render du S1-S6.
  - Xoa placeholder section con lai.
  - Giu warning section khi `overview.errors` co partial API failures.

Verify da chay:
- `npx tsc -b --pretty false`
- Ket qua: PASS.
