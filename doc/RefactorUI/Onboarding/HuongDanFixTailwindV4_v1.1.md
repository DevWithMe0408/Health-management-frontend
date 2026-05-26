# HƯỚNG DẪN FIX TAILWIND V4 — BRAND COLORS KHÔNG HOẠT ĐỘNG

> **Severity:** 🔥 BLOCKER — visual onboarding/dashboard bị sai hoàn toàn vì class `brand-green*` không apply.
>
> **Root cause:** Project đã upgrade `tailwindcss: ^4.1.8` nhưng config vẫn ở format Tailwind v3 (`tailwind.config.ts` với `module.exports`). Tailwind v4 KHÔNG đọc file đó mặc định → mọi class custom `bg-brand-green`, `text-brand-green-dark`, `border-brand-green-light`, etc. đều generate ra class trống/không tồn tại.
>
> **Tác động đã verify:** Sử dụng `grep` thấy **102 occurrence** của `brand-green*` và `brand-gray*` trong **30 file** (cả onboarding + dashboard + admin + layout). Tất cả đều đang fail silently.
>
> **Mục đích file này:** Migrate config sang Tailwind v4 syntax, verify không break admin pages, kèm 3 polish bonus.

---

## 0. CONTEXT

### 0.1. Triệu chứng user nhìn thấy

Trên `/onboarding/wizard`:
- Logo, button "Bắt đầu", icon thiên trắng/xám (đáng lẽ phải xanh đậm)
- Pill "Mất khoảng 2 phút" chữ đen + thiếu chấm xanh đi kèm
- Wordmark "Care" trong logo HealthCare màu đen (đáng lẽ xanh)
- Step indicator (1/2/3/4) viền đen — đáng lẽ viền xanh
- Cards mục tiêu hover ra rồi mất xanh — đáng lẽ giữ background xanh nhạt khi selected
- Cards mức vận động border đen + không có icon ✓ tick
- Khi qua step 2 thì step 1 không thấy "completed" rõ (đáng lẽ là ô tròn xanh có check trắng)

### 0.2. Verify root cause

```bash
# Project đã dùng v4
$ grep tailwindcss package.json
"@tailwindcss/cli": "^4.1.8",
"@tailwindcss/postcss": "^4.1.8",
"@tailwindcss/vite": "^4.1.8",
"tailwindcss": "^4.1.8",

# Nhưng config vẫn v3 syntax
$ cat tailwind.config.ts
export default {
  theme: { extend: { colors: { 'brand-green': { ... } } } }
} satisfies Config

# index.css thiếu @theme block
$ cat src/index.css
@import "tailwindcss";  # ← Không có @theme, không có @config
```

→ **Lý do:** Tailwind v4 thay đổi cơ chế config. Mặc định v4 dùng **CSS-based config** qua `@theme` directive. File `tailwind.config.ts` chỉ được đọc nếu CSS có dòng `@config "../tailwind.config.ts";` explicit. Project hiện đang thiếu cả 2 → tất cả custom color silently dropped.

Tham khảo: <https://tailwindcss.com/docs/upgrade-guide#configuration-changes>

### 0.3. Vì sao build không báo lỗi?

Tailwind v4 không warning khi gặp class không recognize — nó chỉ skip class đó trong output CSS. Vì vậy HTML render bình thường, không crash, nhưng class `bg-brand-green` áp dụng style `{}` rỗng → element fallback về browser default.

---

## 1. FIX CHÍNH — UPDATE `src/index.css`

### 1.1. File hiện tại

```css
@import "tailwindcss";

/* src/index.css */
/* ... (Tailwind directives) ... */

/* Custom Scrollbar for chart container */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
/* ... phần còn lại scrollbar styling ... */
```

### 1.2. File mới — REPLACE đoạn đầu

**Thay 2 dòng đầu của `src/index.css` bằng đoạn dưới đây, GIỮ NGUYÊN toàn bộ scrollbar styling phía sau:**

```css
@import "tailwindcss";

/* ============================================================
 * BRAND TOKENS — Tailwind v4 @theme directive
 *
 * Lý do: project upgrade Tailwind v3 -> v4 nhưng `tailwind.config.ts`
 * vẫn ở format v3. Tailwind v4 mặc định KHÔNG đọc file đó. Phải khai
 * báo tokens trong CSS bằng @theme để class brand-* có hiệu lực.
 *
 * Reference: https://tailwindcss.com/docs/upgrade-guide#configuration-changes
 * ============================================================ */

@theme {
  /* Brand green — primary color (button, link, accent) */
  --color-brand-green: #059669;
  --color-brand-green-light: #ecfdf5;
  --color-brand-green-medium: #10b981;
  --color-brand-green-dark: #047857;
  --color-brand-green-darker: #065f46;

  /* Brand gray — text + border */
  --color-brand-gray: #6b7280;
  --color-brand-gray-light: #e5e7eb;
  --color-brand-gray-dark: #374151;

  /* Font family — global */
  --font-sans: "Be Vietnam Pro", "Inter", system-ui, sans-serif;
}

/* ============================================================
 * Custom Scrollbar for chart container — GIỮ NGUYÊN
 * ============================================================ */

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}

/* ... GIỮ NGUYÊN TẤT CẢ STYLING SAU ĐÂY ... */
```

**Quan trọng:**
- Tên CSS variable BẮT BUỘC theo format `--color-{name}` để Tailwind v4 generate class `bg-{name}`, `text-{name}`, `border-{name}`, `ring-{name}`, etc.
- KHÔNG xóa `@import "tailwindcss";` ở dòng đầu — Tailwind v4 cần dòng này để load.
- KHÔNG xóa scrollbar styling phía sau.

### 1.3. Class sẽ tự động được generate

Sau khi thêm `@theme`, Tailwind v4 sẽ auto-generate các class này (KHÔNG cần khai báo thêm):

| Token | Class auto-generated |
|---|---|
| `--color-brand-green` | `bg-brand-green`, `text-brand-green`, `border-brand-green`, `ring-brand-green`, `from-brand-green`, `to-brand-green`, `hover:bg-brand-green`, etc. |
| `--color-brand-green-light` | `bg-brand-green-light`, `text-brand-green-light`, `border-brand-green-light`, etc. |
| `--color-brand-green-medium` | `bg-brand-green-medium`, `focus:border-brand-green-medium`, `focus:ring-brand-green-medium`, etc. |
| `--color-brand-green-dark` | tương tự |
| `--color-brand-green-darker` | tương tự |
| `--color-brand-gray*` | tương tự |

→ **Không cần đụng vào 30 file component khác.** Chỉ cần fix `index.css` → toàn bộ code tự work.

> ⚠ **Lưu ý token `brand-green-medium`:** Class này đang được dùng ở `src/components/common/InputField.tsx`, `src/pages/HomePage.tsx` (3 chỗ với `focus:border-brand-green-medium`, `focus:ring-brand-green-medium`). File `tailwind.config.ts` cũ KHÔNG có khai báo `'medium'` → class này đã fail từ trước, không chỉ do v4 migration. PHẢI thêm token `--color-brand-green-medium: #10b981` vào `@theme`, nếu không InputField + HomePage vẫn lỗi sau Phase A.

---

## 2. VERIFY KHÔNG BREAK ADMIN PAGES

### 2.1. Vì sao cần verify

Admin pages (`src/components/admin/*`, `src/pages/admin/*`) cũng dùng class `brand-green*` (đã verify qua grep). Cùng config bug → admin pages cũng đang fail visually nhưng có thể ít rõ hơn vì user chưa xem.

→ **Tin tốt:** Fix `index.css` cũng sẽ tự fix admin pages cùng lúc. KHÔNG cần migrate riêng.

### 2.2. Verify checklist sau khi fix

Chạy `npm run dev`, lần lượt:

- [ ] `/admin/users` — sidebar có background xanh khi item active
- [ ] `/admin/users` — button "Thêm mới" gradient xanh đậm
- [ ] `/admin/configs/meals` — table border, header text màu đúng
- [ ] `/admin/configs/system` — input focus border xanh
- [ ] `/admin/configs/goals` — color theme nhất quán
- [ ] `/admin/configs/penalties` — tương tự
- [ ] `/admin/configs/scoring` — tương tự
- [ ] `/login` — button "Đăng nhập" gradient xanh
- [ ] `/register` — link "Đăng ký" xanh

Nếu **bất kỳ** trang admin nào hiện ra với màu bị sai (đen/xám thay vì xanh) → có nghĩa CSS chưa rebuild. Stop vite (`Ctrl+C`) và chạy lại `npm run dev` để Tailwind regenerate.

### 2.2.1. ⭐ OBJECTIVE VERIFY — CSS OUTPUT

Verify bằng "nhìn screenshot" có thể bị bias (vd browser cache hiển thị màu cũ). Verify objective hơn bằng grep CSS output sau build:

```bash
# Sau khi sửa index.css + restart vite, chạy build:
npm run build

# Tìm token trong CSS output (thư mục dist/assets/*.css):
grep "brand-green" dist/assets/*.css | head -10
```

**Kỳ vọng output có dạng:**
```
--color-brand-green: #059669;
--color-brand-green-light: #ecfdf5;
--color-brand-green-medium: #10b981;
--color-brand-green-dark: #047857;
--color-brand-green-darker: #065f46;
.bg-brand-green { background-color: var(--color-brand-green); }
.text-brand-green-dark { color: var(--color-brand-green-dark); }
...
```

→ Nếu grep KHÔNG có dòng nào → Phase A FAIL. STOP và debug trước khi sang Phase B.
→ Nếu grep CÓ token nhưng thiếu (vd thấy `--color-brand-green` nhưng không thấy `--color-brand-green-medium`) → kiểm tra spelling token trong `@theme` block. Phải đúng format `--color-{name}` từng ký tự.

### 2.3. Fallback nếu vẫn không work

Nếu sau khi fix `index.css` mà vẫn không thấy màu xanh:

**Cách 1 — Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run dev
```

**Cách 2 — Verify HMR pick up CSS change:**
- Mở DevTools > Network > CSS file > kiểm tra response có chứa `--color-brand-green` chưa.
- Nếu chưa → restart vite hoàn toàn.

**Cách 3 — Verify Tailwind plugin work:**
```bash
# Trong vite.config.ts cần có:
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],   // ← tailwindcss() PHẢI đứng sau react()
})
```

(Đã verify project hiện tại có đúng setup này, nên cách 3 chỉ là defense.)

---

## 3. CLEANUP CONFIG CŨ — PHASE D, OPTIONAL VÀ SAU KHI VISUAL ỔN

### 3.1. `tailwind.config.ts` ở root project

File này hiện đang **chết** — Tailwind v4 không đọc, không có effect gì.

**⚠ QUAN TRỌNG: KHÔNG XÓA NGAY sau Phase A.**

Lý do giữ file:
- **Insurance rollback:** Nếu Phase A vì lý do gì đó fail (Tailwind v4 còn bug mới phát hiện, hoặc plugin conflict), có thể fall back về v3 nhanh
- **Reference:** File chứa danh sách đầy đủ brand colors cũ — khi cần debug, có thể xem so sánh với `@theme` mới
- **Risk vs reward:** Xóa để "đỡ confusion" so với rủi ro mất reference khi cần debug → giữ file ROI cao hơn

**Thay vào đó — đổi nội dung file thành deprecated comment:**

```typescript
/**
 * ⚠ DEPRECATED — Tailwind v4 không đọc file này nữa (từ ngày DD/MM/YYYY)
 *
 * Brand tokens đã được migrate sang `src/index.css` qua @theme directive.
 * File này giữ lại làm reference + insurance rollback.
 *
 * Nếu cần thêm color/font mới:
 * - Edit @theme block trong `src/index.css`
 * - KHÔNG sửa file này
 *
 * Nếu cần rollback về v3 (rủi ro):
 * - Restore nội dung file này từ git history
 * - Downgrade tailwindcss về ^3.4.0
 * - Update vite.config.ts bỏ @tailwindcss/vite plugin
 */
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

// Nội dung dưới đây CHỈ là reference, KHÔNG có effect runtime.
// Nguồn của truth: src/index.css @theme block.
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}', './index.html'],
  theme: {
    extend: {
      colors: {
        'brand-green': {
          DEFAULT: '#059669',
          light: '#ecfdf5',
          medium: '#10b981',
          dark: '#047857',
          darker: '#065f46',
        },
        'brand-gray': {
          DEFAULT: '#6b7280',
          light: '#e5e7eb',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
} satisfies Config;
```

**KHI NÀO LÀM:** Chỉ làm Phase D sau khi:
- Phase A đã verify ổn (visual + admin pages OK)
- Đã run app vài ngày, không thấy bug visual
- Admin pages render đúng trên tất cả route

→ Trước thời điểm đó, **để nguyên file `tailwind.config.ts` không đụng vào**.

### 3.2. `@tailwindcss/forms` plugin

Plugin này hiện được import trong `tailwind.config.ts`. Vì v4 không đọc config đó, plugin **hiện tại cũng không work** — tức app đang chạy mà KHÔNG có plugin form. Nếu UI hiện tại trông OK, có nghĩa **không cần plugin**.

**⚠ KHÔNG thêm `@plugin "@tailwindcss/forms"` vào `index.css` mặc định.**

Lý do:
- Plugin sẽ override style của TẤT CẢ `<input>`, `<select>`, `<textarea>`, `<checkbox>` toàn app
- Có thể conflict với Tailwind utility class đã viết explicit (vd `border-2 border-gray-100` của input onboarding bị override)
- Có thể đổi appearance form login/register/admin mà không có lý do rõ ràng

**CHỈ thêm khi:**

Sau Phase A, verify thấy có form raw thực sự xấu — ví dụ:
- `<input type="checkbox">` mất rounded corner, trông xấu
- `<input type="radio">` style mặc định browser, không nhất quán với design
- `<select>` mũi tên dropdown trông cũ

Khi đó, thêm vào `index.css` (sau `@theme` block):

```css
@plugin "@tailwindcss/forms";
```

Test lại — nếu form đẹp hơn → giữ; nếu form khác đi (vd input onboarding bị override style) → remove dòng đó.

---

## 4. POLISH BONUS — 3 detail UX nhỏ user nêu

Sau khi fix Tailwind v4 (Phase 1), một số visual sẽ tự đẹp lên. Nhưng có 3 vấn đề user nêu cần thêm tinh chỉnh nhỏ.

### 4.1. Step indicator "không thấy step 1 khi qua step 2"

**Vấn đề user nói:** Khi chuyển sang Step 2 (Personal), thấy 4 node nhưng node 1 (Goal) không hiển thị rõ là đã completed.

**Phân tích code `WizardProgress.tsx`:**
```tsx
const done = step < current;
// ...
{done ? <CheckSVG /> : step}
```

Logic ĐÚNG — khi step 1 done thì render checkmark SVG. Sau khi fix Tailwind v4, ô tròn sẽ có background `bg-brand-green` + check trắng = visual "completed" rõ ràng.

**Tuy nhiên** có thể user cảm thấy node done "không nổi bật" vì size như nhau. Cải tiến nhỏ — tăng emphasis cho node done:

**File:** `src/components/onboarding/shared/WizardProgress.tsx`

**REPLACE block render circle:**

```tsx
<div
  className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all duration-300 ${
    done
      ? 'bg-brand-green text-white shadow-md shadow-brand-green/30'
      : active
        ? 'border-2 border-brand-green bg-white text-brand-green ring-4 ring-brand-green-light'
        : 'border border-gray-200 bg-white text-gray-400'
  }`}
>
  {done ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    step
  )}
</div>
```

**Thay đổi cụ thể:**
- `h-8 w-8` → `h-9 w-9` (lớn hơn 1 step)
- Done state: bỏ `border-2 border-brand-green` (vì đã có solid `bg-brand-green` rồi), thêm `shadow-md shadow-brand-green/30` (glow nhẹ)
- Active state: giữ nguyên
- Check SVG: `width=14 height=14` → `width=16 height=16`
- Thêm `transition-all duration-300` (mượt hơn `transition` default 150ms)

### 4.2. Mục tiêu cards thiếu icon ✓

**Vấn đề user nói:** Khi chọn 1 mục tiêu, không có icon ✓ nổi bật.

**Phân tích code `Step2Goal.tsx`:** Mình đã thêm checkmark từ Phase 2 polish (`<span className="absolute right-3 top-3 grid h-6 w-6 ... bg-brand-green text-white">`). Code đúng — nhưng vì `bg-brand-green` không apply (do Tailwind v4 config) → ô check thành trắng/trong suốt → user không thấy.

→ **Sau khi fix Tailwind v4, sẽ tự xuất hiện.**

**Nâng cấp thêm:** Tăng size checkmark, thêm animation pop-in cho cảm giác "tick" mượt:

**File:** `src/components/onboarding/steps/Step2Goal.tsx`

**Tìm block:**

```tsx
{selected && (
  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-green text-white">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)}
```

**REPLACE bằng:**

```tsx
{selected && (
  <span
    className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-brand-green text-white shadow-md shadow-brand-green/40"
    style={{ animation: 'wizardPop 200ms ease-out' }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)}
```

**Thay đổi:** Size `h-6 w-6` → `h-7 w-7`, thêm shadow xanh nhẹ, thêm animation pop-in.

**Cần thêm keyframe vào `src/index.css`** (cuối file):

```css
/* Animation cho checkmark khi user click chọn card */
@keyframes wizardPop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
```

### 4.3. Cards Step 4 Activity thiếu icon ✓

**Vấn đề user nói:** Mức vận động cards "không có icon chữ v thể hiện đã tick chọn".

**Phân tích code `Step4Activity.tsx` hiện tại:** Mình đã thêm radio dot (chấm tròn) ở phía phải card, KHÔNG phải check icon:

```tsx
<span className={`grid h-5 w-5 ... ${selected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'}`}>
  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
</span>
```

User muốn check icon (✓) cho đồng nhất với Step 2. Sửa:

**File:** `src/components/onboarding/steps/Step4Activity.tsx`

**Tìm và REPLACE block radio dot ở cuối card:**

```tsx
<span
  className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 ${
    selected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
  }`}
>
  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
</span>
```

**BẰNG:**

```tsx
<span
  className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full transition-all duration-200 ${
    selected
      ? 'bg-brand-green text-white shadow-md shadow-brand-green/40'
      : 'border-2 border-gray-200 bg-white'
  }`}
  style={selected ? { animation: 'wizardPop 200ms ease-out' } : undefined}
>
  {selected && (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )}
</span>
```

**Why:** Thay radio dot bằng checkmark SVG → đồng nhất với Step 2 + WizardProgress. User nhìn thấy ✓ thay vì chấm.

### 4.4. Mượt mà tổng thể — transition timing

User nói "xử lý cần tối ưu và mượt mà nhất". Đa số element hiện đang dùng class `transition` (default Tailwind = `all 150ms ease`). Nâng cấp lên:

**File:** `src/components/onboarding/shared/formStyles.ts`

**REPLACE:**

```ts
export const inputClassName = (hasError?: boolean) =>
  `w-full rounded-xl border-2 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green'
  }`;
```

**BẰNG:**

```ts
export const inputClassName = (hasError?: boolean) =>
  `w-full rounded-xl border-2 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition-all duration-200 ease-out placeholder:text-gray-400 ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
      : 'border-gray-100 hover:border-gray-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
```

**Thay đổi:**
- `transition` → `transition-all duration-200 ease-out` (mượt hơn, có easing chuẩn)
- Thêm `hover:border-gray-200` để input có feedback khi user hover
- Thêm `focus:ring-4 focus:ring-brand-green-light` để focus state nổi bật (vòng xanh nhạt bên ngoài)
- Error: thêm `focus:bg-white` để khi user bắt đầu sửa, background trở lại trắng

---

## 5. PAGE TRANSITION — STEP CHUYỂN BƯỚC MƯỢT (OPTIONAL)

User nói cần "mượt mà nhất có thể". Project đã có `framer-motion: ^11.18.2`. Có thể wrap mỗi step với `motion.div` cho transition slide.

### 5.1. Update `OnboardingWizard.tsx`

**File:** `src/components/onboarding/OnboardingWizard.tsx`

**Verify file hiện tại đang switch step ra sao trước khi sửa:**

```tsx
{currentStep === 1 && <Step1Welcome onNext={goNext} />}
{currentStep === 2 && <Step2Goal onNext={goNext} />}
// ... etc
```

**Nâng cấp với framer-motion (REPLACE block render step):**

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// ... bên trong component:
return (
  <div className="min-h-screen w-full" style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}>
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {currentStep === 1 && <Step1Welcome onNext={goNext} />}
        {currentStep === 2 && <Step2Goal onNext={goNext} />}
        {currentStep === 3 && <Step3Personal onNext={goNext} onBack={goBack} />}
        {currentStep === 4 && <Step4Activity onNext={goNext} onBack={goBack} />}
        {currentStep === 5 && <Step5Review onBack={goBack} goToStep={setStep} />}
      </motion.div>
    </AnimatePresence>
  </div>
);
```

**Why:** `AnimatePresence` + `mode="wait"` đảm bảo step cũ exit hoàn toàn (slide trái) trước khi step mới enter (slide từ phải). Transition 250ms = mượt, không lag.

**Lưu ý:** Lấy giá trị `key={currentStep}` quan trọng — framer-motion dựa vào key để biết component mới và trigger animation.

---

## 6. ORDER OF IMPLEMENTATION

Đề xuất 3 phase chính + 1 phase optional cleanup, làm tuần tự, KHÔNG nhảy:

### Phase A — Fix Tailwind v4 (BLOCKER, ~20 phút)
1. Edit `src/index.css` thêm `@theme` block (§1.2) — **CHÚ Ý: gồm cả `--color-brand-green-medium`**
2. Restart vite (`Ctrl+C` → `npm run dev`)
3. **OBJECTIVE VERIFY** — chạy `npm run build` rồi `grep "brand-green" dist/assets/*.css` (§2.2.1):
   - Phải có dòng `--color-brand-green: #059669;`
   - Phải có dòng `--color-brand-green-medium: #10b981;`
   - Phải có ít nhất 5-10 class `.bg-brand-green*`, `.text-brand-green*`, etc.
   - Nếu grep ra rỗng → STOP, debug trước khi tiếp
4. Visual verify đã đúng:
   - [ ] `/onboarding/wizard` Step 1: logo xanh đậm, button gradient xanh, pill "Mất 2 phút" có chấm + chữ xanh, "Care" xanh
   - [ ] Step 2: cards mục tiêu có border xanh khi selected, checkmark hiện
   - [ ] Step 3: step indicator hiển thị node 1 đã done (xanh có check trắng), input focus có ring xanh nhạt (test `brand-green-medium`)
   - [ ] Step 4: activity cards có checkmark khi chọn
5. Verify admin pages không bị break (§2.2): 7 route admin
6. **STOP — báo cáo cho user xem screenshot Phase A xong**, đợi confirm trước khi sang Phase B

### Phase B — Polish bonus 3 detail (~30 phút)
7. Update `WizardProgress.tsx` (§4.1) — node done shadow + size lớn hơn
8. Update `Step2Goal.tsx` (§4.2) — checkmark pop-in animation
9. Update `Step4Activity.tsx` (§4.3) — thay radio dot bằng check icon
10. Update `formStyles.ts` (§4.4) — input transition mượt hơn
11. Thêm keyframe `wizardPop` vào `index.css` (§4.2)
12. Verify screenshot lại từng step

### Phase C — Page transition (OPTIONAL, ~15 phút)
13. Update `OnboardingWizard.tsx` thêm framer-motion (§5)
14. Test chuyển bước 1→2→3→4→5: phải có slide effect mượt
15. Test "Quay lại": slide ngược (phải→trái)

### Phase D — Cleanup config cũ (OPTIONAL, sau khi visual ổn nhiều ngày)
16. **KHÔNG xóa** `tailwind.config.ts` ngay
17. Đổi nội dung file thành deprecated comment + reference (§3.1)
18. KHÔNG thêm `@plugin "@tailwindcss/forms"` vào CSS trừ khi form raw thực sự xấu (§3.2)
19. **Chỉ làm Phase D khi:** Phase A đã verify ổn, run app vài ngày không bug visual, admin pages OK trên tất cả route

---

## 7. ACCEPTANCE CRITERIA

### 7.1. Visual verify (mandatory sau Phase A)

So sánh với mockup design user đã upload (`Onboarding_Wizard.html`):

**Step 1 Welcome:**
- [ ] Logo: box gradient xanh từ `#059669` → `#10b981`, có icon `+` trắng bên trong, glow shadow xanh nhẹ phía dưới
- [ ] Wordmark "HealthCare": "Health" đen, "Care" xanh `#059669`
- [ ] Pill "Mất khoảng 2 phút": background trắng/80, border `#bbf7d0` (emerald-200), chấm xanh đậm bên trái, chữ xanh đậm `#047857`
- [ ] H1 "Chào mừng bạn đến với": chữ đen `gray-900`, kích thước lớn (`text-5xl` desktop)
- [ ] "HealthCare" trong H1: gradient text xanh
- [ ] 3 value cards: border xám nhạt, icon trong ô xanh nhạt `bg-brand-green-light`, hover ra border emerald
- [ ] Button "Bắt đầu": gradient xanh đậm với glow shadow xanh

**Step 2 Goal:**
- [ ] Header: 4 step indicator, step 1 đang active (viền 2px xanh + ring xanh nhạt + số xanh), step 2/3/4 viền xám
- [ ] "Bước 1/4 · Mục tiêu" chữ xám
- [ ] 3 cards mục tiêu: grid 3 cột (desktop), icon SVG arrow ↓/—/↑ trong ô bo tròn
- [ ] Khi click card: border 2px xanh `#059669`, background xanh nhạt, checkmark ✓ trong ô tròn xanh ở góc phải trên (pop animation)
- [ ] Khi hover (chưa selected): border emerald nhạt, background trắng/emerald nhạt

**Step 3 Personal:**
- [ ] Header: step 1 hiện ô tròn xanh có ✓ trắng (đã done, không hiển thị số nữa), step 2 active, step 3/4 xám
- [ ] Gender: 3 button segmented "Nam | Nữ | Khác", button selected có border xanh + background xanh nhạt + chữ đậm xanh

**Step 4 Activity:**
- [ ] Header: step 1, 2 đã done (xanh có ✓), step 3 active, step 4 xám
- [ ] 5 cards activity: emoji icon 🪑/🚶/🏃/💪/🔥 trong ô vuông trắng bên trái
- [ ] Card selected: border 2px xanh, background xanh nhạt, ✓ trong ô tròn xanh bên phải (KHÔNG phải radio dot)

**Step 5 Review:**
- [ ] Header: 3 step đầu done, step 4 active
- [ ] Info banner xanh nhạt: "💡 Có các số đo này, hệ thống sẽ tính được % mỡ cơ thể chính xác hơn..."
- [ ] Section "Tóm tắt thông tin": background `gray-50`, mỗi row có pencil icon bên phải

### 7.2. Performance/UX verify

- [ ] Click chuyển step: animation slide mượt, không lag (~250ms)
- [ ] Input focus: ring xanh nhạt xuất hiện mượt, không giật
- [ ] Hover cards: background transition mượt 200ms
- [ ] Checkmark khi tick card: pop-in animation rõ rệt

### 7.3. Regression verify

- [ ] `/admin/*` các trang admin: màu xanh vẫn đúng
- [ ] `/login`, `/register`: button + link xanh đúng
- [ ] `/dashboard`: ConstitutionCard, ReminderList màu xanh đúng

---

## 8. ⚠ TROUBLESHOOTING

### Q1: Sau khi sửa `index.css`, vẫn không thấy màu xanh?

**A:** Vite HMR đôi khi không reload CSS tokens. Restart hoàn toàn:
```bash
# Stop process hiện tại (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

### Q2: Một số class brand-* work, một số không?

**A:** Mỗi token cần đúng format `--color-{name}` để generate ALL classes. Verify tên CSS variable trong `@theme` block khớp với class trong code:

- Class `bg-brand-green` → cần `--color-brand-green` (KHÔNG phải `--brand-green` thiếu prefix `color`)
- Class `bg-brand-green-light` → cần `--color-brand-green-light` (nguyên cụm với dash)

### Q3: Build production fail?

**A:** Tailwind v4 yêu cầu tất cả class phải resolvable. Nếu có class typo (vd `bg-brand-greeen` viết sai chính tả), v4 vẫn không error nhưng class sẽ không có effect. Search project tìm typo:
```bash
grep -rn "brand-gree\|brand-grey\|brand-greem" src/
```

### Q4: Admin pages bây giờ trông KHÁC trước?

**A:** Có thể admin pages cũ đang dựa vào màu **default Tailwind** (vd `bg-green-600` thay vì `bg-brand-green`). Sau khi fix, nếu agent đã sửa file `MainLayout.tsx` hay `AdminSidebar.tsx` đúng cách thì màu sẽ đúng. Nếu admin pages dùng cả hai (cả `brand-green` và `green-600` lẫn lộn), có thể không đồng nhất — đây là tech debt cũ, không phải do fix này gây ra. Note lại, ưu tiên fix sau.

### Q5: Có cần update `vite.config.ts` không?

**A:** KHÔNG. Verify trong vite.config.ts đã có:
```ts
import tailwindcss from '@tailwindcss/vite'
plugins: [react(), tailwindcss()]
```

Project hiện tại đã đúng, không cần đụng.

---

## 9. COMMIT MESSAGE GỢI Ý

```bash
# Phase A
git add src/index.css
git commit -m "fix(ui): migrate Tailwind config to v4 @theme directive

Tailwind v4 không đọc tailwind.config.ts theo format v3 nữa.
Hậu quả: tất cả class brand-green*, brand-gray* generate ra
class trống, dẫn đến visual onboarding/dashboard/admin bị sai
(thiên trắng/xám thay vì xanh đậm).

Migrate sang @theme block trong index.css với CSS variables
format --color-brand-{name}. Toàn bộ 30 file component dùng
class brand-* tự work mà không cần đụng vào.

Ref: https://tailwindcss.com/docs/upgrade-guide#configuration-changes"

# Phase B
git commit -m "feat(ui): polish wizard step indicator + checkmark animation

- WizardProgress: node done có shadow, size lớn hơn (h-9)
- Step2Goal: checkmark pop-in animation 200ms
- Step4Activity: thay radio dot bằng check icon đồng nhất Step 2
- Input: transition mượt 200ms + focus ring xanh nhạt"

# Phase C
git commit -m "feat(ui): smooth page transition between onboarding steps

Wrap step render với framer-motion AnimatePresence để có slide
animation 250ms khi chuyển bước (next/back)."

# Phase D — CHỈ LÀM SAU KHI VISUAL ỔN VÀI NGÀY
git commit -m "chore: mark tailwind.config.ts as deprecated

Tailwind v4 không dùng file này nữa. Config đã migrate sang
src/index.css qua @theme directive. Giữ file lại làm reference
+ insurance rollback. KHÔNG xóa để dễ debug nếu cần."
```

---

## 10. RỦI RO + LƯU Ý

### 10.1. Rủi ro

**1. Plugin form không work nếu xóa `tailwind.config.ts`:**
- Tác động: Checkbox/radio raw có thể trông xấu (rounded corner mất)
- Fix: Nếu Phase A xong thấy form xấu, thêm `@plugin "@tailwindcss/forms";` vào CSS (§3.2)
- Khuyến nghị: KHÔNG thêm plugin mặc định, chỉ khi verify cần

**2. Class `brand-gray` có thể conflict với class default `gray` của Tailwind:**
- Verify: project hiện tại dùng cả `bg-gray-200` và `bg-brand-gray-light` (đều = `#e5e7eb`)
- Tác động: KHÔNG conflict, chỉ duplicate. Class `brand-gray` chỉ active khi explicit ghi.

**3. Custom font Be Vietnam Pro:**
- File `OnboardingShell.tsx` đang inline `style={{ fontFamily: ... }}` — sẽ override config
- Sau khi thêm `--font-sans: "Be Vietnam Pro"...` trong @theme, có thể remove inline style ở OnboardingShell để global apply font.
- Lưu ý: cần verify font đã import (Google Fonts CDN) trong `index.html`. Nếu chưa, font sẽ fallback về Inter.

**4. Token `brand-green-medium` đang fail từ trước:**
- `InputField.tsx` + `HomePage.tsx` dùng `focus:border-brand-green-medium` và `focus:ring-brand-green-medium`
- Class này KHÔNG có trong `tailwind.config.ts` cũ → đã fail trước khi migrate v4 (tech debt cũ)
- Sau Phase A nếu KHÔNG thêm `--color-brand-green-medium` vào @theme → vẫn fail
- → MUST thêm token này khi sửa @theme block

### 10.2. KHÔNG được đụng (trong Phase A-C)

- KHÔNG đổi component logic
- KHÔNG đổi prop interface của các Wizard components
- **KHÔNG xóa file `tailwind.config.ts`** — chỉ đổi nội dung thành deprecated ở Phase D (sau khi visual ổn vài ngày)
- KHÔNG xóa font fallback `Inter` trong `--font-sans` — Be Vietnam Pro có thể chưa load lần đầu, fallback tránh layout shift
- KHÔNG thêm `@plugin "@tailwindcss/forms"` vào CSS mặc định — chỉ thêm nếu verify thấy form raw bị xấu

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 26/05/2026 | v1.1 | Sau review: (1) Thêm token `--color-brand-green-medium: #10b981` vào `@theme` (vì `InputField.tsx` + `HomePage.tsx` đang dùng class này); (2) Sửa route admin verify từ `/admin/meal-config` → `/admin/configs/meals`, `/admin/configs/system` (đúng repo thực tế); (3) Phase D đổi từ "xóa file" → "đổi thành deprecated comment", chỉ là OPTIONAL sau khi visual ổn vài ngày; (4) KHÔNG khuyến nghị thêm `@plugin "@tailwindcss/forms"` mặc định — chỉ thêm khi verify form raw thực sự xấu; (5) Bonus §2.2.1: objective verify CSS output qua `grep` dist build. |
| 26/05/2026 | v1.0 | Hướng dẫn ban đầu. Root cause: Tailwind v4 không đọc config v3 format → 102 occurrence của class `brand-*` trong 30 file bị fail silently. Fix duy nhất: thêm `@theme` block vào `index.css`. Kèm 3 polish detail + framer-motion page transition. |
