# HƯỚNG DẪN FRONTEND — TRANG PROFILE PAGE

> **Audience:**Code agent thực hiện frontend tại repo `Health-management-frontend` branch `feature/onboarding-dashboard-fe`.
>
> **Mục đích:** Build trang `/profile` cho user view/edit thông tin sau khi đã onboard. Đồng thời update các service hiện có để tương thích với contract BE mới (đã refactor).
>
> **Tổng workload:** ~7-8h (regression FE cũ ~1h, service layer ~1h, routing ~15 phút, 6 sections + modal ~4h, validation + integration test ~1.5h). Thời gian thoải mái nên bạn hãy làm việc cẩn thận, ưu tiên đánh giá kĩ và làm đúng tránh rủi ro.
>
> **PREREQUISITE:** BE đã hoàn thành tất cả phase trong doc `HuongDanXayDungProfilePage_BE.md` và user đã confirm Postman test pass. KHÔNG bắt đầu FE work nếu BE chưa xong.

---

## 0. CONTEXT & SCOPE

### 0.1. Tổng quan công việc

| Phase | Nội dung | Time | Mức độ |
|---|---|---|---|
| **FE-0** | Regression update — fix service cũ sau khi BE refactor `DataResponse` | ~1h | Critical |
| **FE-1** | Service layer cho Profile (`password`, `profile`, update `userGoals`) + update `auth.service` interface | ~1h | Build mới |
| **FE-2** | Routing + container + shared atoms | ~1.5h | Build mới |
| **FE-3** | 6 sections (S1-S6) | ~2.5h | Build mới |
| **FE-4** | Modals + Skeleton + Polish | ~1h | Build mới |
| **FE-5** | Integration test full flow | ~30 phút | Verify |

### 0.2. Scope MVP đã chốt (user confirm)

| Section | Quyết định |
|---|---|
| §1 Header | ✅ Build đầy đủ (Avatar + name + email + joined + ConstitutionPill) |
| §2 Personal Info | ✅ Build view + edit mode (4 field: name, birthDate, gender, phone) |
| §3 Goal | ✅ Build + progress bar (dùng `start_weight_kg` từ BE) + history collapsible |
| §4 Health Settings | ✅ Build toggle PBF method (FORMULA/MODEL_1) |
| §5 Security (Change Password) | ✅ Build form đổi mật khẩu |
| §6 Danger Zone (Delete Account) | ⏸ **DEFER** — UI placeholder, button bấm chỉ toast "Tính năng đang phát triển, vui lòng liên hệ admin" |

### 0.3. State hiện tại (đã verify clone repo)

**FE branch `feature/onboarding-dashboard-fe` đã có:**

- ✅ `apiClient` (axios) auto-attach JWT từ `services/axios.ts`
- ✅ `AuthContext` có `refreshUser()` method
- ✅ `useAuth().user` có fields: `userId, username, name, birthDate, gender, phone, profileCompleted` (THIẾU `email`, `createdAt` — sẽ thêm ở §FE-1)
- ✅ Tailwind v4 đã work với brand tokens
- ✅ `unwrapDataResponse()` helper trong `apiResponse.ts` — handle CẢ 2 case (DataResponse và raw)
- ✅ Existing services dùng `unwrapDataResponse`: `auth.service.ts`, `userGoals.service.ts`, `userPreferences.service.ts`, `constitution.service.ts`, `dashboard.service.ts`, `mealLog.service.ts`
- ❌ Existing service KHÔNG dùng `unwrapDataResponse`: `healthData.service.ts` (file cũ) — sẽ FAIL sau khi BE refactor

**Sẽ build mới ở doc này:**

- ❌ Chưa có route `/profile` trong App.tsx
- ❌ Chưa có `profile.service.ts`, `password.service.ts`
- ❌ `UserProfileData` interface thiếu `email`, `createdAt`

### 0.4. BE contract sau refactor (verify với BE doc)

Endpoint Profile dùng:

| Endpoint | Method | Response shape |
|---|---|---|
| `/api/user/currentUser` | GET | `DataResponse<UserProfileResponse>` với `email`, `createdAt` mới |
| `/api/user/profile` | PUT | `DataResponse<UserResponseDTO>` |
| `/api/user-goals/current` | GET | `DataResponse<UserGoalResponse>` với `startWeightKg` mới |
| `/api/user-goals/current` | PUT | `DataResponse<UserGoalResponse>` |
| `/api/user-goals/history` | GET | `DataResponse<List<UserGoalResponse>>` |
| `/api/user-preferences` | GET | `DataResponse<List<PreferenceResponse>>` |
| `/api/user-preferences/{key}` | PUT | `DataResponse<PreferenceResponse>` |
| `/api/auth/change-password` | PUT | `DataResponse<Void>` |
| `/api/health-data/dashboard-metrics` | GET | `DataResponse<DashboardMetricsResponse>` (refactor mới) |
| `/api/health-data/constitution` | GET | `DataResponse<ConstitutionResponse>` |

### 0.5. Convention bắt buộc

1. **Code comment + commit message:** tiếng Anh
2. **UI copy + toast message:** tiếng Việt
3. **Sample data trong design source:** KHÔNG copy nguyên — bind với API thực
4. **KHÔNG dùng readOnly attribute** từ design preview
5. **Format date hiển thị:** `DD/MM/YYYY` (Vietnamese convention)
6. **KHÔNG dùng localStorage cho password** — không persist
7. **KHÔNG tự ý thêm dependency** — dùng package có sẵn

### 0.6. KHÔNG động vào (out of scope)

- Routing `Sidebar` (Profile access qua TopHeader, KHÔNG vào sidebar list)
- Logic Dashboard hiện có
- Logic Onboarding hiện có
- File `tailwind.config.ts` (deprecated, đã handle phase trước)

---

# PHASE FE-0 — REGRESSION UPDATE (~1h)

## FE-0.1. Background

BE đã refactor `health-data-service` về `DataResponse<T>`. Có 1 file FE đang parse raw — sẽ break sau merge:

**File:** `src/services/healthData.service.ts`

3 function bị ảnh hưởng:
- `getLatestHealthData()` → endpoint `/latest-metrics`
- `getDashboardMetrics()` → endpoint `/dashboard-metrics`
- `getHistoricalHealthData()` → endpoint `/query/history/{type}`

3 file consumer dùng các function này:
- `src/pages/SubmitHealthDataPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/dashboard/TrendChart.tsx`

## FE-0.2. Fix `healthData.service.ts`

**File:** `src/services/healthData.service.ts`

**Strategy:** Dùng `unwrapDataResponse` để defense cả 2 case (raw cũ + DataResponse mới).

**Import thêm ở đầu file:**

```typescript
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';
```

### FE-0.2.1. `getLatestHealthData`

**BEFORE:**

```typescript
export const getLatestHealthData = async (token: string): Promise<LatestHealthDataApiResponse> => {
  try {
    const response = await axios.get<LatestHealthDataApiResponse>(`${API_HEALTH_DATA_URL}/latest-metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu gần nhất thất bại.');
  }
};
```

**AFTER:**

```typescript
export const getLatestHealthData = async (token: string): Promise<LatestHealthDataApiResponse> => {
  try {
    const response = await axios.get<DataResponse<LatestHealthDataApiResponse> | LatestHealthDataApiResponse>(
      `${API_HEALTH_DATA_URL}/latest-metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu gần nhất thất bại.');
  }
};
```

### FE-0.2.2. `getDashboardMetrics` (trong healthData.service.ts cũ)

**BEFORE:**

```typescript
export const getDashboardMetrics = async (token: string): Promise<DashboardMetricsApiResponse> => {
  try {
    const response = await axios.get<DashboardMetricsApiResponse>(`${API_HEALTH_DATA_URL}/dashboard-metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu dashboard thất bại.');
  }
};
```

**AFTER:**

```typescript
export const getDashboardMetrics = async (token: string): Promise<DashboardMetricsApiResponse> => {
  try {
    const response = await axios.get<DataResponse<DashboardMetricsApiResponse> | DashboardMetricsApiResponse>(
      `${API_HEALTH_DATA_URL}/dashboard-metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu dashboard thất bại.');
  }
};
```

### FE-0.2.3. `getHistoricalHealthData`

**BEFORE:**

```typescript
const response = await axios.get<HistoricalDataApiResponse>(
  `${API_HEALTH_DATA_URL}/query/history/${indicatorType}`,
  { headers: { Authorization: `Bearer ${token}` }, params },
);
return response.data;
```

**AFTER:**

```typescript
const response = await axios.get<DataResponse<HistoricalDataApiResponse> | HistoricalDataApiResponse>(
  `${API_HEALTH_DATA_URL}/query/history/${indicatorType}`,
  { headers: { Authorization: `Bearer ${token}` }, params },
);
return unwrapDataResponse(response.data);
```

**Why dùng `unwrapDataResponse`:** Helper sẽ check nếu payload có `{ code, message, data }` thì unwrap; nếu là raw thì trả nguyên. → Defense backward-compat.

## FE-0.3. Verify Phase FE-0

```bash
npx tsc -b --pretty false
```

Pass → test thủ công 3 trang:

- [ ] `/submit-data` (`SubmitHealthDataPage`) — load latest metrics OK
- [ ] `/home` (`HomePage`) — render dashboard cũ OK
- [ ] `/dashboard` → `TrendChart` render OK

Nếu cả 3 trang work bình thường → Phase FE-0 DONE, sang FE-1.

**⚠ Nếu có trang nào trắng/error:** STOP, debug ngay. Có thể có file khác cũng parse raw response chưa được fix.

---

# PHASE FE-1 — SERVICE LAYER (~1h)

## FE-1.1. Update `UserProfileData` interface

**File:** `src/services/auth.service.ts`

**Tìm interface `UserProfileData` và thêm 2 field:**

```typescript
export interface UserProfileData {
  userId: string | null;
  username: string;
  roles: string[];
  name?: string | null;
  birthDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone?: string | null;
  profileCompleted: boolean;

  // === ADD ===
  email?: string | null;       // From Auth.email via BE mapping
  createdAt?: string | null;   // ISO datetime "yyyy-MM-ddTHH:mm:ss"
}
```

**Verify BE đã expose 2 field này:** Mở Postman, gọi `GET /api/user/currentUser` (sau BE đã merge), response.data có `email` + `createdAt`. Nếu KHÔNG có → escalate BE agent.

## FE-1.2. Update `userGoals.service.ts`

**File:** `src/services/userGoals.service.ts`

**Tìm interface `UserGoalResponse`, thêm field:**

```typescript
export interface UserGoalResponse {
  id: string;
  goalCode: GoalCode;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  targetWeightKg: number | null;
  startWeightKg: number | null;   // ← ADD
  targetDurationMonths: number | null;
  note: string | null;
}
```

**Thêm function `getGoalHistory()` (nếu chưa có):**

```typescript
export const getGoalHistory = async (): Promise<UserGoalResponse[]> => {
  const response = await apiClient.get<
    DataResponse<UserGoalResponse[]> | UserGoalResponse[]
  >('/api/user-goals/history');
  return unwrapDataResponse(response.data);
};
```

**Verify BE endpoint `/api/user-goals/history` đã có:** Test Postman trước khi viết FE. Nếu chưa có, escalate BE agent.

## FE-1.3. Tạo `password.service.ts`

**File mới:** `src/services/password.service.ts`

```typescript
import { apiClient } from './axios';
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Change current user's password. JWT remains valid after change (BE does
 * not invalidate token in MVP).
 *
 * Throws axios error if BE returns non-2xx. Caller should map error code:
 *   AUTH-011: Wrong current password
 *   AUTH-012: New password same as current
 *   Other: Validation error from BE @Pattern annotation
 */
export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  const response = await apiClient.put<DataResponse<void>>(
    '/api/auth/change-password',
    payload,
  );
  // No data to return; unwrap is just for type safety
  unwrapDataResponse(response.data);
};
```

## FE-1.4. Tạo `profile.service.ts` (aggregate)

**File mới:** `src/services/profile.service.ts`

```typescript
import { getCurrentGoal, getGoalHistory } from './userGoals.service';
import { getAllPreferences } from './userPreferences.service';
import { getDashboardMetrics } from './dashboard.service';
import { getConstitution } from './constitution.service';
import { getApiErrorMessage } from './apiResponse';
import type { UserGoalResponse } from './userGoals.service';
import type { PreferenceResponse } from './userPreferences.service';
import type { ConstitutionResponse } from './constitution.service';
import type { DashboardMetricsResponse } from './dashboard.service';

export interface ProfileOverview {
  currentGoal: UserGoalResponse | null;
  goalHistory: UserGoalResponse[];
  preferences: PreferenceResponse[];
  metrics: DashboardMetricsResponse | null;
  constitution: ConstitutionResponse | null;
  errors: Partial<Record<
    'currentGoal' | 'goalHistory' | 'preferences' | 'metrics' | 'constitution',
    string
  >>;
}

/**
 * Fetch all data needed by the Profile page in parallel.
 * Each failure is captured independently so the page can show partial data.
 */
export const getProfileOverview = async (): Promise<ProfileOverview> => {
  const [
    currentGoalResult,
    goalHistoryResult,
    preferencesResult,
    metricsResult,
    constitutionResult,
  ] = await Promise.allSettled([
    getCurrentGoal(),
    getGoalHistory(),
    getAllPreferences(),
    getDashboardMetrics(),
    getConstitution(),
  ]);

  return {
    currentGoal: currentGoalResult.status === 'fulfilled' ? currentGoalResult.value : null,
    goalHistory: goalHistoryResult.status === 'fulfilled' ? goalHistoryResult.value : [],
    preferences: preferencesResult.status === 'fulfilled' ? preferencesResult.value : [],
    metrics: metricsResult.status === 'fulfilled' ? metricsResult.value : null,
    constitution: constitutionResult.status === 'fulfilled' ? constitutionResult.value : null,
    errors: {
      ...(currentGoalResult.status === 'rejected' && {
        currentGoal: getApiErrorMessage(currentGoalResult.reason, 'Không tải được mục tiêu hiện tại'),
      }),
      ...(goalHistoryResult.status === 'rejected' && {
        goalHistory: getApiErrorMessage(goalHistoryResult.reason, 'Không tải được lịch sử mục tiêu'),
      }),
      ...(preferencesResult.status === 'rejected' && {
        preferences: getApiErrorMessage(preferencesResult.reason, 'Không tải được cài đặt'),
      }),
      ...(metricsResult.status === 'rejected' && {
        metrics: getApiErrorMessage(metricsResult.reason, 'Không tải được chỉ số'),
      }),
      ...(constitutionResult.status === 'rejected' && {
        constitution: getApiErrorMessage(constitutionResult.reason, 'Không tải được thể trạng'),
      }),
    },
  };
};
```

## FE-1.5. Verify `user.service.ts` có updateUserProfile

**File:** `src/services/user.service.ts`

Verify đã có function `updateUserProfile()` (đã có sẵn từ onboarding). Nếu chưa, thêm:

```typescript
import { apiClient } from './axios';
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';

export interface UpdateProfilePayload {
  name: string;
  birthDate: string;       // ISO yyyy-mm-dd
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string | null;
}

export const updateUserProfile = async (payload: UpdateProfilePayload): Promise<void> => {
  const response = await apiClient.put<DataResponse<unknown>>('/api/user/profile', payload);
  unwrapDataResponse(response.data);
};
```

**Lưu ý:** `phone` có thể là `null` (clear field) — BE đã fix accept null clear (xem doc BE §C3).

## FE-1.6. Verify

```bash
npx tsc -b --pretty false
```

Pass → service layer OK, sang FE-2.

---

# PHASE FE-2 — ROUTING + CONTAINER + SHARED ATOMS (~1.5h)

## FE-2.1. Add `/profile` route in App.tsx

**File:** `src/App.tsx`

**Imports:**

```typescript
import ProfilePage from './pages/ProfilePage';
```

**Thêm route trong `<Routes>` (bọc bằng `ProtectedRoute`):**

```tsx
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <MainLayout>
        <ProfilePage />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

**Lưu ý:** Profile dùng `MainLayout` (có Sidebar + TopHeader). KHÔNG access từ sidebar — access qua user menu trong TopHeader.

## FE-2.2. Thêm link trong TopHeader user menu

**File:** `src/components/layout/TopHeader.tsx` (verify path thực tế)

Tìm block dropdown user menu, thêm item:

```tsx
import { Link } from 'react-router-dom';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Trong dropdown:
<Link
  to="/profile"
  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
>
  <UserCircleIcon className="h-4 w-4" />
  Hồ sơ của tôi
</Link>
```

**Nếu chưa có user menu dropdown:** Agent FE tạo mới với 2 item (Hồ sơ của tôi, Đăng xuất).

## FE-2.3. Tạo shared atoms

### FE-2.3.1. SectionCard

**File mới:** `src/components/profile/shared/SectionCard.tsx`

```tsx
import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

const SectionCard: React.FC<SectionCardProps> = ({
  title, subtitle, rightSlot, children, className = '', variant = 'default',
}) => {
  const borderClass = variant === 'danger' ? 'border-red-200' : 'border-gray-100';
  const bgClass = variant === 'danger' ? 'bg-red-50/50' : 'bg-white';

  return (
    <section
      className={`rounded-2xl border ${borderClass} ${bgClass} p-6 lg:p-7 ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
    >
      {(title || rightSlot) && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {rightSlot}
        </header>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
```

### FE-2.3.2. Avatar

**File mới:** `src/components/profile/shared/Avatar.tsx`

```tsx
import React from 'react';

interface AvatarProps {
  name?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ name = 'U', size = 80 }) => {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  return (
    <div
      className="grid flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-green-medium text-white font-bold select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        boxShadow: '0 8px 22px -8px rgba(5,150,105,.55), 0 2px 4px rgba(5,150,105,.18)',
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
```

### FE-2.3.3. ConstitutionPill

**File mới:** `src/components/profile/shared/ConstitutionPill.tsx`

```tsx
import React from 'react';

type ConstitutionCode = 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';

interface Props {
  value: ConstitutionCode;
}

const STYLE: Record<ConstitutionCode, { label: string; bg: string; text: string; border: string }> = {
  GAY:      { label: 'GẦY',      bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  CAN_DOI:  { label: 'CÂN ĐỐI',  bg: 'bg-green-100', text: 'text-brand-green-dark', border: 'border-green-200' },
  THUA_CAN: { label: 'THỪA CÂN', bg: 'bg-amber-100', text: 'text-amber-700',  border: 'border-amber-300' },
  BEO_PHI:  { label: 'BÉO PHÌ',  bg: 'bg-red-100',   text: 'text-red-700',    border: 'border-red-300' },
};

const ConstitutionPill: React.FC<Props> = ({ value }) => {
  const s = STYLE[value] ?? STYLE.CAN_DOI;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${s.bg} ${s.text} ${s.border}`}
      style={{ letterSpacing: '0.06em' }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'currentColor', opacity: 0.85 }}
      />
      {s.label}
    </span>
  );
};

export default ConstitutionPill;
```

### FE-2.3.4. FieldRow

**File mới:** `src/components/profile/shared/FieldRow.tsx`

```tsx
import React from 'react';

interface FieldRowProps {
  label: string;
  value?: string | null;
  help?: string;
  placeholder?: string;
}

const FieldRow: React.FC<FieldRowProps> = ({
  label, value, help, placeholder = 'Chưa cập nhật',
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
      {label}
    </div>
    <div className={`min-h-[22px] text-sm font-medium ${value ? 'text-gray-900' : 'italic text-gray-400'}`}>
      {value || placeholder}
    </div>
    {help && <div className="mt-0.5 text-xs text-gray-500">{help}</div>}
  </div>
);

export default FieldRow;
```

### FE-2.3.5. Segmented

**File mới:** `src/components/profile/shared/Segmented.tsx`

```tsx
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Segmented: React.FC<Props> = ({ options, value, onChange, disabled }) => (
  <div className="grid grid-cols-3 gap-2">
    {options.map((opt) => {
      const selected = opt.value === value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            selected
              ? 'border-brand-green bg-brand-green-light text-brand-green-darker'
              : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default Segmented;
```

### FE-2.3.6. ProgressBar

**File mới:** `src/components/profile/shared/ProgressBar.tsx`

```tsx
import React from 'react';

interface Props {
  value: number;
  max?: number;
  height?: number;
}

const ProgressBar: React.FC<Props> = ({ value, max = 100, height = 10 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className="relative overflow-hidden rounded-full bg-gray-100"
      style={{ height }}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-medium transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default ProgressBar;
```

### FE-2.3.7. EditIconButton

**File mới:** `src/components/profile/shared/EditIconButton.tsx`

```tsx
import React from 'react';

interface Props {
  onClick: () => void;
  label?: string;
}

const EditIconButton: React.FC<Props> = ({ onClick, label = 'Chỉnh sửa' }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-brand-green-dark"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4v16h16v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
    {label}
  </button>
);

export default EditIconButton;
```

## FE-2.4. Tạo ProfilePage container (shell trống)

**File mới:** `src/pages/ProfilePage.tsx`

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getProfileOverview, type ProfileOverview } from '../services/profile.service';

// Section imports will be added in Phase FE-3
// import S1ProfileHeader from '../components/profile/sections/S1ProfileHeader';
// import S2PersonalInfo from '../components/profile/sections/S2PersonalInfo';
// ... etc

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfileOverview();
      setOverview(data);
    } catch (err) {
      toast.error('Không tải được hồ sơ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      {/* Breadcrumb + title */}
      <div className="mx-auto mb-6 max-w-[880px]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span>Trang chủ</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-gray-800">Hồ sơ của tôi</span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
          Hồ sơ của tôi
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý thông tin cá nhân, mục tiêu và cài đặt sức khỏe của bạn
        </p>
      </div>

      {/* Placeholder - sections will be added in Phase FE-3 */}
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 pb-6">
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
            Đang tải...
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-400">
            Profile sections will render here (Phase FE-3)
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
```

## FE-2.5. Verify Phase FE-2

```bash
npm run dev
```

Login → click avatar dropdown → "Hồ sơ của tôi" → vào `/profile` → thấy breadcrumb + title + placeholder "Đang tải..." rồi "Profile sections will render here".

→ Routing OK, sang FE-3.

---

# PHASE FE-3 — 6 SECTIONS (~2.5h)

## FE-3.1. Validation schemas

**File mới:** `src/types/profile.schemas.ts`

```typescript
import { z } from 'zod';

export function computeAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const personalInfoSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên tối đa 100 ký tự'),
  birthDate: z.string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((val) => {
      const age = computeAge(val);
      return age >= 13 && age <= 100;
    }, 'Tuổi phải từ 13 đến 100'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Vui lòng chọn giới tính',
  }),
  phone: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^0\d{9,10}$/.test(val),
      'Số điện thoại không hợp lệ (VD: 0912345678)'
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .max(100, 'Mật khẩu tối đa 100 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ HOA')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  path: ['newPassword'],
});

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
```

**Đồng bộ với BE:** Regex `[A-Z]` + `[0-9]` khớp với BE `@Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d).+$")`.

## FE-3.2. S1ProfileHeader

**File mới:** `src/components/profile/sections/S1ProfileHeader.tsx`

```tsx
import React from 'react';
import SectionCard from '../shared/SectionCard';
import Avatar from '../shared/Avatar';
import ConstitutionPill from '../shared/ConstitutionPill';
import type { UserProfileData } from '../../../services/auth.service';

interface Props {
  user: UserProfileData | null;
  constitution?: 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';
}

function formatJoinedDate(iso?: string | null): string {
  if (!iso) return 'Không xác định';
  try {
    const date = new Date(iso);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `Tham gia từ ${m}/${y}`;
  } catch {
    return 'Không xác định';
  }
}

const S1ProfileHeader: React.FC<Props> = ({ user, constitution = 'CAN_DOI' }) => {
  return (
    <SectionCard>
      <div className="flex items-center gap-5">
        <Avatar name={user?.name ?? user?.username ?? 'U'} size={80} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-gray-900 lg:text-[22px]">
              {user?.name ?? user?.username ?? 'Người dùng'}
            </h2>
            <ConstitutionPill value={constitution} />
          </div>
          {user?.email && (
            <div className="mb-0.5 flex items-center gap-1.5 text-sm text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" />
                <path d="M4 8l8 5 8-5" />
              </svg>
              {user.email}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
            {formatJoinedDate(user?.createdAt)}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default S1ProfileHeader;
```

## FE-3.3. S2PersonalInfo

**File mới:** `src/components/profile/sections/S2PersonalInfo.tsx`

```tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { personalInfoSchema, computeAge, type PersonalInfoData } from '../../../types/profile.schemas';
import { updateUserProfile } from '../../../services/user.service';
import type { UserProfileData } from '../../../services/auth.service';
import SectionCard from '../shared/SectionCard';
import FieldRow from '../shared/FieldRow';
import Segmented from '../shared/Segmented';
import EditIconButton from '../shared/EditIconButton';

interface Props {
  user: UserProfileData | null;
  onUpdated: () => Promise<void>;
}

const GENDER_LABEL = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

function formatVnDate(iso?: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function inputClass(error: boolean): string {
  return `mt-1 w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none transition ${
    error
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
}

const S2PersonalInfo: React.FC<Props> = ({ user, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name ?? '',
      birthDate: user?.birthDate ?? '',
      gender: (user?.gender as 'MALE' | 'FEMALE' | 'OTHER') ?? undefined,
      phone: user?.phone ?? '',
    },
  });

  const enterEdit = () => {
    reset({
      name: user?.name ?? '',
      birthDate: user?.birthDate ?? '',
      gender: (user?.gender as 'MALE' | 'FEMALE' | 'OTHER') ?? undefined,
      phone: user?.phone ?? '',
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = async (data: PersonalInfoData) => {
    setSaving(true);
    try {
      // Convert empty string to null so BE clears the phone field
      await updateUserProfile({
        name: data.name,
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone ? data.phone : null,
      });
      await onUpdated();
      toast.success('Đã cập nhật thông tin');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const age = user?.birthDate ? computeAge(user.birthDate) : null;
  const birthDateWatch = watch('birthDate');
  const editAge = birthDateWatch ? computeAge(birthDateWatch) : null;

  if (!editing) {
    return (
      <SectionCard
        title="Thông tin cá nhân"
        subtitle="Các thông tin cơ bản hệ thống dùng để tính chỉ số"
        rightSlot={<EditIconButton onClick={enterEdit} />}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <FieldRow label="Họ và tên" value={user?.name} />
          <FieldRow
            label="Ngày sinh"
            value={user?.birthDate ? formatVnDate(user.birthDate) : ''}
            help={age ? `Bạn ${age} tuổi` : undefined}
          />
          <FieldRow
            label="Giới tính"
            value={user?.gender ? GENDER_LABEL[user.gender] : ''}
          />
          <FieldRow label="Số điện thoại" value={user?.phone} />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Thông tin cá nhân" subtitle="Đang chỉnh sửa...">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Họ và tên *</label>
            <input
              type="text"
              {...register('name')}
              className={inputClass(!!errors.name)}
              disabled={saving}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Ngày sinh *</label>
            <input
              type="date"
              {...register('birthDate')}
              className={inputClass(!!errors.birthDate)}
              disabled={saving}
            />
            {editAge && <p className="mt-1 text-xs text-gray-500">Bạn {editAge} tuổi</p>}
            {errors.birthDate && <p className="mt-1 text-xs text-red-600">{errors.birthDate.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Giới tính *</label>
            <div className="mt-1">
              <Segmented
                options={[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
                value={watch('gender')}
                onChange={(v) => setValue('gender', v as 'MALE' | 'FEMALE' | 'OTHER', {
                  shouldValidate: true, shouldDirty: true,
                })}
                disabled={saving}
              />
            </div>
            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="0xxx xxx xxx"
              className={inputClass(!!errors.phone)}
              disabled={saving}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isValid || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {saving && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default S2PersonalInfo;
```

## FE-3.4. S3Goal

**File mới:** `src/components/profile/sections/S3Goal.tsx`

```tsx
import React, { useState } from 'react';
import SectionCard from '../shared/SectionCard';
import ProgressBar from '../shared/ProgressBar';
import GoalChangeModal from '../modals/GoalChangeModal';
import type { UserGoalResponse } from '../../../services/userGoals.service';

interface Props {
  currentGoal: UserGoalResponse | null;
  history: UserGoalResponse[];
  currentWeight: number | null;
  onGoalChanged: () => Promise<void>;
}

const GOAL_STYLE = {
  GIAM:    { label: 'GIẢM CÂN',   icon: '📉', color: 'text-brand-green-darker', bg: 'bg-brand-green-light', border: 'border-green-200' },
  DUY_TRI: { label: 'DUY TRÌ',    icon: '⚖️', color: 'text-blue-700',           bg: 'bg-blue-50',           border: 'border-blue-200' },
  TANG:    { label: 'TĂNG CÂN',   icon: '📈', color: 'text-orange-700',         bg: 'bg-orange-50',         border: 'border-orange-200' },
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active:  { label: 'Đang theo',  cls: 'bg-brand-green text-white' },
  done:    { label: 'Đã hoàn tất', cls: 'bg-gray-200 text-gray-700' },
  dropped: { label: 'Đã dừng',     cls: 'bg-amber-100 text-amber-700' },
};

function formatVnDate(iso?: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const S3Goal: React.FC<Props> = ({ currentGoal, history, currentWeight, onGoalChanged }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Compute progress
  const startWeight = currentGoal?.startWeightKg ?? null;
  const targetWeight = currentGoal?.targetWeightKg ?? null;

  let progressPct: number | null = null;
  let progressLabel = '';

  if (currentGoal && startWeight != null && targetWeight != null && currentWeight != null) {
    if (currentGoal.goalCode === 'GIAM' && startWeight > targetWeight) {
      const lost = startWeight - currentWeight;
      const need = startWeight - targetWeight;
      progressPct = Math.max(0, Math.min(100, Math.round((lost / need) * 100)));
      progressLabel = `Đã giảm ${lost.toFixed(1)}kg / ${need.toFixed(1)}kg`;
    } else if (currentGoal.goalCode === 'TANG' && startWeight < targetWeight) {
      const gained = currentWeight - startWeight;
      const need = targetWeight - startWeight;
      progressPct = Math.max(0, Math.min(100, Math.round((gained / need) * 100)));
      progressLabel = `Đã tăng ${gained.toFixed(1)}kg / ${need.toFixed(1)}kg`;
    }
    // DUY_TRI: no progress bar
  }

  const goal = currentGoal ? GOAL_STYLE[currentGoal.goalCode] : null;

  return (
    <>
      <SectionCard
        title="Mục tiêu hiện tại"
        subtitle="Mục tiêu bạn đang theo đuổi cùng tiến độ"
      >
        {currentGoal && goal ? (
          <>
            {/* Current goal card */}
            <div className={`flex items-center gap-4 rounded-2xl border ${goal.border} ${goal.bg} p-5`}>
              <div
                className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white text-3xl"
                style={{ boxShadow: '0 4px 12px -4px rgba(15,23,42,.1)' }}
              >
                {goal.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider ${goal.color}`}>
                  Đang theo
                </div>
                <div className="mt-0.5 text-xl font-bold text-gray-900 lg:text-[22px]">
                  {goal.label}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Bắt đầu {formatVnDate(currentGoal.startDate)}
                  {currentGoal.targetDurationMonths && ` · trong ${currentGoal.targetDurationMonths} tháng`}
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-brand-green-light px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-green-100"
              >
                Đổi mục tiêu
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            {progressPct !== null ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{progressLabel}</span>
                  <span className="text-sm font-bold text-brand-green-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {progressPct}%
                  </span>
                </div>
                <ProgressBar value={progressPct} max={100} />
                <div
                  className="mt-2 flex justify-between text-xs text-gray-500"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <span>Bắt đầu: {startWeight!.toFixed(1)} kg</span>
                  <span className="font-semibold text-brand-green-dark">
                    Hiện tại: {currentWeight!.toFixed(1)} kg
                  </span>
                  <span>Mục tiêu: {targetWeight!.toFixed(1)} kg</span>
                </div>
              </div>
            ) : currentGoal.goalCode !== 'DUY_TRI' ? (
              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-500">
                {!startWeight
                  ? 'Chưa có dữ liệu cân nặng khởi điểm'
                  : !targetWeight
                    ? 'Chưa đặt cân nặng mục tiêu'
                    : 'Tiến độ chưa khả dụng'}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
            Bạn chưa đặt mục tiêu nào
          </div>
        )}

        {/* History collapsible */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-800 transition hover:text-brand-green-dark"
          >
            <span>
              Lịch sử mục tiêu{' '}
              <span className="font-medium text-gray-500">({history.length})</span>
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              className={`text-gray-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {historyOpen && (
            <div className="mt-3 space-y-2">
              {history.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                  Bạn chưa từng đổi mục tiêu
                </div>
              ) : (
                history.map((h) => {
                  const g = GOAL_STYLE[h.goalCode];
                  const status = h.isActive ? 'active' : h.endDate ? 'done' : 'dropped';
                  const s = STATUS_LABEL[status];
                  return (
                    <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{g.label}</div>
                          <div className="text-xs text-gray-500">
                            {formatVnDate(h.startDate)} — {formatVnDate(h.endDate)}
                          </div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {modalOpen && (
        <GoalChangeModal
          currentGoalCode={currentGoal?.goalCode}
          onClose={() => setModalOpen(false)}
          onConfirmed={async () => {
            setModalOpen(false);
            await onGoalChanged();
          }}
        />
      )}
    </>
  );
};

export default S3Goal;
```

## FE-3.5. S4HealthSettings

**File mới:** `src/components/profile/sections/S4HealthSettings.tsx`

```tsx
import React from 'react';
import { toast } from 'sonner';
import SectionCard from '../shared/SectionCard';
import { updatePreference } from '../../../services/userPreferences.service';
import type { PreferenceResponse } from '../../../services/userPreferences.service';

interface Props {
  preferences: PreferenceResponse[];
  onPreferenceChanged: () => Promise<void>;
}

const PbfMethodCard: React.FC<{
  icon: string;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, title, desc, selected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 rounded-2xl border-2 p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
      selected
        ? 'border-brand-green bg-brand-green-light'
        : 'border-gray-100 bg-white hover:border-emerald-200'
    }`}
  >
    <div className="mb-3 flex items-start justify-between gap-3">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl text-2xl ${
          selected ? 'bg-white' : 'bg-gray-50'
        }`}
      >
        {icon}
      </div>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          selected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </div>
    <div className={`text-sm font-bold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
      {title}
    </div>
    <p className="mt-1 text-xs leading-5 text-gray-600">{desc}</p>
  </button>
);

const S4HealthSettings: React.FC<Props> = ({ preferences, onPreferenceChanged }) => {
  const pbfPref = preferences.find((p) => p.prefKey === 'pbf_method');
  const currentMethod = pbfPref?.prefValue ?? 'FORMULA';
  const [saving, setSaving] = React.useState(false);

  const handleToggle = async (newMethod: 'FORMULA' | 'MODEL_1') => {
    if (newMethod === currentMethod) return;
    setSaving(true);
    try {
      await updatePreference('pbf_method', { prefValue: newMethod, valueType: 'STRING' });
      toast.success(
        `Đã đổi phương pháp tính PBF sang ${newMethod === 'FORMULA' ? 'Công thức Navy' : 'Model AI'}`
      );
      await onPreferenceChanged();
    } catch (err) {
      toast.error('Không đổi được, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Cài đặt sức khỏe"
      subtitle="Tinh chỉnh cách hệ thống tính các chỉ số của bạn"
    >
      <div className="mb-3">
        <h4 className="text-sm font-bold text-gray-900">Phương pháp tính % mỡ cơ thể</h4>
        <p className="mt-0.5 text-xs text-gray-500">Chọn cách hệ thống tính chỉ số PBF của bạn</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <PbfMethodCard
          icon="⚖️"
          title="Công thức Navy"
          desc="Tính từ chiều cao + vòng eo + vòng cổ (+ hông cho nữ). Nhanh, không cần thiết bị."
          selected={currentMethod === 'FORMULA'}
          onClick={() => handleToggle('FORMULA')}
          disabled={saving}
        />
        <PbfMethodCard
          icon="🧠"
          title="Model AI"
          desc="Sử dụng machine learning để dự đoán chính xác hơn. Cần ít nhất 30 ngày data."
          selected={currentMethod === 'MODEL_1'}
          onClick={() => handleToggle('MODEL_1')}
          disabled={saving}
        />
      </div>
    </SectionCard>
  );
};

export default S4HealthSettings;
```

## FE-3.6. S5Security

**File mới:** `src/components/profile/sections/S5Security.tsx`

```tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { changePasswordSchema, type ChangePasswordData } from '../../../types/profile.schemas';
import { changePassword } from '../../../services/password.service';
import SectionCard from '../shared/SectionCard';

function inputClass(error: boolean): string {
  return `mt-1 w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none transition ${
    error
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
}

const S5Security: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    setSaving(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đã đổi mật khẩu thành công');
      reset();
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'AUTH-011') {
        setError('currentPassword', { message: 'Mật khẩu hiện tại không đúng' });
      } else if (code === 'AUTH-012') {
        setError('newPassword', { message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
      } else {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Bảo mật" subtitle="Đổi mật khẩu đăng nhập của bạn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">Mật khẩu hiện tại *</label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
            className={inputClass(!!errors.currentPassword)}
            disabled={saving}
          />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Mật khẩu mới *</label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={inputClass(!!errors.newPassword)}
            disabled={saving}
          />
          <p className="mt-1 text-xs text-gray-500">Ít nhất 8 ký tự, có chữ HOA và chữ số</p>
          {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">Xác nhận mật khẩu mới *</label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputClass(!!errors.confirmPassword)}
            disabled={saving}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {saving && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default S5Security;
```

## FE-3.7. S6DangerZone (placeholder)

**File mới:** `src/components/profile/sections/S6DangerZone.tsx`

```tsx
import React from 'react';
import { toast } from 'sonner';
import SectionCard from '../shared/SectionCard';

const S6DangerZone: React.FC = () => {
  const handleDelete = () => {
    toast.info('Tính năng đang phát triển. Vui lòng liên hệ admin để xóa tài khoản.');
  };

  return (
    <SectionCard variant="danger">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-red-100 text-red-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-700">VÙNG NGUY HIỂM</h3>
            <p className="mt-1 max-w-md text-sm text-gray-600">
              Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu sức khỏe, lịch sử mục tiêu và thực đơn của bạn.
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 md:w-auto"
        >
          Xóa tài khoản
        </button>
      </div>
    </SectionCard>
  );
};

export default S6DangerZone;
```

## FE-3.8. Update ProfilePage container — import sections

**File:** `src/pages/ProfilePage.tsx` — replace placeholder section bằng:

```tsx
import S1ProfileHeader from '../components/profile/sections/S1ProfileHeader';
import S2PersonalInfo from '../components/profile/sections/S2PersonalInfo';
import S3Goal from '../components/profile/sections/S3Goal';
import S4HealthSettings from '../components/profile/sections/S4HealthSettings';
import S5Security from '../components/profile/sections/S5Security';
import S6DangerZone from '../components/profile/sections/S6DangerZone';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';

// Trong return, thay block placeholder bằng:
<div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 pb-6">
  {loading || !overview ? (
    <ProfileSkeleton />
  ) : (
    <>
      <S1ProfileHeader
        user={user}
        constitution={overview.constitution?.constitution ?? 'CAN_DOI'}
      />
      <S2PersonalInfo user={user} onUpdated={refreshUser} />
      <S3Goal
        currentGoal={overview.currentGoal}
        history={overview.goalHistory}
        currentWeight={overview.metrics?.weight?.value ?? null}
        onGoalChanged={loadProfile}
      />
      <S4HealthSettings
        preferences={overview.preferences}
        onPreferenceChanged={loadProfile}
      />
      <S5Security />
      <S6DangerZone />
    </>
  )}
</div>
```

---

# PHASE FE-4 — MODALS + SKELETON (~1h)

## FE-4.1. GoalChangeModal

**File mới:** `src/components/profile/modals/GoalChangeModal.tsx`

```tsx
import React, { useState } from 'react';
import { toast } from 'sonner';
import { updateCurrentGoal } from '../../../services/userGoals.service';

type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';

interface Props {
  currentGoalCode?: GoalCode;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}

const OPTIONS = [
  { value: 'GIAM' as const, icon: '📉', label: 'GIẢM CÂN', desc: 'Tạo deficit calo. Hệ thống đề xuất khẩu phần nhỏ hơn.' },
  { value: 'DUY_TRI' as const, icon: '⚖️', label: 'DUY TRÌ', desc: 'Cân bằng năng lượng. Giữ trọng lượng hiện tại.' },
  { value: 'TANG' as const, icon: '📈', label: 'TĂNG CÂN', desc: 'Surplus calo lành mạnh. Phù hợp xây cơ.' },
];

const GoalChangeModal: React.FC<Props> = ({ currentGoalCode, onClose, onConfirmed }) => {
  const [selected, setSelected] = useState<GoalCode>(currentGoalCode ?? 'DUY_TRI');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (selected === currentGoalCode) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await updateCurrentGoal({ goalCode: selected, targetDurationMonths: 6 });
      toast.success('Đã đổi mục tiêu');
      await onConfirmed();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không đổi được mục tiêu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">Đổi mục tiêu</h3>
          <p className="mt-1 text-sm text-gray-600">Chọn mục tiêu phù hợp với tình trạng hiện tại của bạn.</p>

          <div className="mt-5 space-y-3">
            {OPTIONS.map((opt) => {
              const isSelected = opt.value === selected;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelected(opt.value)}
                  disabled={saving}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    isSelected
                      ? 'border-brand-green bg-brand-green-light'
                      : 'border-gray-100 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-2xl">
                    {opt.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${isSelected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
                      {opt.label}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-600">{opt.desc}</p>
                  </div>
                  <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 ${
                    isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {saving && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalChangeModal;
```

## FE-4.2. ProfileSkeleton

**File mới:** `src/components/profile/ProfileSkeleton.tsx`

```tsx
import React from 'react';

const ProfileSkeleton: React.FC = () => (
  <>
    <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
  </>
);

export default ProfileSkeleton;
```

## FE-4.3. Verify Phase FE-4

```bash
npx tsc -b --pretty false
npm run dev
```

Refresh `/profile` → thấy skeleton loading 6 card → sau đó render đầy đủ 6 section.

---

# PHASE FE-5 — INTEGRATION TEST (~30 phút)

## FE-5.1. Test cases manual

### Test 1: Routing
- [ ] Login → click avatar dropdown → "Hồ sơ của tôi" → `/profile`
- [ ] Breadcrumb hiển thị đúng
- [ ] Refresh trang → vẫn ở `/profile`

### Test 2: Section 1 Header
- [ ] Avatar hiển thị chữ cái đầu tên
- [ ] Tên đầy đủ, email từ `user.email`, "Tham gia từ MM/YYYY" từ `user.createdAt`
- [ ] ConstitutionPill màu đúng theo `overview.constitution.constitution`

### Test 3: Section 2 Personal Info
- [ ] View mode: 4 field readonly, pencil icon góc phải
- [ ] Click pencil → edit mode hiển thị form
- [ ] Edit name → "Lưu thay đổi" → toast success + về view mode + name cập nhật
- [ ] Edit + clear phone → save → DB phone = null, view mode hiển thị "Chưa cập nhật"
- [ ] Edit + nhập date sai tuổi (< 13 hoặc > 100) → error inline
- [ ] Edit + click "Hủy" → về view mode KHÔNG save

### Test 4: Section 3 Goal
- [ ] Hiển thị goal hiện tại với icon + label
- [ ] Progress bar render đúng nếu có startWeight/targetWeight/currentWeight
- [ ] DUY_TRI: không có progress bar
- [ ] startWeight null: empty state "Chưa có dữ liệu cân nặng khởi điểm"
- [ ] Click "Đổi mục tiêu" → modal mở
- [ ] Modal chọn goal khác + xác nhận → toast + section refresh với goal mới
- [ ] Click "Lịch sử mục tiêu" → expand/collapse work
- [ ] Empty history: "Bạn chưa từng đổi mục tiêu"

### Test 5: Section 4 Health Settings
- [ ] PbfMethodCard FORMULA selected (default) hiển thị đúng
- [ ] Click MODEL_1 → toast success + selected state đổi
- [ ] Reload Dashboard → ConstitutionCard hiển thị PBF source mới

### Test 6: Section 5 Security
- [ ] Submit form rỗng → validation error inline
- [ ] Submit password sai → error inline "Mật khẩu hiện tại không đúng"
- [ ] Submit password mới giống cũ → error inline "Mật khẩu mới phải khác..."
- [ ] Submit password không đủ policy (vd "12345678") → error "Mật khẩu phải có ít nhất 1 chữ HOA"
- [ ] Submit password thành công → toast + clear form
- [ ] Logout + login với password mới → thành công

### Test 7: Section 6 Danger Zone
- [ ] Render với border đỏ + icon cảnh báo
- [ ] Click "Xóa tài khoản" → toast info "Tính năng đang phát triển..."

### Test 8: Responsive
- [ ] Desktop 1920px: form grid 2 cột, max-width 880px
- [ ] Tablet 768px: stack vertical
- [ ] Mobile 380px: stack vertical, button full-width

## FE-5.2. Verify với BE đã merge

Quan trọng: BE đã chạy với contract mới. Verify:

- [ ] `getProfileOverview()` không throw — 5 API call parallel pass
- [ ] `GET /currentUser` response có `email`, `createdAt`
- [ ] `PUT /api/user/profile` với `phone: null` → DB clear
- [ ] `PUT /api/auth/change-password` flow hoạt động
- [ ] `getDashboardMetrics()` work (regression cũ KHÔNG bị break)
- [ ] `getLatestHealthData()` work (FE-0 regression OK)

---

# F. ⚠ TRAPS CỰC KỲ DỄ SAI

## F1. KHÔNG hardcode sample data từ design

Trong `profile-sectionsV1.jsx` design source có:
- `name = 'Nguyễn Văn Chiến'`
- `email = 'chien.nguyen@healthcare.vn'`
- `joined = 'Tham gia từ 03/2026'`
- `currentWeight = 71.2, startWeight = 75`

Đây là **SAMPLE DATA cho preview**, KHÔNG được copy. Bind với:
- `user.name`, `user.email`, `user.createdAt`
- `overview.currentGoal.startWeightKg`, `overview.metrics.weight.value`

## F2. KHÔNG bỏ `unwrapDataResponse` ở healthData.service.ts cũ

Sau Phase FE-0, các function trong `healthData.service.ts` PHẢI dùng `unwrapDataResponse`. Nếu agent FE quên 1 function nào → trang dùng function đó sẽ break sau BE merge.

→ Test cả 3 trang: SubmitHealthDataPage, HomePage, TrendChart.

## F3. Phone: empty string → null

Trong onSubmit của S2:
```typescript
phone: data.phone ? data.phone : null,
```

KHÔNG gửi `data.phone` trực tiếp (sẽ là `""` nếu user clear) — BE expect null để clear field.

## F4. Confirm password: chỉ validate ở FE

Backend KHÔNG có `confirmPassword` field. FE Zod schema có refine match. KHÔNG gửi `confirmPassword` lên BE.

## F5. JWT vẫn hợp lệ sau change password

Sau đổi password thành công, KHÔNG cần logout user. Token cũ vẫn work. Chỉ reset form, hiển thị toast.

## F6. Mobile responsive: button full-width

S6 Danger Zone button trên mobile phải `w-full`. Đã có `md:w-auto` để desktop hiển thị inline.

## F7. KHÔNG thêm `confirmPassword` interface trong service

```typescript
// SAI:
export const changePassword = (payload: { currentPassword, newPassword, confirmPassword }) => ...

// ĐÚNG:
export const changePassword = (payload: { currentPassword, newPassword }) => ...
```

## F8. ConstitutionPill nhận `value` props là enum code, không phải display label

```tsx
// SAI:
<ConstitutionPill value="Cân đối" />

// ĐÚNG:
<ConstitutionPill value="CAN_DOI" />
```

Component nội bộ map code → display label.

## F9. Progress bar: chỉ tính cho GIAM và TANG, không tính DUY_TRI

DUY_TRI mục tiêu là "giữ ổn định" — không có target weight cụ thể → progress bar không có nghĩa. Ẩn hoàn toàn.

## F10. Empty state goal history không hiển thị table

Khi `history.length === 0`, render text "Bạn chưa từng đổi mục tiêu" trong khung gray, KHÔNG render table rỗng.

---

# G. DELIVERABLES

## Files mới

- [ ] `src/pages/ProfilePage.tsx`
- [ ] `src/services/password.service.ts`
- [ ] `src/services/profile.service.ts`
- [ ] `src/types/profile.schemas.ts`
- [ ] `src/components/profile/shared/SectionCard.tsx`
- [ ] `src/components/profile/shared/Avatar.tsx`
- [ ] `src/components/profile/shared/ConstitutionPill.tsx`
- [ ] `src/components/profile/shared/FieldRow.tsx`
- [ ] `src/components/profile/shared/Segmented.tsx`
- [ ] `src/components/profile/shared/ProgressBar.tsx`
- [ ] `src/components/profile/shared/EditIconButton.tsx`
- [ ] `src/components/profile/sections/S1ProfileHeader.tsx`
- [ ] `src/components/profile/sections/S2PersonalInfo.tsx`
- [ ] `src/components/profile/sections/S3Goal.tsx`
- [ ] `src/components/profile/sections/S4HealthSettings.tsx`
- [ ] `src/components/profile/sections/S5Security.tsx`
- [ ] `src/components/profile/sections/S6DangerZone.tsx`
- [ ] `src/components/profile/modals/GoalChangeModal.tsx`
- [ ] `src/components/profile/ProfileSkeleton.tsx`

## Files update

- [ ] `src/App.tsx` (add `/profile` route)
- [ ] `src/components/layout/TopHeader.tsx` (add user menu link)
- [ ] `src/services/auth.service.ts` (add email + createdAt to UserProfileData)
- [ ] `src/services/userGoals.service.ts` (add startWeightKg + getGoalHistory)
- [ ] `src/services/healthData.service.ts` (wrap with unwrapDataResponse — 3 functions)
- [ ] `src/services/user.service.ts` (verify hoặc add updateUserProfile if missing)

## Commits gợi ý

```bash
# FE-0
git commit -m "fix(ui): wrap legacy health-data calls with unwrapDataResponse

BE refactored health-data-service to use DataResponse<T>. Legacy
healthData.service.ts was parsing raw response — now uses
unwrapDataResponse for backward-compat."

# FE-1
git commit -m "feat(profile): service layer for profile page

Add password.service, profile.service (aggregate), update auth.service
UserProfileData with email/createdAt, update userGoals.service with
startWeightKg and getGoalHistory()."

# FE-2
git commit -m "feat(profile): routing + container + shared atoms"

# FE-3
git commit -m "feat(profile): build 6 sections (header, personal info, goal,
health settings, security, danger zone)"

# FE-4
git commit -m "feat(profile): GoalChangeModal + ProfileSkeleton"
```

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 26/05/2026 | v1.0 | Hướng dẫn FE đầy đủ cho Profile page. 6 phase: (FE-0) Regression fix healthData.service.ts sau BE refactor, (FE-1) Service layer, (FE-2) Routing + atoms, (FE-3) 6 sections, (FE-4) Modals + skeleton, (FE-5) Integration test. 8 test scenarios, ~7-8h work. Prerequisite: BE đã hoàn thành toàn bộ doc BE riêng. |
