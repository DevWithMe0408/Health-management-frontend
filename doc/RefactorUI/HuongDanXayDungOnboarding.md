# HƯỚNG DẪN AGENT FE — XÂY DỰNG ONBOARDING WIZARD

> **Đối tượng:** Code agent thực hiện implement frontend.
> **Mục đích:** Hướng dẫn step-by-step để build trang `/onboarding/wizard` 5 step theo spec đã chốt.
>
> **PHẢI ĐỌC TRƯỚC khi code:**
> - `onboarding_spec.md` — spec hành vi đầy đủ
> - `backend_endpoint_spec.md` — endpoint BE phụ thuộc
> - 4 file design Claude Design (sẽ paste vào project): `wizard-shared.jsx`, `wizard-steps-1-3.jsx`, `wizard-steps-4-5.jsx`, `Onboarding_Wizard.html`
>
> **Repo FE:** branch `master` của `Health-management-frontend`
> **Repo BE:** branch `feature/onboarding-dashboard-be` của `HealthManagement`

---

## 0. CONTEXT TỪ CODEBASE HIỆN TẠI (đã verify clone repo)

### 0.1. Stack & dependencies có sẵn

```json
"react": "^19.1.0",
"react-router-dom": "^7.6.1",
"react-hook-form": "^7.56.4",
"@hookform/resolvers": "^5.0.1",
"zod": "^3.25.36",
"axios": "^1.9.0",
"sonner": "^2.0.7",                 // toast notification
"framer-motion": "^11.18.2",
"recharts": "^2.15.3",
"@heroicons/react": "^2.2.0",
"tailwindcss": "^4.1.8",
"@tailwindcss/forms": "^0.5.10"
```

**KHÔNG có Zustand** → dùng **React Context** theo pattern `AuthContext`.

### 0.2. Patterns hiện có cần tuân theo

| Pattern | File reference | Áp dụng cho |
|---|---|---|
| Context state | `src/contexts/AuthContext.tsx` | Tạo `OnboardingContext` tương tự |
| Protected route | `src/components/common/ProtectedRoute.tsx` | Tạo `OnboardingRoute` + `RequireOnboardingComplete` |
| API service | `src/services/auth.service.ts`, `src/services/user.service.ts` | Tạo `onboarding.service.ts`, `userGoals.service.ts`, `userPreferences.service.ts`, `constitution.service.ts` |
| Axios interceptor | `src/services/axios.ts` | DÙNG LẠI `apiClient` đã có (auto attach token + auto refresh) |
| Form validation | `src/types/auth.schemas.ts`, `src/types/healthData.schemas.ts` | Tạo `src/types/onboarding.schemas.ts` với Zod |
| Toast | `sonner` library, dùng `toast.success()` / `toast.error()` | Submit success/fail |
| Layout | `src/layouts/AuthLayout.tsx` | Tham khảo, KHÔNG dùng cho onboarding (onboarding có layout riêng full-page) |

### 0.3. Tailwind config có sẵn

```js
'brand-green': {
  DEFAULT: '#059669',  // = brand-green
  'light': '#ecfdf5',  // = brand-green-light
  'dark': '#047857',   // = brand-green-dark
  'darker': '#065f46'  // = brand-green-darker
},
'brand-gray': { DEFAULT: '#6b7280', 'light': '#e5e7eb', 'dark': '#374151' }
```

**Mapping từ design BRAND tokens → Tailwind classes:**

| Design BRAND | Tailwind class |
|---|---|
| `BRAND.green` (#059669) | `brand-green` hoặc `bg-brand-green` |
| `BRAND.greenDark` (#047857) | `brand-green-dark` |
| `BRAND.greenDarker` (#065f46) | `brand-green-darker` |
| `BRAND.greenLight` (#ecfdf5) | `brand-green-light` |
| `BRAND.greenLighter` (#f0fdf4) | `green-50` (Tailwind default) |
| `BRAND.greenTint` (#d1fae5) | `green-100` |
| `BRAND.ink` (#0f1f1a) | `gray-900` hoặc custom |
| `BRAND.text` (#1f2937) | `gray-800` |
| `BRAND.textMid` (#4b5563) | `gray-600` |
| `BRAND.textMute` (#6b7280) | `brand-gray` |
| `BRAND.border` (#e5e7eb) | `brand-gray-light` hoặc `gray-200` |
| `BRAND.borderSoft` (#f1f5f4) | `gray-100` |
| `BRAND.rose` (#dc2626) | `red-600` |

→ **Agent KHÔNG cần update tailwind.config**. Mapping bằng class có sẵn + arbitrary value `bg-[#...]` khi cần exact match.

### 0.4. Font Be Vietnam Pro chưa import

Tailwind config hiện dùng `sans: ['Inter', 'sans-serif']`. Design Claude Design dùng `"Be Vietnam Pro"`.

**Quyết định:** Để KHÔNG đụng config global (có thể ảnh hưởng admin pages), import Be Vietnam Pro chỉ cho onboarding qua `<link>` trong `index.html` HOẶC qua inline `style={{ fontFamily: '"Be Vietnam Pro", ...' }}` trên container root của Onboarding.

**Khuyến nghị: option inline** — local scope, không leak ra page khác.

### 0.5. BE endpoint shape (đã verify clone repo)

| Endpoint | Method | Request body | Response shape |
|---|---|---|---|
| `/api/user/profile` | PUT | `{ name, birthDate, gender, phone }` | `DataResponse<UserResponseDTO>` |
| `/api/user/profile-completed` | PUT | (empty) | `DataResponse<Void>` |
| `/api/user/currentUser` | GET | - | `DataResponse<UserResponseDTO>` với `profileCompleted` field |
| `/api/health-data/submit` | POST | `{ baseMetrics: [{type, value}, ...] }` | `DataResponse<Void>` |
| `/api/health-data/constitution` | GET | - | `DataResponse<ConstitutionResponse>` |
| `/api/user-goals/current` | PUT | `{ goalCode, targetWeightKg?, targetDurationMonths?, note? }` | `DataResponse<UserGoalResponse>` |
| `/api/user-goals/current` | GET | - | `DataResponse<UserGoalResponse>` hoặc 404 nếu chưa có |
| `/api/user-preferences/{key}` | PUT | `{ prefValue, valueType? }` | `DataResponse<PreferenceResponse>` |

**`baseMetrics` items:** `{ type: "HEIGHT"|"WEIGHT"|"WAIST"|"HIP"|"NECK"|"BUST"|"ACTIVITY_FACTOR", value: number }`. Dùng enum `IndicatorTypeName` đã có ở `src/model/IndicatorType.ts`.

**Gender enum BE:** `"MALE"`, `"FEMALE"`, `"OTHER"`. Không phải `"M"`/`"F"`.

**Goal enum BE:** `"GIAM"`, `"DUY_TRI"`, `"TANG"`.

---

## 1. ⚠ ISSUE PHẢI FIX TRƯỚC (BLOCKER)

### 1.1. `UserProfileData` thiếu fields → routing guard không work

File `src/services/auth.service.ts`:

```typescript
// HIỆN TẠI (THIẾU FIELDS):
export interface UserProfileData {
  userId: string | null;
  username: string;
  roles: string[];
}
```

→ FE không có cách nào check `user.profileCompleted` để redirect onboarding.

**Fix:**

```typescript
export interface UserProfileData {
  userId: string | null;
  username: string;
  roles: string[];

  // === BỔ SUNG ===
  name?: string | null;
  birthDate?: string | null;       // ISO yyyy-mm-dd
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone?: string | null;
  profileCompleted: boolean;       // default false
}
```

**Verify BE response:** Mở Postman, login + GET `/api/user/currentUser`, đảm bảo response data có đủ 5 field này. Nếu BE chỉ trả 3 field cũ → flag ngay với agent BE để update `UserController.getCurrentUser()` response DTO.

### 1.2. AuthContext cần re-fetch profile sau mỗi update

Khi onboarding submit thành công, `user.profileCompleted` đổi `false → true`. Nhưng AuthContext chỉ fetch profile khi mount lần đầu.

**Fix:** Thêm method `refreshUser()` vào AuthContext:

```typescript
// Trong AuthContext.tsx, thêm vào interface:
refreshUser: () => Promise<void>;

// Implementation:
const refreshUser = async () => {
  if (!accessToken) return;
  try {
    const userProfile = await getCurrentUserProfile(accessToken);
    setUser(userProfile);
  } catch (err) {
    console.error('refreshUser failed:', err);
  }
};

// Export trong value:
<AuthContext.Provider value={{ ..., refreshUser }}>
```

Onboarding submit cuối cùng gọi `refreshUser()` → trigger re-render App.tsx → routing guard pick up `profileCompleted=true`.

---

## 2. ROUTING SETUP

### 2.1. Tạo `OnboardingRoute` guard

**File mới:** `src/components/common/OnboardingRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

/**
 * Guard cho /onboarding/wizard.
 * - Chưa login → redirect /login
 * - Đã login + profileCompleted=true → redirect /dashboard
 * - Đã login + profileCompleted=false → render onboarding
 */
const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.profileCompleted === true) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default OnboardingRoute;
```

### 2.2. Update `ProtectedRoute` để redirect onboarding khi cần

```typescript
// src/components/common/ProtectedRoute.tsx
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // === BỔ SUNG: chưa hoàn tất onboarding → buộc onboard trước ===
  if (user && user.profileCompleted === false) {
    return <Navigate to="/onboarding/wizard" replace />;
  }

  return <>{children}</>;
};
```

### 2.3. Thêm route trong `App.tsx`

```typescript
// Import:
import OnboardingRoute from './components/common/OnboardingRoute';
import OnboardingWizardPage from './pages/OnboardingWizardPage';

// Thêm route trong <Routes>:
<Route
  path="/onboarding/wizard"
  element={
    <OnboardingRoute>
      <OnboardingWizardPage />
    </OnboardingRoute>
  }
/>
```

Lưu ý: KHÔNG bọc trong `MainLayout` vì onboarding là full-page no sidebar.

### 2.4. Sau login redirect logic

File `LoginPage.tsx` hoặc nơi xử lý sau login: thay `navigate('/dashboard')` bằng logic check:

```typescript
// Sau loginUser + getCurrentUserProfile thành công:
if (user.profileCompleted === false) {
  navigate('/onboarding/wizard', { replace: true });
} else {
  navigate('/dashboard', { replace: true });
}
```

---

## 3. STATE MANAGEMENT — Context thay vì Zustand

### 3.1. Tạo OnboardingContext

**File mới:** `src/contexts/OnboardingContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface OnboardingState {
  // Meta
  currentStep: number;       // 1-5

  // Step 2
  goalCode: GoalCode | null;

  // Step 3
  fullName: string;
  birthDate: string;         // ISO yyyy-mm-dd
  gender: Gender | null;
  phone: string;

  // Step 4
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;

  // Step 5 (optional)
  waistCm: number | null;
  hipCm: number | null;
  neckCm: number | null;
  bustCm: number | null;
}

interface OnboardingContextType {
  state: OnboardingState;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingState>) => void;
  reset: () => void;
}

const STORAGE_KEY = 'onboarding-state';

const initialState: OnboardingState = {
  currentStep: 1,
  goalCode: null,
  fullName: '', birthDate: '', gender: null, phone: '',
  heightCm: null, weightKg: null, activityFactor: null,
  waistCm: null, hipCm: null, neckCm: null, bustCm: null,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    // Restore từ sessionStorage (mất khi đóng tab)
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return { ...initialState, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to restore onboarding state:', e);
    }
    return initialState;
  });

  // Auto-persist mỗi khi state thay đổi
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist onboarding state:', e);
    }
  }, [state]);

  const setStep = (step: number) => setState((s) => ({ ...s, currentStep: step }));
  const updateData = (data: Partial<OnboardingState>) => setState((s) => ({ ...s, ...data }));
  const reset = () => {
    setState(initialState);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider value={{ state, setStep, updateData, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
```

### 3.2. Wrap OnboardingPage với Provider

```typescript
// src/pages/OnboardingWizardPage.tsx
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

const OnboardingWizardPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
};

export default OnboardingWizardPage;
```

→ Reset state khi unmount? KHÔNG cần — sessionStorage tự clear khi đóng tab. Nếu user submit thành công, gọi `reset()` ở callback success.

---

## 4. VALIDATION SCHEMA (Zod)

**File mới:** `src/types/onboarding.schemas.ts`

```typescript
import { z } from 'zod';

export const step2Schema = z.object({
  goalCode: z.enum(['GIAM', 'DUY_TRI', 'TANG'], {
    required_error: 'Vui lòng chọn mục tiêu',
  }),
});

// Helper: compute age từ birthDate ISO string
export function computeAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const step3Schema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên quá dài (tối đa 100 ký tự)'),
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

export const step4Schema = z.object({
  heightCm: z.number({ required_error: 'Vui lòng nhập chiều cao' })
    .min(100, 'Chiều cao tối thiểu 100cm')
    .max(250, 'Chiều cao tối đa 250cm'),
  weightKg: z.number({ required_error: 'Vui lòng nhập cân nặng' })
    .min(30, 'Cân nặng tối thiểu 30kg')
    .max(300, 'Cân nặng tối đa 300kg'),
  activityFactor: z.number({ required_error: 'Vui lòng chọn mức vận động' })
    .refine(
      (v) => [1.2, 1.375, 1.55, 1.725, 1.9].includes(v),
      'Vui lòng chọn 1 mức vận động'
    ),
});

// Step 5 — số đo OPTIONAL, nhưng nếu nhập phải hợp lệ
export const step5Schema = z.object({
  waistCm: z.number().min(40).max(200).nullable().optional(),
  hipCm: z.number().min(50).max(200).nullable().optional(),
  neckCm: z.number().min(20).max(60).nullable().optional(),
  bustCm: z.number().min(50).max(200).nullable().optional(),
});

export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
```

---

## 5. SERVICE LAYER

### 5.1. Tạo các service mới

**File mới:** `src/services/userGoals.service.ts`

```typescript
import { apiClient } from './axios';

type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export interface UserGoalResponse {
  id: string;
  goalCode: GoalCode;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  targetWeightKg: number | null;
  targetDurationMonths: number | null;
  note: string | null;
}

export interface UpdateGoalPayload {
  goalCode: GoalCode;
  targetWeightKg?: number | null;
  targetDurationMonths?: number;
  note?: string;
}

export const updateCurrentGoal = async (
  payload: UpdateGoalPayload
): Promise<UserGoalResponse> => {
  const response = await apiClient.put<DataResponse<UserGoalResponse>>(
    '/api/user-goals/current',
    payload
  );
  return response.data.data;
};

export const getCurrentGoal = async (): Promise<UserGoalResponse | null> => {
  try {
    const response = await apiClient.get<DataResponse<UserGoalResponse>>(
      '/api/user-goals/current'
    );
    return response.data.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};
```

**File mới:** `src/services/constitution.service.ts`

```typescript
import { apiClient } from './axios';

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export interface ConstitutionResponse {
  constitution: 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';
  method: string;
  bmi: number | null;
  pbf: number | null;
  pbfSource: 'FORMULA' | 'MODEL_1';
  bmiClass: number | null;
  pbfClass: number | null;
  finalClass: number;
  suggestedGoal: 'GIAM' | 'DUY_TRI' | 'TANG' | null;
  warning: string | null;
  computedAt: string;
}

/**
 * Lấy phân loại thể trạng. Có retry exponential backoff vì sau onboarding
 * submit, BE cần ~1-2s để RabbitMQ sync + pipeline tính PBF xong.
 */
export const getConstitution = async (
  retries = 3,
  initialDelayMs = 1500
): Promise<ConstitutionResponse> => {
  let lastError: any;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2; // exponential: 1.5s → 3s → 6s
    }
    try {
      const response = await apiClient.get<DataResponse<ConstitutionResponse>>(
        '/api/health-data/constitution'
      );
      return response.data.data;
    } catch (err: any) {
      lastError = err;
      const code = err.response?.data?.code;
      // Retry nếu MISSING_PROFILE/MISSING_BASIC_DATA — đây có thể là RabbitMQ chậm
      if (code === 'MISSING_PROFILE' || err.response?.status === 422) {
        console.log(`Constitution attempt ${attempt + 1} failed (${code}), retry in ${delay}ms...`);
        continue;
      }
      throw err; // Lỗi khác → fail ngay
    }
  }
  throw lastError;
};
```

**File mới:** `src/services/onboarding.service.ts`

```typescript
import { apiClient } from './axios';
import type { IndicatorTypeName } from '../model/IndicatorType';
import { getConstitution } from './constitution.service';
import { updateCurrentGoal } from './userGoals.service';
import type { ConstitutionResponse } from './constitution.service';

interface BaseMetricInput {
  type: IndicatorTypeName;
  value: number;
}

export interface SubmitOnboardingPayload {
  // Step 3
  fullName: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;

  // Step 4
  heightCm: number;
  weightKg: number;
  activityFactor: number;

  // Step 5 (optional)
  waistCm?: number | null;
  hipCm?: number | null;
  neckCm?: number | null;
  bustCm?: number | null;

  // Step 2
  goalCode: 'GIAM' | 'DUY_TRI' | 'TANG';
  targetDurationMonths?: number;
}

export interface OnboardingResult {
  constitution: ConstitutionResponse;
  userGoal: 'GIAM' | 'DUY_TRI' | 'TANG';
  suggestedGoal: 'GIAM' | 'DUY_TRI' | 'TANG' | null;
  goalMismatch: boolean;
}

/**
 * Submit toàn bộ onboarding data theo flow 5 step.
 * Throw nếu bất kỳ step nào fail.
 */
export const submitOnboarding = async (
  payload: SubmitOnboardingPayload
): Promise<OnboardingResult> => {
  // Step 1/5: PUT profile
  await apiClient.put('/api/user/profile', {
    name: payload.fullName,
    birthDate: payload.birthDate,
    gender: payload.gender,
    phone: payload.phone || null,
  });

  // Step 2/5: Submit health data
  const baseMetrics: BaseMetricInput[] = [
    { type: 'HEIGHT', value: payload.heightCm },
    { type: 'WEIGHT', value: payload.weightKg },
    { type: 'ACTIVITY_FACTOR', value: payload.activityFactor },
  ];
  if (payload.waistCm != null) baseMetrics.push({ type: 'WAIST', value: payload.waistCm });
  if (payload.hipCm != null) baseMetrics.push({ type: 'HIP', value: payload.hipCm });
  if (payload.neckCm != null) baseMetrics.push({ type: 'NECK', value: payload.neckCm });
  if (payload.bustCm != null) baseMetrics.push({ type: 'BUST', value: payload.bustCm });

  await apiClient.post('/api/health-data/submit', { baseMetrics });

  // Step 3/5: Set goal
  await updateCurrentGoal({
    goalCode: payload.goalCode,
    targetDurationMonths: payload.targetDurationMonths || 6,
  });

  // Step 4/5: Mark profile completed
  await apiClient.put('/api/user/profile-completed');

  // Step 5/5: Lấy constitution (có retry vì RabbitMQ + pipeline cần ~1-2s)
  const constitution = await getConstitution();

  // Compute mismatch
  const goalMismatch =
    constitution.suggestedGoal !== null &&
    constitution.suggestedGoal !== payload.goalCode;

  return {
    constitution,
    userGoal: payload.goalCode,
    suggestedGoal: constitution.suggestedGoal,
    goalMismatch,
  };
};
```

---

## 6. COMPONENT TREE

Tạo trong `src/components/onboarding/`:

```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx          ← Container chính, switch step
│       ├── shared/
│       │   ├── WizardCard.tsx
│       │   ├── WizardProgress.tsx        (Progress 4 node, Step 2-5)
│       │   ├── WizardNavRow.tsx
│       │   ├── WizardField.tsx
│       │   ├── BackgroundDecor.tsx
│       │   ├── TopBar.tsx
│       │   ├── Logo.tsx
│       │   └── HelpIcon.tsx
│       ├── steps/
│       │   ├── Step1Welcome.tsx
│       │   ├── Step2Goal.tsx
│       │   ├── Step3Personal.tsx
│       │   ├── Step4Activity.tsx
│       │   └── Step5Review.tsx
│       └── GoalRecommendationModal.tsx   ← Modal hiện sau submit nếu mismatch
├── contexts/
│   └── OnboardingContext.tsx
├── pages/
│   └── OnboardingWizardPage.tsx
├── services/
│   ├── userGoals.service.ts
│   ├── userPreferences.service.ts (cho Profile sau này, optional)
│   ├── constitution.service.ts
│   └── onboarding.service.ts
└── types/
    └── onboarding.schemas.ts
```

---

## 7. MAPPING DESIGN → REACT COMPONENT

### 7.1. File design source (paste vào project tạm)

User đã có 4 file design Claude Design output:
- `Onboarding_Wizard.html` (entry, dùng DesignCanvas wrapper — KHÔNG copy)
- `wizard-shared.jsx` (BRAND, BackgroundDecor, Logo, TopBar, Progress, NavRow, WizardCard, HelpIcon)
- `wizard-steps-1-3.jsx` (Step1Welcome, Step2Goal, Step3Personal, Field, CalendarIcon)
- `wizard-steps-4-5.jsx` (Step4Activity, MetricInput, Step5Review, Section, CircumInput, ReviewRow, Spinner)

**Cách dùng:**
1. Copy 3 file `.jsx` vào folder tạm `tmp/design-reference/` (KHÔNG vào src)
2. Đọc style + structure → convert thành TypeScript + Tailwind classes
3. KHÔNG copy nguyên si — design dùng inline style `style={{...}}`, code production dùng Tailwind classes
4. KHÔNG copy `DesignCanvas`, `DCSection`, `DCArtboard`, sample data props (`selected="GIAM"`, `errorState`, `loading`)

### 7.2. Quy tắc convert

**Inline style → Tailwind:**

```jsx
// Design source (KHÔNG copy như vậy):
<div style={{
  background: '#fff',
  borderRadius: 20,
  border: '1px solid #f1f5f4',
  boxShadow: '0 1px 2px rgba(15, 31, 26, 0.04), ...',
  padding: '40px 48px 32px',
}}>

// Production (Tailwind):
<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 md:p-12">
```

**SVG icons → giữ nguyên** (chỉ wrap thành component nếu reuse 3+ chỗ).

**Default values trong design (KHÔNG hardcode):**

```jsx
// Design source:
defaultValue="Nguyễn Minh Anh"
defaultValue="15/03/2002"
selected="GIAM"

// Production: bind với form state, để rỗng
{...register('fullName')}    // react-hook-form binding
value={state.fullName}        // hoặc context binding
```

### 7.3. Component-by-component mapping

#### WizardCard

```typescript
// src/components/onboarding/shared/WizardCard.tsx
import React from 'react';

interface WizardCardProps {
  children: React.ReactNode;
  className?: string;
}

const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => (
  <div
    className={`relative z-10 w-full max-w-[720px] mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 ${className}`}
    style={{ boxShadow: '0 12px 32px -12px rgba(15, 31, 26, 0.12)' }}
  >
    {children}
  </div>
);

export default WizardCard;
```

#### WizardProgress

```typescript
// src/components/onboarding/shared/WizardProgress.tsx
import React from 'react';

interface WizardProgressProps {
  current: number; // 1-4 (Step 2=1, Step 5=4)
}

const labels = ['Mục tiêu', 'Cá nhân', 'Chỉ số', 'Số đo'];

const WizardProgress: React.FC<WizardProgressProps> = ({ current }) => (
  <div className="mb-7">
    <div className="flex items-center">
      {[1, 2, 3, 4].map((n, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div
              className={`w-8 h-8 rounded-full grid place-items-center text-sm font-semibold transition-all flex-shrink-0
                ${done
                  ? 'bg-brand-green border-2 border-brand-green text-white'
                  : active
                    ? 'bg-white border-2 border-brand-green text-brand-green ring-4 ring-brand-green-light'
                    : 'bg-white border border-gray-200 text-gray-400'}`}
            >
              {done ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : n}
            </div>
            {i < 3 && (
              <div className={`flex-1 h-0.5 mx-0.5 rounded ${n < current ? 'bg-brand-green' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
    <div className="mt-3.5 text-sm text-gray-500 font-medium">
      Bước {current}/4 · {labels[current - 1]}
    </div>
  </div>
);

export default WizardProgress;
```

#### WizardNavRow

Convert tương tự — quan trọng: button primary dùng `bg-gradient-to-br from-brand-green to-emerald-500` (match design gradient), disabled dùng `bg-gray-200 text-gray-400`.

```typescript
interface WizardNavRowProps {
  showBack?: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}
```

### 7.4. Step components — pattern chung

Mỗi step component nhận props `onNext`, `onBack` từ `OnboardingWizard` container. Sử dụng `react-hook-form` cho validation:

```typescript
// Example: Step3Personal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, type Step3Data } from '../../../types/onboarding.schemas';
import { useOnboarding } from '../../../contexts/OnboardingContext';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const Step3Personal: React.FC<Props> = ({ onNext, onBack }) => {
  const { state, updateData } = useOnboarding();
  const goalCode = state.goalCode!;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      fullName: state.fullName,
      birthDate: state.birthDate,
      gender: state.gender || undefined,
      phone: state.phone,
    },
  });

  const birthDateValue = watch('birthDate');
  const age = birthDateValue ? computeAge(birthDateValue) : null;

  const onSubmit = (data: Step3Data) => {
    updateData(data);
    onNext();
  };

  const goalLabels: Record<typeof goalCode, string> = {
    GIAM: 'giảm cân hiệu quả',
    DUY_TRI: 'duy trì thể trạng tốt',
    TANG: 'tăng cân lành mạnh',
  };

  return (
    <div /* background page */>
      {/* ... TopBar ... */}
      <WizardCard>
        <WizardProgress current={2} />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Một chút về bạn
        </h2>
        <p className="text-base text-gray-600 mb-6 leading-relaxed">
          Để {goalLabels[goalCode]}, chúng tôi cần biết một vài thông tin cơ bản.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <WizardField label="Họ và tên" required error={errors.fullName?.message} colSpan={2}>
              <input
                type="text"
                placeholder="VD. Nguyễn Minh Anh"
                className={inputClassName(!!errors.fullName)}
                {...register('fullName')}
              />
            </WizardField>

            <WizardField label="Ngày sinh" required error={errors.birthDate?.message} helper={age ? `Bạn ${age} tuổi` : undefined}>
              <input type="date" className={inputClassName(!!errors.birthDate)} {...register('birthDate')} />
            </WizardField>

            <WizardField label="Giới tính" required error={errors.gender?.message}>
              {/* Segmented control 3 buttons */}
              {/* ... convert từ design ... */}
            </WizardField>

            <WizardField label="Số điện thoại" optional error={errors.phone?.message} colSpan={2}>
              <input type="tel" placeholder="0xxx xxx xxx" className={inputClassName(!!errors.phone)} {...register('phone')} />
            </WizardField>
          </div>

          <WizardNavRow onBack={onBack} onNext={handleSubmit(onSubmit)} nextDisabled={!isValid} />
        </form>
      </WizardCard>
    </div>
  );
};

function inputClassName(error: boolean) {
  return `w-full px-3.5 py-3 text-base border rounded-xl outline-none transition-colors
    ${error
      ? 'border-red-500 bg-red-50 focus:border-red-600'
      : 'border-gray-200 bg-white focus:border-brand-green'}`;
}
```

---

## 8. SUBMIT FLOW Ở STEP 5

```typescript
// Trong Step5Review.tsx
import { submitOnboarding } from '../../../services/onboarding.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Step5Review: React.FC<Props> = ({ onBack }) => {
  const { state, reset: resetOnboarding } = useOnboarding();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<OnboardingResult | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitOnboarding({
        fullName: state.fullName,
        birthDate: state.birthDate,
        gender: state.gender!,
        phone: state.phone,
        heightCm: state.heightCm!,
        weightKg: state.weightKg!,
        activityFactor: state.activityFactor!,
        waistCm: state.waistCm,
        hipCm: state.hipCm,
        neckCm: state.neckCm,
        bustCm: state.bustCm,
        goalCode: state.goalCode!,
      });

      // Refresh user (để profileCompleted=true trong AuthContext)
      await refreshUser();

      if (result.goalMismatch) {
        setModalData(result);
        setShowModal(true);
      } else {
        toast.success('Hoàn tất onboarding!');
        resetOnboarding();
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Onboarding submit failed:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // ... render UI ...
  // ... GoalRecommendationModal khi showModal ...
};
```

### 8.1. GoalRecommendationModal

```typescript
// src/components/onboarding/GoalRecommendationModal.tsx
import React from 'react';
import { updateCurrentGoal } from '../../services/userGoals.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Props {
  constitution: 'GAY' | 'CAN_DOI' | 'THUA_CAN' | 'BEO_PHI';
  userGoal: 'GIAM' | 'DUY_TRI' | 'TANG';
  suggestedGoal: 'GIAM' | 'DUY_TRI' | 'TANG';
  onClose: () => void;
}

const CONSTITUTION_LABEL = {
  GAY: 'GẦY', CAN_DOI: 'CÂN ĐỐI', THUA_CAN: 'THỪA CÂN', BEO_PHI: 'BÉO PHÌ',
};
const GOAL_LABEL = { GIAM: 'GIẢM CÂN', DUY_TRI: 'DUY TRÌ', TANG: 'TĂNG CÂN' };

const GoalRecommendationModal: React.FC<Props> = ({
  constitution, userGoal, suggestedGoal, onClose,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleAcceptSuggestion = async () => {
    setLoading(true);
    try {
      await updateCurrentGoal({ goalCode: suggestedGoal, targetDurationMonths: 6 });
      toast.success(`Đã đổi mục tiêu sang ${GOAL_LABEL[suggestedGoal]}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error('Không đổi được mục tiêu, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const handleKeepUserGoal = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚠</span>
          <h2 className="text-lg font-bold text-amber-700 uppercase tracking-wide">
            Khuyến cáo mục tiêu
          </h2>
        </div>

        <p className="text-gray-700 mb-4">
          Dựa trên thể trạng của bạn (<b>{CONSTITUTION_LABEL[constitution]}</b>),
          chúng tôi đề xuất mục tiêu phù hợp là:
        </p>

        <div className="bg-brand-green-light border-2 border-brand-green rounded-xl p-4 mb-4 text-center">
          <div className="text-2xl font-bold text-brand-green-darker">
            {GOAL_LABEL[suggestedGoal]}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Bạn đã chọn: <b>{GOAL_LABEL[userGoal]}</b>
        </p>

        <div className="space-y-3">
          <button
            onClick={handleAcceptSuggestion}
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang cập nhật...' : `Đổi sang ${GOAL_LABEL[suggestedGoal]} (khuyến nghị)`}
          </button>
          <button
            onClick={handleKeepUserGoal}
            disabled={loading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-colors"
          >
            Giữ mục tiêu {GOAL_LABEL[userGoal]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalRecommendationModal;
```

**Modal KHÔNG có nút (✕) close** — bắt user chọn 1 trong 2 (xem spec §6.6).

---

## 9. CONTAINER `OnboardingWizard.tsx`

```typescript
import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Step1Welcome from './steps/Step1Welcome';
import Step2Goal from './steps/Step2Goal';
import Step3Personal from './steps/Step3Personal';
import Step4Activity from './steps/Step4Activity';
import Step5Review from './steps/Step5Review';

const OnboardingWizard: React.FC = () => {
  const { state, setStep } = useOnboarding();
  const { currentStep } = state;

  const goNext = () => setStep(currentStep + 1);
  const goBack = () => setStep(currentStep - 1);

  return (
    <div
      className="min-h-screen w-full"
      style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}
    >
      {currentStep === 1 && <Step1Welcome onNext={goNext} />}
      {currentStep === 2 && <Step2Goal onNext={goNext} />}
      {currentStep === 3 && <Step3Personal onNext={goNext} onBack={goBack} />}
      {currentStep === 4 && <Step4Activity onNext={goNext} onBack={goBack} />}
      {currentStep === 5 && <Step5Review onBack={goBack} />}
    </div>
  );
};

export default OnboardingWizard;
```

---

## 10. RESPONSIVE NOTES

- **Mobile (< 768px):** Padding compact (16-20px), grid 1-column, button full-width
- **Desktop (≥ 768px):** Padding rộng (32-40px), grid 2-column ở Step 3/5, max-width 720px centered
- **Test ở 380px:** Step 4 activity cards stack đẹp, không scroll horizontal

---

## 11. ACCEPTANCE TEST CHECKLIST

### 11.1. Happy path (manual test sau khi BE đã chạy ngon)

- [ ] Register user mới → tự động redirect `/onboarding/wizard?step=1` (hoặc `/onboarding/wizard`)
- [ ] Step 1: Click "Bắt đầu" → Step 2, KHÔNG có "Quay lại"
- [ ] Step 2: Click 1 trong 3 goal card → "Tiếp theo" enable → Step 3
- [ ] Step 3: Nhập tên + ngày sinh (tuổi ≥ 13) + giới tính → "Tiếp theo" enable
- [ ] Step 3: helper text "Bạn X tuổi" hiển thị khi nhập đủ ngày sinh hợp lệ
- [ ] Step 4: Nhập height + weight + click 1 activity → "Tiếp theo" enable
- [ ] Step 5: Có thể bỏ trống số đo (CTA "Tôi sẽ cập nhật sau") → "Hoàn tất" vẫn enable
- [ ] Step 5: Click "Hoàn tất" → button loading "Đang phân tích thể trạng của bạn..."
- [ ] Sau ~2-3s: nếu user goal == suggested goal → toast + navigate `/dashboard`
- [ ] Sau ~2-3s: nếu mismatch → modal khuyến cáo hiện
- [ ] Modal: click "Đổi sang ..." → API PUT goal mới → navigate `/dashboard`
- [ ] Modal: click "Giữ mục tiêu ..." → navigate `/dashboard` luôn

### 11.2. Validation

- [ ] Step 3 — name rỗng + click "Tiếp theo": error "Tên phải có ít nhất 2 ký tự"
- [ ] Step 3 — birthDate tuổi < 13: error "Tuổi phải từ 13 đến 100"
- [ ] Step 3 — phone "0123" (sai format): error "Số điện thoại không hợp lệ"
- [ ] Step 4 — height < 100: error
- [ ] Step 5 — vòng eo nhập 999: error "Vòng eo phải ≤ 200cm"

### 11.3. State persistence

- [ ] Reload browser khi đang Step 3 với data đã nhập → restore Step 3 với data đó
- [ ] Đóng tab → mở lại tab mới `/onboarding/wizard` → bắt đầu Step 1 (sessionStorage clear)
- [ ] Click "Quay lại" từ Step 4 → Step 3, data Step 3 vẫn còn

### 11.4. Routing guards

- [ ] User `profileCompleted=true` truy cập `/onboarding/wizard` → redirect `/dashboard`
- [ ] User `profileCompleted=false` truy cập `/dashboard` → redirect `/onboarding/wizard`
- [ ] Logout giữa Step 3 → redirect `/login`, sessionStorage state vẫn còn (sẽ restore khi login lại)

### 11.5. Edge cases

- [ ] Network fail giữa submit Step 5 → toast error + button "Hoàn tất" lại clickable
- [ ] BE chậm trả constitution (3s) → retry tự động tới 3 lần, không fail ngay
- [ ] Submit thành công nhưng GET constitution fail tất cả retry → toast warning, vẫn navigate `/dashboard` (Dashboard sẽ tự xử lý empty state)

---

## 12. ORDER OF IMPLEMENTATION

**Tổng:** Khoảng 2-3 ngày làm việc. Làm tuần tự, KHÔNG nhảy step.

### Phase 1 — Setup (2-4h)

1. Fix `UserProfileData` interface trong `src/services/auth.service.ts` (§1.1)
2. Thêm method `refreshUser` vào `AuthContext` (§1.2)
3. Update `getCurrentUserProfile` để verify response có `profileCompleted` (nếu BE chưa trả → escalate)
4. Tạo file `src/types/onboarding.schemas.ts` (§4)
5. Tạo `src/contexts/OnboardingContext.tsx` (§3.1)

### Phase 2 — Service layer (2-3h)

6. Tạo `src/services/userGoals.service.ts` (§5)
7. Tạo `src/services/constitution.service.ts` với retry logic (§5)
8. Tạo `src/services/onboarding.service.ts` (§5)
9. Test bằng Postman v4 đã có (đảm bảo BE work trước khi build UI)

### Phase 3 — Routing (1-2h)

10. Tạo `OnboardingRoute` guard (§2.1)
11. Update `ProtectedRoute` redirect onboarding (§2.2)
12. Thêm route `/onboarding/wizard` vào `App.tsx` (§2.3)
13. Update logic sau login (§2.4)

### Phase 4 — Shared components (3-4h)

14. Convert `wizard-shared.jsx` → tạo `WizardCard`, `WizardProgress`, `WizardNavRow`, `Logo`, `TopBar`, `BackgroundDecor`, `HelpIcon` (§7)
15. Tạo `WizardField` (label + input + error/helper, support span 1/2)

### Phase 5 — Step components (8-12h)

16. `Step1Welcome.tsx` — convert từ design (đơn giản nhất, ít state)
17. `Step2Goal.tsx` — 3 goal cards, state binding
18. `Step3Personal.tsx` — form 4 field với react-hook-form + Zod
19. `Step4Activity.tsx` — 2 metric inputs + 5 activity cards
20. `Step5Review.tsx` — section số đo + section review readonly + submit flow

### Phase 6 — Modal + Submit (2-3h)

21. `GoalRecommendationModal.tsx`
22. Wire submit flow trong Step 5 với loading + error handling
23. Integration test full flow

### Phase 7 — Polish (2-3h)

24. Responsive test mobile 380px
25. Accessibility (label, aria-*)
26. Toast notifications cho success/error
27. Cleanup console.log + sample defaults

---

## 13. ⚠ CÁC ĐIỂM CỰC KỲ DỄ SAI — AGENT PHẢI CHÚ Ý

### 13.1. KHÔNG hardcode sample data từ design files

Design files có `defaultValue="Nguyễn Minh Anh"`, `defaultValue="15/03/2002"`, `selected="GIAM"`. Đây là **SAMPLE DATA cho preview**, KHÔNG được copy vào component thật. Form rỗng, bind với form state qua `register()`.

### 13.2. RabbitMQ sync delay

Sau `PUT /api/user/profile` + `POST /api/health-data/submit`, BE cần ~1-2s để:
- RabbitMQ publish event `UserProfileUpdatedEvent` → health-data-service mirror update gender
- Pipeline tính BMI/BMR/PBF/WHR xong và lưu `calculated_metric_snapshots`

→ `GET /api/health-data/constitution` ngay sau submit có thể trả 422 `MISSING_PROFILE`. **Đã handle bằng retry logic ở `constitution.service.ts`**, agent KHÔNG được bỏ logic này.

### 13.3. `IndicatorType` enum value phải đúng spelling

BE enum: `HEIGHT`, `WEIGHT`, `WAIST`, `HIP`, `NECK`, `BUST`, `ACTIVITY_FACTOR`.

Sai chính tả `"height"` (lowercase) → BE reject. Dùng `IndicatorTypeName` từ `src/model/IndicatorType.ts` để type-safe.

### 13.4. Gender enum: MALE/FEMALE/OTHER

KHÔNG dùng `"M"`, `"F"`, `"Male"`, `"male"`. Phải exact: `"MALE"`, `"FEMALE"`, `"OTHER"`.

### 13.5. `targetDurationMonths` validation

BE validate `@Min(1) @Max(24)`. Default 6 khi user không set. KHÔNG gửi 0 hoặc null trong PUT body.

### 13.6. AuthContext refresh sau onboarding submit

QUAN TRỌNG: phải gọi `refreshUser()` sau khi submit thành công và TRƯỚC khi navigate `/dashboard`. Không có dòng này → Dashboard render với user `profileCompleted=false` → infinite loop redirect onboarding.

### 13.7. Modal goal mismatch — bắt buộc chọn

KHÔNG có nút (✕) close. KHÔNG có click outside to close. User PHẢI chọn 1 trong 2 button. Lý do: state ambiguous nếu cho dismiss (xem spec §6.6).

### 13.8. State storage SESSIONSTORAGE, không phải localStorage

`localStorage` persist qua nhiều tab + nhiều session → có thể leak data sensitive nếu user share thiết bị. `sessionStorage` tự clear khi đóng tab → an toàn hơn cho onboarding (data sẽ submit ngay khi finish, không cần persist lâu).

### 13.9. Be Vietnam Pro font import

Đã có font import trong design HTML qua `<link>` Google Fonts. Khi convert sang production:

**Option A (khuyến nghị):** Inline style `fontFamily` ở container root của OnboardingWizard → font chỉ apply cho onboarding, không leak admin pages.

**Option B:** Thêm font link vào `index.html` `<head>`, dùng class `font-[Be_Vietnam_Pro]` ở root. Cần test không break các page khác.

KHÔNG: update `tailwind.config.ts` để đổi default font `sans` — sẽ phá tất cả pages khác.

### 13.10. Test với BE branch `feature/onboarding-dashboard-be`

KHÔNG chạy với branch `master` của BE (chưa có endpoint mới). Confirm với user trước khi test:
- BE đã merge `feature/onboarding-dashboard-be` chưa?
- Hoặc agent FE pull branch BE đó về máy run local

---

## 14. DELIVERABLES

Sau khi xong, agent phải có:

### Files mới
- [ ] `src/contexts/OnboardingContext.tsx`
- [ ] `src/components/common/OnboardingRoute.tsx`
- [ ] `src/components/onboarding/OnboardingWizard.tsx`
- [ ] `src/components/onboarding/steps/Step1Welcome.tsx`
- [ ] `src/components/onboarding/steps/Step2Goal.tsx`
- [ ] `src/components/onboarding/steps/Step3Personal.tsx`
- [ ] `src/components/onboarding/steps/Step4Activity.tsx`
- [ ] `src/components/onboarding/steps/Step5Review.tsx`
- [ ] `src/components/onboarding/shared/WizardCard.tsx`
- [ ] `src/components/onboarding/shared/WizardProgress.tsx`
- [ ] `src/components/onboarding/shared/WizardNavRow.tsx`
- [ ] `src/components/onboarding/shared/WizardField.tsx`
- [ ] `src/components/onboarding/shared/BackgroundDecor.tsx`
- [ ] `src/components/onboarding/shared/TopBar.tsx`
- [ ] `src/components/onboarding/shared/Logo.tsx`
- [ ] `src/components/onboarding/shared/HelpIcon.tsx`
- [ ] `src/components/onboarding/GoalRecommendationModal.tsx`
- [ ] `src/pages/OnboardingWizardPage.tsx`
- [ ] `src/services/userGoals.service.ts`
- [ ] `src/services/constitution.service.ts`
- [ ] `src/services/onboarding.service.ts`
- [ ] `src/types/onboarding.schemas.ts`

### Files đã update
- [ ] `src/services/auth.service.ts` — UserProfileData interface
- [ ] `src/contexts/AuthContext.tsx` — thêm `refreshUser`
- [ ] `src/components/common/ProtectedRoute.tsx` — redirect onboarding logic
- [ ] `src/App.tsx` — thêm route `/onboarding/wizard`
- [ ] `src/pages/LoginPage.tsx` — sau login redirect logic

### Manual test pass (Phase 6+ checklist §11)

---

## 15. CONTEXT KHI BÁO CÁO TIẾN ĐỘ

Sau mỗi phase, agent báo lại:
- Phase X xong
- Files mới/update
- Có issue gì không (vd BE response thiếu field, design có gì không khớp với spec)
- Question nếu chưa rõ

KHÔNG nhảy phase. Phase phụ thuộc lẫn nhau: Phase 5 (Step components) cần Phase 1+2+4 xong trước.

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 26/05/2026 | v1.0 | Hướng dẫn ban đầu — verify cấu trúc FE thực tế (clone repo) và adapt spec: dùng React Context thay Zustand, thêm fix UserProfileData interface, mapping Tailwind config có sẵn. |
