# ONBOARDING WIZARD SPECIFICATION

> **Mục đích tài liệu:** Spec đầy đủ cho trang Onboarding Wizard (5 step) để:
> 1. Agent FE implement React component theo design Claude Design đã produce
> 2. Agent BE bổ sung endpoints + schema (user_goals, suggestion logic)
> 3. QA verify acceptance criteria
>
> **Scope:** Page `/onboarding/wizard` cho user mới đăng nhập lần đầu.
>
> **Reference design source:** Files Claude Design output đã upload:
> - `Onboarding_Wizard.html` (entry)
> - `wizard-shared.jsx` (BRAND tokens, Logo, TopBar, Progress, NavRow, WizardCard, HelpIcon)
> - `wizard-steps-1-3.jsx` (Step1Welcome, Step2Goal, Step3Personal, Field, MetricInput equivalents)
> - `wizard-steps-4-5.jsx` (Step4Activity, Step5Review, CircumInput, Section, ReviewRow, Spinner)
>
> **Tham chiếu khác:**
> - `dashboard_spec.md`
> - `backend_endpoint_spec.md`
> - `nghiep_vu_de_xuat_thuc_don_v3.3.md`

---

## 0. CONTEXT VÀ NGUYÊN TẮC

### 0.1. Khi nào hiển thị Onboarding?

User mới sau khi register + login lần đầu → BE check `profile_completed = false` → FE redirect `/onboarding/wizard`.

User cũ đã hoàn tất → KHÔNG hiển thị (truy cập URL `/onboarding/wizard` redirect về `/dashboard`).

**`profile_completed` flag được set true khi:**
- User submit Step 5 thành công (data đầy đủ tối thiểu: name, birthDate, gender, height, weight, activityFactor, goal)
- Số đo cơ thể (waist/neck/hip/bust) OPTIONAL, không bắt buộc

### 0.2. Flow tổng quan 5 step

```
Step 1 (Welcome) → Step 2 (Goal) → Step 3 (Personal) → Step 4 (Activity) → Step 5 (Review)
                                                                                  ↓
                                                                       Submit + Backend compute
                                                                                  ↓
                                                                   Modal "Khuyến cáo mục tiêu"
                                                                       (nếu user goal ≠ suggested)
                                                                                  ↓
                                                                            /dashboard
```

- Step 1: KHÔNG có Progress indicator (chỉ Welcome)
- Step 2-5: Có Progress 4 node (Bước 1/4 → 4/4)
- Step 2: KHÔNG có "Quay lại" (Welcome không cho phép back-and-forth)
- Step 5: button submit thay vì "Tiếp theo" → "Hoàn tất"

### 0.3. Architecture decisions

| Decision | Lựa chọn | Lý do |
|---|---|---|
| State management | **Zustand** store local cho wizard | Đơn giản, persist qua route, không bloat Redux |
| Validation | **Zod schema** per step | Đã có `zod` trong dependencies project FE |
| Form library | **react-hook-form** | Match pattern hiện tại (verify trong package.json) |
| Routing | `/onboarding/wizard?step=N` | URL reflect step → user reload không mất state |
| Persist state | **sessionStorage** | Mất khi đóng tab — không leak data sensitive |
| Style | Tailwind config có sẵn của project | Map từ BRAND tokens (xem §1) |
| Component reuse | `components/admin/Card`, `Button`, `NumericInput` nếu có | Verify với project |

### 0.4. Brand & style mapping

Convert BRAND object từ design sang Tailwind tokens. Add vào `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      brand: {
        green: '#059669',
        'green-dark': '#047857',
        'green-darker': '#065f46',
        'green-light': '#ecfdf5',
        'green-lighter': '#f0fdf4',
        'green-tint': '#d1fae5',
        ink: '#0f1f1a',
      },
      // existing brand colors giữ nguyên
    },
    fontFamily: {
      sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
    },
  },
},
```

Font: import Be Vietnam Pro từ Google Fonts (đã có trong design HTML).

---

## 1. STATE MANAGEMENT

### 1.1. Zustand store

**File:** `src/stores/onboardingStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';
type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface OnboardingState {
  // Step 2
  goalCode: GoalCode | null;

  // Step 3
  fullName: string;
  birthDate: string;       // ISO yyyy-mm-dd
  gender: Gender | null;
  phone: string;           // optional

  // Step 4
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;  // 1.2 / 1.375 / 1.55 / 1.725 / 1.9

  // Step 5 (optional)
  waistCm: number | null;
  hipCm: number | null;
  neckCm: number | null;
  bustCm: number | null;

  // Meta
  currentStep: number;     // 1-5
  loading: boolean;

  // Actions
  setStep: (step: number) => void;
  updateGoal: (goal: GoalCode) => void;
  updatePersonal: (data: Partial<OnboardingState>) => void;
  updateActivity: (data: Partial<OnboardingState>) => void;
  updateMeasurements: (data: Partial<OnboardingState>) => void;
  reset: () => void;
}

const initialState = {
  goalCode: null,
  fullName: '', birthDate: '', gender: null, phone: '',
  heightCm: null, weightKg: null, activityFactor: null,
  waistCm: null, hipCm: null, neckCm: null, bustCm: null,
  currentStep: 1, loading: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      updateGoal: (goal) => set({ goalCode: goal }),
      updatePersonal: (data) => set(data),
      updateActivity: (data) => set(data),
      updateMeasurements: (data) => set(data),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-state',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

### 1.2. Routing guard

**File:** `src/routes/OnboardingGuard.tsx`

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function OnboardingGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // User đã hoàn thành → không vào lại được
  if (user.profileCompleted) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

// Ngược lại — RequireOnboardingComplete cho các page khác:
export function RequireOnboardingComplete() {
  const { user } = useAuth();
  if (user && !user.profileCompleted) {
    return <Navigate to="/onboarding/wizard" replace />;
  }
  return <Outlet />;
}
```

---

## 2. STEP 1 — WELCOME

### 2.1. Mục đích

Trang giới thiệu app, nêu 3 value proposition, CTA "Bắt đầu".

### 2.2. Data & state

- **Input:** không có
- **State:** không thay đổi store
- **Output:** click "Bắt đầu" → navigate Step 2

### 2.3. UI/UX (theo design)

- Background gradient white → green-50 (top → bottom)
- Background blob: `BackgroundDecor variant="center"`
- Top bar: Logo HealthCare (góc trái)
- Center content (max-width 640px):
  - Pill "Mất khoảng 2 phút" (top)
  - H1 "Chào mừng bạn đến với **HealthCare**" (HealthCare có gradient text)
  - Subtitle (1 đoạn ngắn về app)
  - **3 value cards** (icon + title + desc):
    - Cá nhân hóa theo thể trạng
    - Toàn bộ là món Việt quen thuộc
    - Đề xuất thông minh hằng ngày
  - **CTA button** "Bắt đầu →" (gradient green, large)
  - Footer note "Thông tin của bạn được bảo mật..."

### 2.4. Mobile responsive

- Width 390px: padding reduce 80px → 20px top
- H1 font: 44px → 30px
- Logo size: lg
- CTA button width: 100%

### 2.5. Interaction

| Hành động | Behavior |
|---|---|
| Click "Bắt đầu" | navigate `/onboarding/wizard?step=2`, `setStep(2)` |

---

## 3. STEP 2 — MỤC TIÊU

### 3.1. Mục đích

User chọn 1 trong 3 mục tiêu: GIẢM CÂN / DUY TRÌ / TĂNG CÂN.

### 3.2. Data & state

- **Input:** `useOnboardingStore.goalCode` (initial null)
- **Output:** Set `goalCode` → enable "Tiếp theo"

### 3.3. UI/UX

- Top bar: Logo (left)
- `WizardCard` (max-width 720px, padding 40px 48px)
  - `Progress current={1}` (Bước 1/4 · Mục tiêu)
  - H2 "Bạn muốn đạt mục tiêu gì?"
  - Subtitle "Chúng tôi sẽ tùy chỉnh thực đơn của bạn theo mục tiêu này. Bạn có thể đổi sau."
  - **3 goal cards** (grid 3 cols desktop, 1 col mobile):

| Card | id | Title | Desc | Icon |
|---|---|---|---|---|
| 1 | `GIAM` | Giảm cân | Phù hợp khi bạn muốn xuống cân an toàn ~0.5kg/tuần | Arrow down |
| 2 | `DUY_TRI` | Duy trì cân nặng | Giữ ổn định thể trạng và xây dựng thói quen ăn uống lành mạnh | Horizontal line |
| 3 | `TANG` | Tăng cân | Phù hợp khi bạn muốn tăng cân lành mạnh, ưu tiên cơ | Arrow up |

- Selected card: background `brand-green-light`, border `brand-green` 2px, checkmark icon góc trên phải
- `NavRow showBack={false} nextDisabled={!goalCode}`

### 3.4. Validation

```typescript
const step2Schema = z.object({
  goalCode: z.enum(['GIAM', 'DUY_TRI', 'TANG'], {
    required_error: 'Vui lòng chọn mục tiêu',
  }),
});
```

### 3.5. Interaction

| Hành động | Behavior |
|---|---|
| Click card | Set `goalCode`, visual state update |
| Click "Tiếp theo" (chỉ enable khi đã chọn) | Validate → navigate Step 3 |

---

## 4. STEP 3 — THÔNG TIN CÁ NHÂN

### 4.1. Mục đích

Thu thập: họ tên, ngày sinh, giới tính, số điện thoại (optional).

### 4.2. Data & state

| Field | Required | Type | Validation |
|---|---|---|---|
| `fullName` | ✅ | string | min 2, max 100 chars, không chỉ space |
| `birthDate` | ✅ | string ISO yyyy-mm-dd | tuổi 13-100 (tính từ today) |
| `gender` | ✅ | `MALE` / `FEMALE` / `OTHER` | enum |
| `phone` | ❌ | string | optional, regex VN: `^0\d{9,10}$` |

### 4.3. UI/UX

`WizardCard`:
- `Progress current={2}`
- H2 "Một chút về bạn"
- Subtitle dynamic: "Để {goalLabel}, chúng tôi cần biết một vài thông tin cơ bản."
  - goalLabel computed từ `goalCode`:
    - GIAM → "giảm cân hiệu quả"
    - DUY_TRI → "duy trì thể trạng tốt"
    - TANG → "tăng cân lành mạnh"
- Grid 2-column (mobile 1 col):
  - **Họ và tên** (span 2 cols, required)
  - **Ngày sinh** (date picker, required, helper "Bạn X tuổi" khi nhập đủ)
  - **Giới tính** (segmented control 3 buttons: Nam/Nữ/Khác, required, có HelpIcon tooltip "Giới tính dùng để tính chính xác nhu cầu calo cơ bản (BMR) theo công thức Mifflin-St Jeor")
  - **Số điện thoại** (span 2 cols, optional badge, helper tooltip "Dùng để gửi nhắc nhở bữa ăn (tùy chọn)")
- `NavRow nextDisabled={!isValid}`

### 4.4. Validation logic

```typescript
const step3Schema = z.object({
  fullName: z.string().trim().min(2, 'Tên quá ngắn').max(100, 'Tên quá dài'),
  birthDate: z.string().refine((val) => {
    const age = computeAge(val);
    return age >= 13 && age <= 100;
  }, 'Tuổi phải từ 13 đến 100'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional().refine(
    (val) => !val || /^0\d{9,10}$/.test(val),
    'Số điện thoại không hợp lệ'
  ),
});
```

### 4.5. States

| State | Behavior |
|---|---|
| Default | Form rỗng, "Tiếp theo" disabled |
| Filling | Nhập field → enable khi valid |
| Error (vd để trống name + submit) | Field highlight đỏ, error message dưới input |
| Valid | "Tiếp theo" enabled |

### 4.6. Interaction

| Hành động | Behavior |
|---|---|
| Blur field | Validate field đó |
| Click "Tiếp theo" | Validate full form → save store → navigate Step 4 |
| Click "Quay lại" | Save current state → navigate Step 2 |

---

## 5. STEP 4 — VẬN ĐỘNG + CHIỀU CAO/CÂN NẶNG

### 5.1. Mục đích

Thu thập chiều cao, cân nặng, hệ số vận động.

### 5.2. Data & state

| Field | Required | Type | Range |
|---|---|---|---|
| `heightCm` | ✅ | number | 100-250 |
| `weightKg` | ✅ | number | 30-300 |
| `activityFactor` | ✅ | number | 1 trong 5 mức |

5 mức activity:

| id | factor | Title | Desc |
|---|---|---|---|
| IT | 1.2 | Ít vận động | Làm văn phòng cả ngày, hầu như không tập |
| NHE | 1.375 | Vận động nhẹ | Đi bộ thường xuyên, tập 1-3 buổi/tuần |
| VUA | 1.55 | Vận động vừa | Tập đều 3-5 buổi/tuần |
| NHIEU | 1.725 | Vận động nhiều | Tập 6-7 buổi/tuần |
| RAT_NHIEU | 1.9 | Rất vận động | Lao động chân tay nặng + tập gym |

### 5.3. UI/UX

`WizardCard`:
- `Progress current={3}`
- H2 "Mức độ vận động hằng ngày?"
- Subtitle "Chọn mức gần nhất với lối sống của bạn..."
- **Top row** (grid 2 cols): MetricInput cho Chiều cao + Cân nặng (đơn vị suffix)
- **Activity cards** (5 cards vertical stack):
  - Emoji icon (left)
  - Title + desc (center)
  - Radio dot (right, filled khi selected)
  - Selected: background `green-light`, border `green` 2px
- `NavRow nextDisabled={!isValid}`

### 5.4. Validation

```typescript
const step4Schema = z.object({
  heightCm: z.number().min(100, 'Chiều cao tối thiểu 100cm').max(250),
  weightKg: z.number().min(30).max(300),
  activityFactor: z.number().refine(
    (v) => [1.2, 1.375, 1.55, 1.725, 1.9].includes(v),
    'Vui lòng chọn mức vận động'
  ),
});
```

### 5.5. Interaction

| Hành động | Behavior |
|---|---|
| Type height/weight | Validate inline (range) |
| Click activity card | Set `activityFactor` |
| Click "Tiếp theo" | Validate → save store → navigate Step 5 |
| Click "Quay lại" | Navigate Step 3 |

---

## 6. STEP 5 — SỐ ĐO + REVIEW + SUBMIT

### 6.1. Mục đích

(1) Thu thập số đo vòng cơ thể (optional cho tính PBF chính xác).
(2) Cho user review toàn bộ thông tin trước khi submit.
(3) Submit → backend tính constitution → hiển thị khuyến cáo nếu mục tiêu mismatch.

### 6.2. Data & state

| Field | Required | Type | Range |
|---|---|---|---|
| `waistCm` | ❌ | number | 40-200 |
| `hipCm` | ❌ | number | 50-200 (chỉ cần nếu nữ) |
| `neckCm` | ❌ | number | 20-60 |
| `bustCm` | ❌ | number | 50-200 |

### 6.3. UI/UX

`WizardCard`:
- `Progress current={4}`
- H2 "Hoàn thiện hồ sơ"
- Subtitle "Số đo nâng cao (tùy chọn) và xem lại toàn bộ thông tin trước khi tạo thực đơn."
- **Info banner** (green-light bg): "💡 Có các số đo này, hệ thống sẽ tính được % mỡ cơ thể chính xác hơn. Nếu chưa có thước dây, bạn có thể bỏ qua và cập nhật sau."
- **Section "Số đo cơ thể" (collapsible):**
  - Grid 2 cols: Vòng eo, Vòng hông, Vòng cổ, Vòng ngực (mỗi field có HelpIcon tooltip vị trí đo)
  - Hint nhỏ "Để chính xác, đo lúc thở ra"
  - CTA text-button bên dưới: "Tôi sẽ cập nhật sau →" (skip, không yêu cầu nhập)
- **Section "Tóm tắt thông tin"** (review readonly):
  - Background `gray-50`, border soft
  - 5 ReviewRow: 🎯 Mục tiêu, 👤 Họ và tên, 🎂 Tuổi · Giới tính, 📏 Chiều cao · Cân nặng, 🚶 Mức vận động
  - Mỗi row có icon edit (pencil) bên phải → click navigate về step tương ứng
- **CTA row** (cuối):
  - "Quay lại" (text button, left)
  - "Hoàn tất ✓" (primary, large, gradient green, right)

### 6.4. Validation

Số đo là OPTIONAL nhưng nếu nhập phải hợp lệ:

```typescript
const step5Schema = z.object({
  waistCm: z.number().min(40).max(200).optional().nullable(),
  hipCm: z.number().min(50).max(200).optional().nullable(),
  neckCm: z.number().min(20).max(60).optional().nullable(),
  bustCm: z.number().min(50).max(200).optional().nullable(),
});
```

### 6.5. Submit flow

```
User click "Hoàn tất"
        ↓
Button → loading state
"Đang phân tích thể trạng của bạn..." + spinner
        ↓
[1] FE: PUT /api/user/profile (name, birthDate, gender, phone)
        → BE publishes UserProfileUpdatedEvent → health-data-service mirror update
[2] FE: POST /api/health-data/submit
        body: {
          baseMetrics: [
            { type: HEIGHT, value: 168 },
            { type: WEIGHT, value: 58.5 },
            { type: ACTIVITY_FACTOR, value: 1.375 },
            // số đo nếu có
            { type: WAIST, value: 68 },
            ...
          ]
        }
        → BE auto recalculate BMI, BMR, TDEE, PBF, WHR
[3] FE: PUT /api/user-goals/current
        body: { goalCode: 'GIAM', targetDurationMonths: 6 }
        → BE upsert user_goals (deactivate old + insert new)
[4] FE: PUT /api/user/profile-completed (mark profile_completed = true)
        → user object update
[5] FE: GET /api/health-data/constitution
        → response include constitution + suggestedGoal + warning
[6] FE: Compare user.goalCode vs response.suggestedGoal:
        - Match → navigate /dashboard ngay
        - Mismatch → hiển thị MODAL khuyến cáo
```

### 6.6. Modal khuyến cáo mục tiêu

Trigger: response constitution có `suggestedGoal != currentGoal`.

**Layout:**
```
┌────────────────────────────────────────────┐
│         ⚠ KHUYẾN CÁO MỤC TIÊU              │
│                                            │
│ Dựa trên thể trạng của bạn (BÉO PHÌ),     │
│ chúng tôi đề xuất mục tiêu phù hợp là     │
│                                            │
│           [GIẢM CÂN]                       │
│                                            │
│ Bạn đã chọn: TĂNG CÂN                      │
│                                            │
│ ⚠ Tăng cân khi đang béo phì có thể ảnh    │
│   hưởng xấu đến sức khỏe.                 │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │  [✓ Đổi sang Giảm cân (khuyến nghị)]  ││
│ │  [Giữ mục tiêu Tăng cân]              ││
│ └────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

Behavior:
- "Đổi sang ..." → call `PUT /api/user-goals/current` với suggestedGoal → navigate /dashboard
- "Giữ mục tiêu ..." → close modal → navigate /dashboard với goal cũ

**Khi nào không hiển thị modal:**
- user.goalCode == suggestedGoal
- response không có `suggestedGoal` (vd thiếu data → constitution null)
- API error → fallback navigate /dashboard, dashboard tự xử lý empty state

### 6.7. Error handling

| Error | Behavior |
|---|---|
| Network fail step [1] | Toast "Lỗi cập nhật profile, vui lòng thử lại" + retry button |
| Validation error từ BE | Hiển thị error message gần CTA button |
| Submit thành công nhưng GET constitution fail | Skip modal, navigate /dashboard |

---

## 7. COMPONENT TREE

```
src/pages/OnboardingWizard.tsx
├── Step1Welcome.tsx
├── Step2Goal.tsx
├── Step3Personal.tsx
├── Step4Activity.tsx
├── Step5Review.tsx
└── components/
    ├── WizardCard.tsx
    ├── WizardProgress.tsx       (Progress 4 node)
    ├── WizardNavRow.tsx
    ├── WizardField.tsx          (label + input + error/helper)
    ├── MetricInput.tsx          (number + unit suffix)
    ├── CircumInput.tsx          (số đo vòng + tooltip)
    ├── ReviewRow.tsx            (Step 5 review)
    ├── GoalCard.tsx             (Step 2 selectable card)
    ├── ActivityCard.tsx         (Step 4 selectable card)
    └── GoalRecommendationModal.tsx (Step 5 sau submit)

src/stores/onboardingStore.ts
src/services/onboarding.service.ts
src/routes/OnboardingGuard.tsx
src/utils/onboardingValidation.ts (Zod schemas)
src/utils/dateHelpers.ts          (computeAge)
```

---

## 8. SERVICE LAYER

**File:** `src/services/onboarding.service.ts`

```typescript
import { apiClient } from './apiClient';

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
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
  bustCm?: number;

  // Step 2
  goalCode: 'GIAM' | 'DUY_TRI' | 'TANG';
  targetDurationMonths?: number;  // default 6
}

export interface OnboardingResult {
  profileCompleted: boolean;
  constitution: ConstitutionResponse;
  goalMismatch: boolean;
  suggestedGoal?: 'GIAM' | 'DUY_TRI' | 'TANG';
  warning?: string;
}

export const onboardingService = {
  async submit(payload: SubmitOnboardingPayload): Promise<OnboardingResult> {
    // [1] Update profile
    await apiClient.put('/api/user/profile', {
      name: payload.fullName,
      birthDate: payload.birthDate,
      gender: payload.gender,
      phone: payload.phone || null,
    });

    // [2] Submit health data
    const baseMetrics = [
      { type: 'HEIGHT', value: payload.heightCm },
      { type: 'WEIGHT', value: payload.weightKg },
      { type: 'ACTIVITY_FACTOR', value: payload.activityFactor },
    ];
    if (payload.waistCm) baseMetrics.push({ type: 'WAIST', value: payload.waistCm });
    if (payload.hipCm) baseMetrics.push({ type: 'HIP', value: payload.hipCm });
    if (payload.neckCm) baseMetrics.push({ type: 'NECK', value: payload.neckCm });
    if (payload.bustCm) baseMetrics.push({ type: 'BUST', value: payload.bustCm });

    await apiClient.post('/api/health-data/submit', { baseMetrics });

    // [3] Save goal
    await apiClient.put('/api/user-goals/current', {
      goalCode: payload.goalCode,
      targetDurationMonths: payload.targetDurationMonths || 6,
    });

    // [4] Mark profile completed
    await apiClient.put('/api/user/profile-completed');

    // [5] Get constitution + suggestion
    // Đợi 1-2s để RabbitMQ sync + pipeline tính xong PBF
    await new Promise((r) => setTimeout(r, 1500));
    const constResp = await apiClient.get('/api/health-data/constitution');
    const constitution = constResp.data.data;

    // [6] Suggestion logic
    const suggestedGoal = mapConstitutionToGoal(constitution.constitution);
    const goalMismatch = suggestedGoal !== payload.goalCode;

    return {
      profileCompleted: true,
      constitution,
      goalMismatch,
      suggestedGoal: goalMismatch ? suggestedGoal : undefined,
      warning: constitution.warning,
    };
  },
};

function mapConstitutionToGoal(c: string): 'GIAM' | 'DUY_TRI' | 'TANG' {
  switch (c) {
    case 'GAY': return 'TANG';
    case 'CAN_DOI': return 'DUY_TRI';
    case 'THUA_CAN':
    case 'BEO_PHI': return 'GIAM';
    default: return 'DUY_TRI';
  }
}
```

---

## 9. ENDPOINTS BE PHỤ THUỘC

| Endpoint | Status | Note |
|---|---|---|
| `PUT /api/user/profile` | ✅ existing | Verify update name + birthDate + gender + phone |
| `POST /api/health-data/submit` | ✅ existing | Accept multiple baseMetrics |
| `PUT /api/user-goals/current` | ❌ **NEW** | Xem `backend_endpoint_spec.md` §X (sẽ thêm) |
| `GET /api/user-goals/current` | ❌ **NEW** | Dashboard cần |
| `PUT /api/user/profile-completed` | ❌ **NEW** | Mark flag |
| `GET /api/health-data/constitution` | ❌ NEW (spec đã có) | Trả constitution + suggestedGoal |

→ Đồng thời với onboarding, BE cần build endpoint `user-goals/*`. Xem update `backend_endpoint_spec.md`.

---

## 10. ACCEPTANCE CRITERIA

### 10.1. Happy path

- [ ] User register mới → login → tự động redirect `/onboarding/wizard?step=1`
- [ ] Step 1: click "Bắt đầu" → Step 2
- [ ] Step 2: click 1 trong 3 mục tiêu → "Tiếp theo" enable → Step 3
- [ ] Step 3: nhập đủ name + birthDate + gender → "Tiếp theo" enable → Step 4
- [ ] Step 4: nhập height + weight + activity → "Tiếp theo" enable → Step 5
- [ ] Step 5: nhập số đo (hoặc skip) → click "Hoàn tất" → loading
- [ ] Sau loading: nếu user chọn goal phù hợp với suggested → navigate `/dashboard`
- [ ] Sau loading: nếu mismatch → hiện modal khuyến cáo → user chọn → navigate `/dashboard`

### 10.2. Validation

- [ ] Step 3 — bỏ trống name → click "Tiếp theo": field highlight đỏ, error "Vui lòng nhập họ và tên"
- [ ] Step 3 — birthDate tuổi < 13 hoặc > 100: error "Tuổi phải từ 13 đến 100"
- [ ] Step 3 — phone không đúng format: error "Số điện thoại không hợp lệ"
- [ ] Step 4 — height < 100: error "Chiều cao tối thiểu 100cm"
- [ ] Step 5 — số đo bỏ trống: PASS (vì optional)
- [ ] Step 5 — vòng eo nhập 999: error "Vòng eo không hợp lệ"

### 10.3. Navigation

- [ ] Click "Quay lại" ở Step 3/4/5: navigate step trước, state preserve
- [ ] Reload browser trong khi đang Step 3: state restore từ sessionStorage, vào lại Step 3
- [ ] Đóng tab → mở lại: state mất (sessionStorage clear) → start Step 1

### 10.4. Edge cases

- [ ] User đã `profile_completed=true` truy cập `/onboarding/wizard` → redirect `/dashboard`
- [ ] Network fail giữa Step 5 submit → toast error + retry button
- [ ] Submit thành công nhưng GET constitution fail → skip modal, vẫn navigate /dashboard

### 10.5. Responsive

- [ ] Mobile 380px: tất cả 5 step render OK, không scroll horizontal
- [ ] Tablet 768px: layout intermediate
- [ ] Desktop 1200px+: max-width 720px, centered

---

## 11. ORDER OF IMPLEMENTATION

**Phase 1 — BE (song song với FE):**
1. Build `user_goals` schema + endpoint (xem `backend_endpoint_spec.md` update)
2. Build `profile_completed` flag (verify `User` entity, add column)
3. Update `GET /api/health-data/constitution` để trả thêm `suggestedGoal`

**Phase 2 — FE setup:**
4. Update `tailwind.config.js` với BRAND tokens
5. Import font Be Vietnam Pro
6. Tạo Zustand store `onboardingStore.ts`
7. Tạo routing guards `OnboardingGuard.tsx`, `RequireOnboardingComplete.tsx`
8. Update App routes: `/onboarding/wizard` (protected by OnboardingGuard)

**Phase 3 — FE component:**
9. Build 5 components Step1-5 theo design files
10. Reuse atoms từ design source: `WizardCard`, `Progress`, `NavRow`, `Field`, `MetricInput`, `CircumInput`, `ReviewRow`
11. Build `GoalRecommendationModal`
12. Build `onboarding.service.ts`
13. Wire Zustand + react-hook-form + Zod validation
14. Test responsive mobile/desktop

**Phase 4 — Integration:**
15. End-to-end test happy path
16. Test all validation errors
17. Test mismatch goal modal
18. Test edge case redirect (`profile_completed=true`)

---

## 12. NOTES TỪ DESIGN FILES

### 12.1. Sample data trong design KHÔNG hardcode

Design files có default values cho preview (vd `defaultValue="Nguyễn Minh Anh"`, `defaultValue="15/03/2002"`, `selected="GIAM"`). **Agent KHÔNG hardcode** vào component thật — phải để input rỗng, bind với Zustand state.

### 12.2. Helper text "Bạn 23 tuổi" trong Step 3

Compute từ birthDate khi user nhập xong:

```typescript
function computeAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
```

Hiển thị helper `✓ Bạn X tuổi` chỉ khi birthDate valid.

### 12.3. Goal label dynamic trong Step 3

```typescript
const goalLabels: Record<GoalCode, string> = {
  GIAM: 'giảm cân hiệu quả',
  DUY_TRI: 'duy trì thể trạng tốt',
  TANG: 'tăng cân lành mạnh',
};

const subtitle = `Để ${goalLabels[goalCode]}, chúng tôi cần biết một vài thông tin cơ bản.`;
```

### 12.4. Pencil icon ở ReviewRow

Click → navigate về step tương ứng + giữ state (để user edit). State preserve khi navigate back.

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 25/05/2026 | v1.0 | Spec ban đầu — 5 step onboarding với Welcome + Goal + Personal + Activity + Review. Architecture decision: Zustand + sessionStorage, Zod validation, suggestion logic dùng matrix có sẵn. |
