# Hướng dẫn xây dựng Nutrition Recommendation Page (Frontend)

> **Đối tượng đọc:** Coding agent thực hiện implement trang `/nutrition-plan` cho dự án HealthManagement (graduation thesis).
>
> **Tham chiếu:** Thiết kế đã chốt qua Claude Design — xem 7 file `.jsx` trong folder `doc\NutritionPage` (nutrition-shared, nutrition-strip-footer, nutrition-meal-card, nutrition-page, nutrition-swap-drawer, nutrition-wizard, nutrition-states). Các file này là **REFERENCE thiết kế**, không phải code production — agent đọc để hiểu layout/styling/colors/typography rồi port sang TypeScript + Tailwind v4.

---

## 1. Bối cảnh & phạm vi

Trang `/nutrition-plan` là feature trung tâm của hệ thống: hiển thị thực đơn đề xuất 3 bữa/ngày dựa trên TDEE, mục tiêu sức khỏe, và thể trạng. User có thể đổi món, đánh dấu đã ăn, hoặc gen lại cả ngày.

**Trong scope:**
- Hiển thị 3 meal cards (Sáng/Trưa/Tối) với collapse/expand
- Đổi món qua SwapDrawer (10 alternatives per slot)
- Setup Wizard lần đầu user vào trang
- Confirm "Đã ăn" / "Bỏ qua" cho từng bữa
- InfoStrip hiển thị mục tiêu + TDEE + thể trạng
- Footer Summary tổng dinh dưỡng cả ngày
- 5 special states: Loading skeleton, Empty (chưa có health data), Warning goal modal, Score-drop banner, Suggestion banner

**Out of scope (KHÔNG làm trong MVP):**
- "Tùy chỉnh bữa này" (per-meal override) — đã remove khỏi design
- "Xem ngày khác" (lịch sử plan theo ngày) — BE không support
- "Xuất PDF" — scope creep
- Variant `ring` chart cho macro — dùng default `bar` variant cho MVP, ring để dành later
- Image upload UI cho admin — đã có endpoint BE nhưng UI admin là task khác

---

## 2. Stack & convention dự án

Mở `Health-management-frontend/CLAUDE.md` và `Health-management-frontend/Folder.txt` để confirm convention. Tổng quan:

- **React 19 + TypeScript strict + Vite**
- **Tailwind CSS v4** — design tokens trong `tailwind.config.ts`:
  - `brand-green` `#059669` (primary), `brand-green-light` `#ecfdf5`, `brand-green-dark` `#047857`
  - Score tiers: green `#d1fae5`/`#065f46`, amber `#fef3c7`/`#92400e`, orange `#fed7aa`/`#9a3412`
- **Heroicons** outline mặc định (`@heroicons/react/24/outline`)
- **React Hook Form + Zod** cho form validation
- **Axios** với refresh-token interceptor đã có sẵn (`services/axios.ts`)
- **Framer Motion** cho drawer/modal animation
- **Sonner** cho toast notification
- **Font:** Inter (production) — nếu design code dùng "Be Vietnam Pro" thì đổi sang Inter để khớp codebase

**Folder convention:**
```
src/
├── types/                     # Type definitions
├── constants/                 # Const objects (label maps, thresholds)
├── services/                  # Axios call wrappers
├── hooks/                     # Custom React hooks
├── components/
│   ├── common/                # Shared atoms
│   ├── meal/                  # Meal feature components
│   └── states/                # Loading/empty/error states
└── pages/
    └── MealRecommendationPage.tsx
```

**Naming:**
- Component file: `PascalCase.tsx`
- Hook file: `useXxxCamelCase.ts`
- Type file: `kebab-case.types.ts` (hoặc `xxx.types.ts`)
- Service file: `xxx.service.ts`

**Code comment:** tiếng Việt. **Commit message:** tiếng Việt.

---

## 3. BE đã sẵn sàng — endpoints

BE ở nhánh `feature/profilePage-be` của repo `HealthManagement`. Trước khi code FE, đảm bảo BE đã merge nhánh này vào `main` hoặc dev environment.

| Method | Endpoint | Purpose | Response type chính |
|---|---|---|---|
| GET | `/api/user-preferences` | Lấy preferences (số bữa, slot config) | `List<PreferenceResponse>` |
| PUT | `/api/user-preferences/{prefKey}` | Lưu/update preference | `PreferenceResponse` |
| GET | `/api/user-goals/current` | Mục tiêu hiện tại (GIAM/DUY_TRI/TANG) | `UserGoalResponse` |
| PUT | `/api/user-goals/current` | Đổi mục tiêu | `UserGoalResponse` |
| GET | `/api/health-data/latest-metrics` | TDEE + cân nặng + chiều cao mới nhất | `LatestHealthDataResponse` |
| GET | `/api/health-data/constitution` | Thể trạng từ ML (Béo phì/Thừa cân/Cân đối/Gầy) | `ConstitutionResponse` |
| POST | `/api/recommendation/full-day` | **Gen plan cả ngày** | `DailyPlanResponse` |
| POST | `/api/recommendation/swap-dish` | **Đổi 1 món** | `SwapResultResponse` |
| POST | `/api/meal-log/confirm` | Đánh dấu đã ăn | `Void` |
| GET | `/api/meal-log/history?days=N` | Lịch sử bữa đã ăn | `List<MealLogHistoryResponse>` |
| GET | `/api/favorite-dishes` | List món yêu thích | `List<FavoriteDishResponse>` |
| POST | `/api/favorite-dishes` | Thêm vào yêu thích | `Void` |
| DELETE | `/api/favorite-dishes/{dishId}` | Bỏ yêu thích | `Void` |
| GET | `/api/nutrition/dishes/{dishId}` | Chi tiết 1 món (nếu user click vào detail) | `DishDetailResponse` |

**Lưu ý quan trọng:** `MealSuggestionResponse` đã được BE bổ sung 3 field `proteinTarget`, `fatTarget`, `carbTarget` (đơn vị gram). FE **PHẢI** dùng trực tiếp các field này, KHÔNG được hardcode tỷ lệ macro ở FE.

---

## 4. Quyết định đã chốt (deviation từ design code)

Đọc kỹ phần này TRƯỚC khi port code từ design `.jsx` sang TypeScript:

| # | Vấn đề trong design code | Quyết định production |
|---|---|---|
| 1 | MealCard có fallback `meal.target * 0.2 / 4` để tính `pTarget` | **XOÁ fallback.** Đọc trực tiếp `meal.proteinTarget`, `meal.fatTarget`, `meal.carbTarget` từ BE response. Nếu BE không trả → throw error, không tự compute. |
| 2 | `Spinner` component nằm trong `nutrition-states.jsx` | **Move ra** `components/common/Spinner.tsx` vì MealCard + SwapDrawer đều cần dùng |
| 3 | Design có cả `variant="default"` và `variant="ring"` cho macro | **Chỉ implement `default` (bar)** cho MVP. Bỏ qua ring variant. |
| 4 | `meal.status` được lấy từ data mẫu | **`status` là FE-only state**, không phải từ BE. Initial value `'suggested'` cho tất cả meal. Đổi sang `'eaten'` khi user confirm thành công, `'skipped'` khi user click "Bỏ qua". Lưu vào `useState` của page, không persist (refresh page = reset về `'suggested'`). |
| 5 | `meal.iconBg` color cứng theo bữa | OK giữ — derive từ `meal.mealType`: `BREAKFAST` = `#fef3c7`, `LUNCH` = `#fed7aa`, `DINNER` = `#e0e7ff`, fallback = `#f3f4f6` |
| 6 | `meal.targets` (object con) trong demo data | Không tồn tại trong BE. FE map từ BE flat fields (`proteinTarget`, `fatTarget`, `carbTarget`) vào `<MealCard>` props trực tiếp. |
| 7 | `food.slot` là string "Món chính" / "Rau" / "Tinh bột" | BE trả `slotCode` enum (`CHINH`, `RAU`, `TINH_BOT`, `COMBO`, `BUA_PHU`). FE cần util `slotCodeToLabel(slotCode): string`. |
| 8 | `food.groupLabel` là string "GIA CẦM" | BE trả `foodGroupCode` enum. FE cần util `foodGroupToLabel(foodGroup): string` (có ~12 giá trị). |
| 9 | Date format `"27/05/2026"` hardcode | Dùng `new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })` |
| 10 | Wizard trigger | Logic: gọi `GET /api/user-preferences` lúc page mount. Nếu response empty array → show wizard. Nếu có preferences → skip wizard, gen plan. |
| 11 | Empty state trigger | Gọi `GET /api/health-data/latest-metrics` lúc page mount. Nếu response 404 hoặc thiếu cân nặng/chiều cao → show EmptyState. |
| 12 | Score drop banner trigger | Khi `POST /api/recommendation/swap-dish` trả `scoreDropTriggered: true`, show banner phía trên meal card vừa swap. User có 2 lựa chọn: "Giữ thay đổi" (dismiss banner) hoặc "Quay lại" (revert state về plan trước swap). |

---

## 5. Cấu trúc file & thứ tự implement

Implement theo thứ tự dưới đây — mỗi bước phụ thuộc bước trước. **Không skip bước.**

```
src/
├── types/
│   └── meal.types.ts                       # Bước 1
├── constants/
│   ├── foodGroup.constants.ts              # Bước 2
│   ├── slotCode.constants.ts               # Bước 2
│   ├── mealType.constants.ts               # Bước 2
│   └── score.constants.ts                  # Bước 2
├── services/
│   └── meal.service.ts                     # Bước 3
├── hooks/
│   ├── useMealPlan.ts                      # Bước 4
│   ├── useMealPreferences.ts               # Bước 4
│   └── useUserContext.ts                   # Bước 4 (TDEE + constitution)
├── components/
│   ├── common/
│   │   └── Spinner.tsx                     # Bước 5
│   └── meal/
│       ├── atoms/
│       │   ├── ScoreBadge.tsx              # Bước 5
│       │   ├── StatusPill.tsx              # Bước 5
│       │   ├── SlotChip.tsx                # Bước 5
│       │   ├── FoodGroupChip.tsx           # Bước 5
│       │   ├── FoodThumb.tsx               # Bước 5
│       │   ├── HeartButton.tsx             # Bước 5
│       │   ├── MacroBar.tsx                # Bước 5
│       │   └── DeltaPill.tsx               # Bước 5
│       ├── InfoStrip.tsx                   # Bước 6
│       ├── FooterSummary.tsx               # Bước 6
│       ├── MealCard.tsx                    # Bước 7
│       ├── FoodRow.tsx                     # Bước 7 (sub-component)
│       ├── SwapDrawer.tsx                  # Bước 8
│       ├── AlternateCard.tsx               # Bước 8 (sub-component)
│       ├── SetupWizard.tsx                 # Bước 9
│       └── banners/
│           ├── ScoreDropBanner.tsx         # Bước 10
│           ├── SuggestionBanner.tsx        # Bước 10
│           └── WarningGoalModal.tsx        # Bước 10
│   └── states/
│       ├── MealPlanLoadingSkeleton.tsx     # Bước 11
│       └── MealPlanEmptyState.tsx          # Bước 11
└── pages/
    └── MealRecommendationPage.tsx          # Bước 12 — final assembly
```

---

## 6. Bước 1 — Types (`types/meal.types.ts`)

Mirror DTOs từ BE. Đọc file BE `dto/response/*.java` để confirm tên field chính xác.

```typescript
// Enums
export type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK_AM' | 'SNACK_PM';
export type SlotCode = 'CHINH' | 'RAU' | 'TINH_BOT' | 'COMBO' | 'BUA_PHU';
export type FoodGroup =
  | 'GIA_CAM' | 'CA' | 'THIT_DO' | 'HAI_SAN' | 'TRUNG'
  | 'RAU_LA' | 'RAU_CU' | 'TINH_BOT_GAO' | 'TINH_BOT_KHAC'
  | 'COMBO' | 'SALAD' | 'TRAI_CAY';
export type Constitution = 'BEO_PHI' | 'THUA_CAN' | 'CAN_DOI' | 'GAY';

// FE-only state
export type MealStatus = 'suggested' | 'eaten' | 'skipped';

// BE response DTOs
export interface DishSuggestionResponse {
  slotKey: string;              // vd "CHINH_0"
  slotCode: SlotCode;
  dishId: string;
  dishName: string;
  foodGroupCode: FoodGroup;
  grams: number;                // BigDecimal → number
  kcal: number;
  protein: number;
  fat: number;
  carb: number;
  favorite: boolean;
  imageUrl?: string;            // nullable, có thể chưa có
}

export interface MealCombinationResponse {
  combinationId: string;
  dishes: DishSuggestionResponse[];
  finalScore: number;
  totalKcal: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
}

export interface DishOptionResponse {
  dishId: string;
  dishName: string;
  slotCode: SlotCode;
  foodGroupCode: FoodGroup;
  expectedScore: number;
  expectedServing: number;
  expectedActualGrams: number;
  favorite: boolean;
  imageUrl?: string;
}

export interface MealSuggestionResponse {
  mealType: MealType;
  mealKcalTarget: number;
  proteinTarget: number;        // BE bổ sung mới
  fatTarget: number;            // BE bổ sung mới
  carbTarget: number;           // BE bổ sung mới
  topCombination: MealCombinationResponse;
  slotAlternatives: Record<string, DishOptionResponse[]>;
}

export interface DailyPlanResponse {
  meals: MealSuggestionResponse[];
  totalKcalTarget: number;
  goalCode: GoalCode;
  constitution: Constitution;
}

export interface SwapSuggestion {
  message: string;
  targetSlotKey: string;
  suggestedDishId: string;
  suggestedScore: number;
}

export interface SwapResultResponse {
  updatedMeal: MealSuggestionResponse;
  newFinalScore: number;
  originalFinalScore: number;
  scoreDropTriggered: boolean;
  suggestion?: SwapSuggestion | null;
}

// BE request DTOs
export interface PerMealConfig {
  mealType: MealType;
  mealKind: 'COMBO' | 'NHIEU_MON';
  nMain?: number;
  nRau?: number;
  nCarb?: number;
}

export interface RecommendFullDayRequest {
  tdee: number;
  goalCode: GoalCode;
  planType: '3_BUA' | '5_BUA';
  constitution: Constitution;
  perMealConfig: PerMealConfig[];
}

export interface PinnedDish {
  slotKey: string;              // vd "CHINH_0"
  dishId: string;
}

export interface SwapDishRequest {
  mealType: MealType;
  currentPlan: DailyPlanResponse;
  targetSlotKey: string;        // slot user muốn đổi
  newDishId: string;
  pinnedDishes?: PinnedDish[];  // các slot khác user muốn giữ
}

export interface ConfirmMealRequest {
  mealType: MealType;
  combination: MealCombinationResponse;
  consumedAt: string;           // ISO datetime
}

// FE-only UI state
export interface UIMealState {
  meal: MealSuggestionResponse;
  status: MealStatus;
  expanded: boolean;
}
```

---

## 7. Bước 2 — Constants

### `constants/foodGroup.constants.ts`

```typescript
import type { FoodGroup } from '../types/meal.types';

export const FOOD_GROUP_LABEL: Record<FoodGroup, string> = {
  GIA_CAM: 'Gia cầm',
  CA: 'Cá',
  THIT_DO: 'Thịt đỏ',
  HAI_SAN: 'Hải sản',
  TRUNG: 'Trứng',
  RAU_LA: 'Rau lá',
  RAU_CU: 'Rau củ',
  TINH_BOT_GAO: 'Tinh bột (gạo)',
  TINH_BOT_KHAC: 'Tinh bột khác',
  COMBO: 'Combo',
  SALAD: 'Salad',
  TRAI_CAY: 'Trái cây',
};

// Gradient palette cho FoodThumb placeholder (port từ design code)
export const FOOD_GROUP_PALETTE: Record<FoodGroup, [string, string]> = {
  GIA_CAM:       ['#fde68a', '#f59e0b'],
  CA:            ['#bae6fd', '#0284c7'],
  THIT_DO:       ['#fecaca', '#dc2626'],
  RAU_LA:        ['#bbf7d0', '#059669'],
  RAU_CU:        ['#d9f99d', '#65a30d'],
  TINH_BOT_GAO:  ['#fef3c7', '#d97706'],
  TINH_BOT_KHAC: ['#fef3c7', '#d97706'],
  COMBO:         ['#fed7aa', '#ea580c'],
  HAI_SAN:       ['#c7d2fe', '#4f46e5'],
  TRUNG:         ['#fef9c3', '#ca8a04'],
  SALAD:         ['#d9f99d', '#65a30d'],
  TRAI_CAY:      ['#fbcfe8', '#db2777'],
};
```

### `constants/slotCode.constants.ts`

```typescript
import type { SlotCode } from '../types/meal.types';

export const SLOT_CODE_LABEL: Record<SlotCode, string> = {
  CHINH: 'Món chính',
  RAU: 'Rau',
  TINH_BOT: 'Tinh bột',
  COMBO: 'Combo',
  BUA_PHU: 'Bữa phụ',
};
```

### `constants/mealType.constants.ts`

```typescript
import type { MealType } from '../types/meal.types';

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: 'Bữa Sáng',
  LUNCH: 'Bữa Trưa',
  DINNER: 'Bữa Tối',
  SNACK_AM: 'Bữa phụ sáng',
  SNACK_PM: 'Bữa phụ chiều',
};

export const MEAL_TYPE_ICON: Record<MealType, string> = {
  BREAKFAST: '☀️',
  LUNCH: '🍽',
  DINNER: '🌙',
  SNACK_AM: '🥪',
  SNACK_PM: '☕',
};

export const MEAL_TYPE_ICON_BG: Record<MealType, string> = {
  BREAKFAST: '#fef3c7',
  LUNCH: '#fed7aa',
  DINNER: '#e0e7ff',
  SNACK_AM: '#dcfce7',
  SNACK_PM: '#fae8ff',
};
```

### `constants/score.constants.ts`

```typescript
export const SCORE_TIERS = {
  GOOD: { min: 80, label: 'Rất tốt', bg: '#d1fae5', fg: '#065f46', ring: 'rgba(16,185,129,.18)' },
  OK:   { min: 60, label: 'Khá',     bg: '#fef3c7', fg: '#92400e', ring: 'rgba(245,158,11,.18)' },
  BAD:  { min: 0,  label: 'Cần cân nhắc', bg: '#fed7aa', fg: '#9a3412', ring: 'rgba(249,115,22,.2)' },
} as const;

export function getScoreTier(score: number) {
  if (score >= SCORE_TIERS.GOOD.min) return SCORE_TIERS.GOOD;
  if (score >= SCORE_TIERS.OK.min) return SCORE_TIERS.OK;
  return SCORE_TIERS.BAD;
}

// Macro deviation thresholds
export const MACRO_DEVIATION = {
  GREEN_MAX: 10,   // <= ±10% = green
  AMBER_MAX: 20,   // <= ±20% = amber
};

export function getMacroDeviationColor(actual: number, target: number): string {
  if (target === 0) return '#10b981';
  const pct = Math.abs((actual - target) / target) * 100;
  if (pct <= MACRO_DEVIATION.GREEN_MAX) return '#10b981';
  if (pct <= MACRO_DEVIATION.AMBER_MAX) return '#f59e0b';
  return '#ef4444';
}
```

---

## 8. Bước 3 — Service layer (`services/meal.service.ts`)

Wrap axios calls. Dùng axios instance đã có sẵn (`services/axios.ts`) với refresh-token interceptor.

```typescript
import axios from './axios';
import type {
  DailyPlanResponse,
  RecommendFullDayRequest,
  SwapDishRequest,
  SwapResultResponse,
  ConfirmMealRequest,
  PreferenceResponse,  // import từ types/user.types.ts hoặc tương đương
} from '../types/meal.types';

// Standard wrapper: BE trả `DataResponse<T>` với shape `{ status, message, data: T }`
// Service layer đã unwrap → trả thẳng `data`

export const mealService = {
  recommendFullDay: async (req: RecommendFullDayRequest): Promise<DailyPlanResponse> => {
    const res = await axios.post('/api/recommendation/full-day', req);
    return res.data.data;
  },

  swapDish: async (req: SwapDishRequest): Promise<SwapResultResponse> => {
    const res = await axios.post('/api/recommendation/swap-dish', req);
    return res.data.data;
  },

  confirmMeal: async (req: ConfirmMealRequest): Promise<void> => {
    await axios.post('/api/meal-log/confirm', req);
  },

  getPreferences: async (): Promise<PreferenceResponse[]> => {
    const res = await axios.get('/api/user-preferences');
    return res.data.data;
  },

  upsertPreference: async (key: string, value: string): Promise<void> => {
    await axios.put(`/api/user-preferences/${key}`, { prefValue: value });
  },

  toggleFavorite: async (dishId: string, currentlyFavorite: boolean): Promise<void> => {
    if (currentlyFavorite) {
      await axios.delete(`/api/favorite-dishes/${dishId}`);
    } else {
      await axios.post('/api/favorite-dishes', { dishId });
    }
  },

  getDishDetail: async (dishId: string) => {
    const res = await axios.get(`/api/nutrition/dishes/${dishId}`);
    return res.data.data;
  },
};
```

**Lưu ý:** Không bắt error ở service layer — để hook/page tự handle với toast (`sonner`).

---

## 9. Bước 4 — Custom hooks

### `hooks/useUserContext.ts`

Lấy TDEE + Constitution + Goal lúc page mount. Phân biệt empty state (chưa có health data) ra khỏi error.

```typescript
import { useEffect, useState } from 'react';
import axios from '../services/axios';
import type { GoalCode, Constitution } from '../types/meal.types';

interface UserContext {
  tdee: number;
  goalCode: GoalCode;
  constitution: Constitution;
  constitutionLabel: string;
  warning?: string;  // từ ConstitutionResponse, để show WarningGoalModal
}

interface State {
  data: UserContext | null;
  loading: boolean;
  emptyHealthData: boolean;  // true nếu user chưa nhập cân/chiều cao
  error: string | null;
}

export function useUserContext(): State {
  const [state, setState] = useState<State>({ data: null, loading: true, emptyHealthData: false, error: null });

  useEffect(() => {
    (async () => {
      try {
        const [metricsRes, constRes, goalRes] = await Promise.all([
          axios.get('/api/health-data/latest-metrics'),
          axios.get('/api/health-data/constitution'),
          axios.get('/api/user-goals/current'),
        ]);
        const metrics = metricsRes.data.data;
        const constitution = constRes.data.data;
        const goal = goalRes.data.data;

        // Empty case: chưa có cân nặng hoặc chiều cao
        if (!metrics?.weight || !metrics?.height) {
          setState({ data: null, loading: false, emptyHealthData: true, error: null });
          return;
        }

        setState({
          data: {
            tdee: metrics.tdee,
            goalCode: goal.goalCode,
            constitution: constitution.constitution,
            constitutionLabel: constitution.constitution, // map ra label tiếng Việt nếu cần
            warning: constitution.warning,
          },
          loading: false,
          emptyHealthData: false,
          error: null,
        });
      } catch (err: any) {
        // 404 ở `latest-metrics` cũng = empty
        if (err.response?.status === 404) {
          setState({ data: null, loading: false, emptyHealthData: true, error: null });
        } else {
          setState({ data: null, loading: false, emptyHealthData: false, error: err.message });
        }
      }
    })();
  }, []);

  return state;
}
```

### `hooks/useMealPreferences.ts`

Lấy + lưu `user_preferences` cho 4 key:
- `MEAL_PLAN_TYPE` = `"3_BUA"` hoặc `"5_BUA"`
- `BREAKFAST_CONFIG` = JSON `{kind, nMain, nRau, nCarb}`
- `LUNCH_CONFIG` = JSON
- `DINNER_CONFIG` = JSON

Return `{ preferences, isFirstTime, savePreferences }`. `isFirstTime = true` nếu không có key `MEAL_PLAN_TYPE` → trigger wizard.

### `hooks/useMealPlan.ts`

Main hook quản lý state plan:

```typescript
interface UseMealPlan {
  plan: DailyPlanResponse | null;
  mealStates: UIMealState[];        // status + expanded per meal
  loading: boolean;
  swapLoading: boolean;
  confirmLoading: string | null;    // mealType đang confirm
  scoreDropEvent: { mealType: MealType; from: number; to: number } | null;
  
  generate: () => Promise<void>;
  swap: (mealType: MealType, slotKey: string, newDishId: string) => Promise<void>;
  confirm: (mealType: MealType) => Promise<void>;
  skip: (mealType: MealType) => void;
  toggleExpand: (mealType: MealType) => void;
  revertSwap: () => void;           // undo last swap khi score drop
  dismissScoreDropEvent: () => void;
}
```

Cache plan vào `sessionStorage` để refresh không mất (key `nutrition-plan-${userId}-${YYYY-MM-DD}`).

---

## 10. Bước 5 — Common atoms

### `components/common/Spinner.tsx`

Port từ `nutrition-states.jsx` lines 120-128. Convert sang TypeScript với props interface.

### `components/meal/atoms/*`

Port lần lượt từ `nutrition-shared.jsx`:

| File | Source trong nutrition-shared.jsx | Notes |
|---|---|---|
| `ScoreBadge.tsx` | `function ScoreBadge` | Dùng `getScoreTier()` từ constants thay vì inline ternary |
| `StatusPill.tsx` | `function StatusPill` | Props: `status: MealStatus`. iconPath đã có sẵn trong design code. |
| `SlotChip.tsx` | `function SlotChip` | Props: `slotCode: SlotCode` → render `SLOT_CODE_LABEL[slotCode]` |
| `FoodGroupChip.tsx` | `function FoodGroupChip` | Props: `foodGroup: FoodGroup` → render `FOOD_GROUP_LABEL[foodGroup].toUpperCase()` |
| `FoodThumb.tsx` | `function FoodThumb` | Props: `name`, `foodGroup`, `imageUrl?`, `size`. Nếu `imageUrl` có → render `<img>`, ngược lại render placeholder gradient từ `FOOD_GROUP_PALETTE`. |
| `HeartButton.tsx` | `function HeartIcon` + button wrapper | Props: `dishId`, `favorite`, `onToggle`. Click → call `mealService.toggleFavorite()`, optimistic update. |
| `MacroBar.tsx` | `function MacroBar` + `MacroCol` | Props: `kcal/p/f/c` + targets. Dùng `getMacroDeviationColor()` từ constants. |
| `DeltaPill.tsx` | `function DeltaPill` | Props: `value: number`. Hiển thị `+1.7` / `-3.4` với màu xanh/đỏ. |

**Lưu ý:** Convert inline styles từ design code sang Tailwind classes ở những chỗ đơn giản. Giữ inline style cho gradient/dynamic color (vd `FoodThumb` palette, score badge color theo tier).

---

## 11. Bước 6 — InfoStrip + FooterSummary

### `components/meal/InfoStrip.tsx`

Port từ `nutrition-strip-footer.jsx` lines 4-115. Props:

```typescript
interface InfoStripProps {
  goal: GoalCode;
  goalLabel: string;          // "Giảm cân"
  tdee: number;
  constitutionLabel: string;
  date: string;               // formatted Việt
  onChangeGoal: () => void;
  onRegen: () => void;
  regenLoading?: boolean;
  mobile?: boolean;
}
```

Heroicons paths đã có sẵn trong design code (flag/bolt/chart-bar). Giữ nguyên. Regen button khi `regenLoading=true` → disabled + spinner.

### `components/meal/FooterSummary.tsx`

Port từ `nutrition-strip-footer.jsx` lines 117-256. Props:

```typescript
interface FooterSummaryProps {
  totals: { kcal: number; p: number; f: number; c: number };
  targets: { kcal: number; p: number; f: number; c: number };
  overallScore: number;
  mobile?: boolean;
}
```

`MacroDonut` là sub-component. Tính `pPct/fPct/cPct` theo công thức P×4/F×9/C×4 (đã có trong code design). Note "Tính theo % calo" đã có sẵn — giữ nguyên.

---

## 12. Bước 7 — MealCard (component lớn nhất)

### `components/meal/FoodRow.tsx`

Port từ `nutrition-meal-card.jsx` lines 7-65. Props:

```typescript
interface FoodRowProps {
  dish: DishSuggestionResponse;
  isLast: boolean;
  onSwapClick: (slotKey: string, currentDish: DishSuggestionResponse) => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void;
}
```

Map từ BE `dish`:
- `food.name` → `dish.dishName`
- `food.group` / `groupLabel` → `dish.foodGroupCode` + `FOOD_GROUP_LABEL[code]`
- `food.slot` → `SLOT_CODE_LABEL[dish.slotCode]`
- `food.grams/kcal/p/f/c` → `dish.grams/kcal/protein/fat/carb`
- `food.favorite` → `dish.favorite`

### `components/meal/MealCard.tsx`

Port từ `nutrition-meal-card.jsx` lines 75-220. Props:

```typescript
interface MealCardProps {
  meal: MealSuggestionResponse;
  status: MealStatus;
  expanded: boolean;
  score: number;              // = meal.topCombination.finalScore
  confirmLoading: boolean;
  onToggleExpand: () => void;
  onSwapClick: (slotKey: string, currentDish: DishSuggestionResponse) => void;
  onConfirm: () => void;
  onSkip: () => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void;
  mobile?: boolean;
}
```

**Map từ BE response sang props MacroBar:**

```tsx
<MacroBar
  kcal={meal.topCombination.totalKcal}
  kcalTarget={meal.mealKcalTarget}
  p={meal.topCombination.totalProtein}
  pTarget={meal.proteinTarget}     // ← KHÔNG hardcode, từ BE
  f={meal.topCombination.totalFat}
  fTarget={meal.fatTarget}          // ← KHÔNG hardcode
  c={meal.topCombination.totalCarb}
  cTarget={meal.carbTarget}         // ← KHÔNG hardcode
/>
```

**Header icon:** dùng `MEAL_TYPE_ICON[meal.mealType]` (☀️🍽🌙) và `MEAL_TYPE_ICON_BG[meal.mealType]`. **GIỮ emoji** — đã quyết định.

**Status pill:** chỉ render khi `status !== 'suggested'` để giữ card sạch khi chưa tương tác. (Hoặc luôn render — agent quyết định theo cảm nhận, miễn nhất quán.)

**Action buttons:** Layout `justify-end`, 2 nút "Bỏ qua" (ghost) + "Đánh dấu đã ăn" (primary). Khi `confirmLoading=true`: button disabled, opacity 0.7, text → "Đang lưu...", icon → Spinner.

---

## 13. Bước 8 — SwapDrawer

### `components/meal/AlternateCard.tsx`

Port từ `nutrition-swap-drawer.jsx` lines 56-115. Props:

```typescript
interface AlternateCardProps {
  option: DishOptionResponse;
  currentScore: number;        // score của top combination hiện tại
  selected: boolean;
  onSelect: () => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void;
  mobile?: boolean;
}
```

Tính `delta = option.expectedScore - currentScore`. Pass vào `<DeltaPill value={delta} />`.

### `components/meal/SwapDrawer.tsx`

Port từ `nutrition-swap-drawer.jsx` lines 170-330. Props:

```typescript
interface SwapDrawerProps {
  open: boolean;
  mobile?: boolean;
  currentDish: DishSuggestionResponse;           // món đang được swap
  currentMealScore: number;                       // score top combination để tính delta
  alternatives: DishOptionResponse[];             // từ meal.slotAlternatives[slotKey]
  suggestion?: SwapSuggestion | null;             // từ response.suggestion
  confirmLoading: boolean;
  onClose: () => void;
  onConfirm: (newDishId: string) => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void;
}
```

**Animation:** Dùng `framer-motion`:
- Desktop: `x: 480` → `x: 0`, exit `x: 480`
- Mobile: `y: '100%'` → `y: '25%'` (75% height từ bottom), exit `y: '100%'`

**Selected state:** local `useState<number>(0)` trong drawer, default 0 = top option (điểm cao nhất). User click khác → update local state. Click "Xác nhận đổi món" → call `onConfirm(alternates[selectedIndex].dishId)`.

**Suggestion banner:** chỉ render khi `suggestion != null`. Click "Áp dụng" → tự động select option có `dishId === suggestion.suggestedDishId` rồi call `onConfirm()`.

**Sort dropdown** ("Điểm cao → thấp") trong design là static placeholder. **Skip cho MVP** — alternatives từ BE đã sort sẵn theo `expectedScore DESC`.

---

## 14. Bước 9 — SetupWizard

Port từ `nutrition-wizard.jsx`. 3 step component + 1 shell.

### `components/meal/SetupWizard.tsx`

```typescript
interface SetupWizardProps {
  open: boolean;
  onClose: () => void;          // sau khi save xong
  onComplete: (preferences: WizardResult) => void;
  mobile?: boolean;
}

interface WizardResult {
  planType: '3_BUA' | '5_BUA';
  breakfast: PerMealConfig;
  lunch: PerMealConfig;
  dinner: PerMealConfig;
}
```

**Logic save:**
1. Step 3 click "Bắt đầu đề xuất →" → call `mealService.upsertPreference()` 4 lần (MEAL_PLAN_TYPE, BREAKFAST_CONFIG, LUNCH_CONFIG, DINNER_CONFIG)
2. Sau khi save thành công → `onComplete(result)` để page biết và trigger generate plan
3. Nếu lỗi → toast error

**Default values** (port từ design):
- Plan: `3_BUA`
- Breakfast: `{kind: 'COMBO', nMain: 0, nRau: 0, nCarb: 0}` — bữa sáng VN thường là 1 tô
- Lunch/Dinner: `{kind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1}`

**Validation:** Step 2 stepper range: nMain 1-3, nRau 0-2, nCarb 0-1. Khi user chọn `kind: COMBO` thì 3 stepper ẩn đi.

---

## 15. Bước 10 — Banners + Warning modal

### `components/meal/banners/ScoreDropBanner.tsx`

Port từ `nutrition-states.jsx` lines 343-422. Props: `{ from, to, onKeep, onRevert, mobile }`.

### `components/meal/banners/SuggestionBanner.tsx`

Port từ lines 427-486. Props: `{ from, to, newScore, onApply, onDismiss, mobile }`.

### `components/meal/banners/WarningGoalModal.tsx`

Port từ lines 254-338. Trigger: khi `useUserContext` return `warning != null` (vd thừa cân + chọn tăng cân). Props: `{ warning, currentBMI, onChangeGoal, onContinue, mobile }`.

---

## 16. Bước 11 — Special states

### `components/states/MealPlanLoadingSkeleton.tsx`

Port từ `nutrition-states.jsx` lines 30-118. Render 3 skeleton meal cards. Inject CSS keyframes (`@keyframes dbShimmer`) 1 lần ở app level (vd `App.tsx` hoặc `index.css`).

### `components/states/MealPlanEmptyState.tsx`

Port từ lines 133-212. Click CTA "Vào trang Cập nhật chỉ số →" → `navigate('/submit-data')`.

`SaladBowlIllustration` SVG đã có sẵn — port nguyên.

---

## 17. Bước 12 — Main page (`pages/MealRecommendationPage.tsx`)

Đây là file cuối cùng — assembly tất cả. Outline:

```tsx
export default function MealRecommendationPage() {
  const userCtx = useUserContext();
  const prefs = useMealPreferences();
  const plan = useMealPlan({ userCtx: userCtx.data, prefs: prefs.preferences });
  
  const [wizardOpen, setWizardOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [swapDrawerState, setSwapDrawerState] = useState<{
    open: boolean;
    mealType: MealType | null;
    slotKey: string | null;
    currentDish: DishSuggestionResponse | null;
  }>({ open: false, mealType: null, slotKey: null, currentDish: null });

  // 1. Show wizard khi user lần đầu vào
  useEffect(() => {
    if (prefs.isFirstTime && !prefs.loading) setWizardOpen(true);
  }, [prefs.isFirstTime, prefs.loading]);

  // 2. Show warning modal khi có warning từ constitution
  useEffect(() => {
    if (userCtx.data?.warning) setWarningModalOpen(true);
  }, [userCtx.data?.warning]);

  // 3. Auto generate plan khi đã có context + preferences (lần đầu)
  useEffect(() => {
    if (userCtx.data && prefs.preferences && !plan.plan) {
      plan.generate();
    }
  }, [userCtx.data, prefs.preferences]);

  // === Render logic ===
  if (userCtx.loading || prefs.loading) return <MealPlanLoadingSkeleton />;
  if (userCtx.emptyHealthData) return <MealPlanEmptyState />;
  if (userCtx.error) return <ErrorView message={userCtx.error} />;

  return (
    <Layout>
      <PageHeader />
      
      <InfoStrip
        goalLabel={GOAL_LABEL[userCtx.data.goalCode]}
        tdee={userCtx.data.tdee}
        constitutionLabel={userCtx.data.constitutionLabel}
        date={formatVietnameseDate(new Date())}
        onChangeGoal={() => navigate('/profile/goal')}
        onRegen={plan.generate}
        regenLoading={plan.loading}
      />

      {plan.scoreDropEvent && (
        <ScoreDropBanner
          from={plan.scoreDropEvent.from}
          to={plan.scoreDropEvent.to}
          onKeep={plan.dismissScoreDropEvent}
          onRevert={plan.revertSwap}
        />
      )}

      <div className="flex flex-col gap-4 mb-6">
        {plan.mealStates.map(({ meal, status, expanded }) => (
          <MealCard
            key={meal.mealType}
            meal={meal}
            status={status}
            expanded={expanded}
            score={meal.topCombination.finalScore}
            confirmLoading={plan.confirmLoading === meal.mealType}
            onToggleExpand={() => plan.toggleExpand(meal.mealType)}
            onSwapClick={(slotKey, currentDish) => 
              setSwapDrawerState({ open: true, mealType: meal.mealType, slotKey, currentDish })
            }
            onConfirm={() => plan.confirm(meal.mealType)}
            onSkip={() => plan.skip(meal.mealType)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      <FooterSummary
        totals={computeDayTotals(plan.mealStates)}
        targets={computeDayTargets(plan.mealStates)}
        overallScore={computeDayScore(plan.mealStates)}
      />

      {/* Modals & Drawers */}
      <SetupWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={async (result) => {
          await prefs.savePreferences(result);
          setWizardOpen(false);
          await plan.generate();
        }}
      />

      <WarningGoalModal
        open={warningModalOpen}
        warning={userCtx.data?.warning}
        onChangeGoal={() => navigate('/profile/goal')}
        onContinue={() => setWarningModalOpen(false)}
      />

      <SwapDrawer
        open={swapDrawerState.open}
        currentDish={swapDrawerState.currentDish!}
        currentMealScore={getMealScore(swapDrawerState.mealType)}
        alternatives={getAlternativesForSlot(swapDrawerState.mealType, swapDrawerState.slotKey)}
        suggestion={plan.lastSwapSuggestion}
        confirmLoading={plan.swapLoading}
        onClose={() => setSwapDrawerState({ open: false, mealType: null, slotKey: null, currentDish: null })}
        onConfirm={async (newDishId) => {
          await plan.swap(swapDrawerState.mealType!, swapDrawerState.slotKey!, newDishId);
          setSwapDrawerState({ open: false, mealType: null, slotKey: null, currentDish: null });
        }}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
```

---

## 18. Bước 13 — Routing & sidebar

1. Thêm route trong `App.tsx`:
   ```tsx
   <Route path="/nutrition-plan" element={<MealRecommendationPage />} />
   ```
   (Route đã có placeholder — replace placeholder element bằng component thật.)

2. Confirm sidebar item "Đề xuất Thực đơn" đã có sẵn (icon BeakerIcon). Active state: khi `pathname === '/nutrition-plan'`.

---

## 19. Acceptance criteria (cách test sau khi xong)

Khởi động đủ BE + FE + DB. Login bằng tài khoản test có sẵn health data + preferences.

| # | Test case | Expected |
|---|---|---|
| 1 | Vào `/nutrition-plan` lần đầu (user chưa có preferences) | Wizard 3 bước hiện ra |
| 2 | Hoàn thành wizard | Save preferences thành công + plan tự gen |
| 3 | Vào `/nutrition-plan` lần 2 (đã có preferences) | Plan gen ngay, không có wizard |
| 4 | Click "🔄 Gen lại cả ngày" | Plan mới được gen, button có spinner |
| 5 | Click chevron collapse 1 meal card | Card thu thành dòng tóm tắt |
| 6 | Click "🔄 Đổi món" trên 1 slot | Drawer slide-in từ phải (desktop) hoặc từ dưới (mobile) |
| 7 | Trong drawer, click option khác | Border xanh đậm + radio dot xanh |
| 8 | Click "Xác nhận đổi món" | Plan update, drawer đóng, score meal có thể đổi |
| 9 | Nếu swap khiến score sụt ≥10 điểm | ScoreDropBanner hiện trên cùng |
| 10 | Click "Quay lại trạng thái cũ" trên banner | Plan revert về trước swap |
| 11 | Click "Đánh dấu đã ăn" | Button → spinner → "Đang lưu...", sau khi BE 200 → status pill đổi sang "Đã ăn" |
| 12 | Click "Bỏ qua" | Status pill → "Bỏ qua", không gọi BE |
| 13 | Click heart icon trên 1 món | Icon đổi màu, BE được call (optimistic) |
| 14 | User chưa có health data | EmptyState hiển thị thay cho plan |
| 15 | User có thừa cân + chọn mục tiêu tăng cân | WarningGoalModal hiện sau khi load |
| 16 | Refresh trang khi đang xem plan | Plan vẫn còn (đọc từ sessionStorage) |
| 17 | Test mobile viewport 375px | Sidebar ẩn, layout stack dọc, drawer thành bottom sheet |

---

## 20. Edge cases & rủi ro

| Tình huống | Xử lý |
|---|---|
| BE timeout khi gen plan (>10s) | Sonner toast "Đang quá tải, vui lòng thử lại". Không retry tự động. |
| `slotAlternatives[slotKey]` empty | Drawer hiện text "Không có lựa chọn thay thế phù hợp". Disable swap. |
| User swap nhanh liên tiếp 2 lần | Disable button "Xác nhận" trong khi `swapLoading=true`. Không cho double-submit. |
| `confirmMeal` thất bại (network) | Sonner toast error. Status không đổi sang 'eaten'. |
| `imageUrl` 404 | Fallback về placeholder gradient (`onError` event của `<img>`). |
| User refresh giữa swap → cache plan stale | Tạm chấp nhận. Plan trong sessionStorage có timestamp, hết hạn sau 4 tiếng tự xoá. |
| User đổi mục tiêu (Profile) → quay lại plan cũ vẫn hiển thị | Clear sessionStorage cache khi `userCtx.data.goalCode` thay đổi. |
| 2 tab cùng mở plan, swap ở tab 1 | Không sync. Acceptable cho MVP — user thường không mở 2 tab. |

---

## 21. Out of scope (Future enhancement)

Các feature **KHÔNG** implement trong MVP, chỉ ghi nhận để defense thesis hoặc làm sau:

1. Per-meal config override (button "Tùy chỉnh bữa này")
2. Lịch sử plan theo ngày (cần BE lưu plan vào DB)
3. Xuất PDF / chia sẻ thực đơn
4. Variant ring chart cho macro
5. Sort/filter alternatives trong drawer
6. Đa ngôn ngữ (i18n)
7. Dark mode
8. Sync state across tabs (BroadcastChannel)
9. Real-time update khi admin thay đổi config

---

## 22. Note cho agent khi implement

- **Đọc CLAUDE.md của repo FE trước** để biết coding convention cụ thể (vd: import order, naming exception).
- **KHÔNG tự thêm thư viện mới** (`react-query`, `zustand`, `dayjs`, etc.) — dùng những thư viện đã có trong `package.json`. Nếu cần state management phức tạp, dùng React Context + useReducer.
- **Test từng component khi xong** (Atomic test: render với mock data → check visual + interaction).
- **Commit theo bước** (vd: `feat: add meal types`, `feat: add meal service layer`, ...). Mỗi bước 1 commit để dễ revert nếu sai.
- **Khi gặp BE issue** (vd response shape không match): không tự ý guess, ghi note trong `docs/issues-found.md` để chủ project xử lý.
- **Khi UI khác design**: phải có lý do kỹ thuật (vd Tailwind v4 không support property X). Note trong commit message.

---

**Tổng thời gian ước tính:** 2–3 ngày làm việc (solo dev, 8h/ngày). Phân chia gợi ý:
- Ngày 1: Bước 1–6 (types, constants, service, hooks, atoms, strip+footer)
- Ngày 2: Bước 7–10 (MealCard, SwapDrawer, Wizard, banners)
- Ngày 3: Bước 11–13 (states, main page assembly, routing, test + fix)
