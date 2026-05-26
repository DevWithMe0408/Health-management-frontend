# HƯỚNG DẪN POLISH UI — ONBOARDING + DASHBOARD

> **Mục đích:** Sau khi FE implement xong cả 2 trang (branch `feature/onboarding-dashboard-fe`), visual fidelity với design chỉ đạt ~6/10. File này hướng dẫn polish chi tiết để đạt ~9/10.
>
> **Audience:** Code agent FE.
> **Phương pháp:** BEFORE → AFTER snippet cụ thể cho từng file. Agent đọc tuần tự, apply, commit theo từng Phase.
>
> **Tổng workload:** ~1.5-2 ngày work. KHÔNG cần rewrite từ đầu — chỉ chỉnh sửa từng file đã có.

---

## 0. NGUYÊN TẮC

1. **KHÔNG xóa logic** — chỉ thay đổi JSX + className + thêm SVG icon. Service layer, validation, routing giữ nguyên.
2. **KHÔNG đổi prop interface** — các component vẫn nhận props như cũ. Agent chỉ thay đổi nội bộ render.
3. **Test sau từng Phase** — chạy `npm run dev`, kiểm tra visual trước khi sang Phase tiếp.
4. **Reference design source:** các file `wizard-shared.jsx`, `wizard-steps-1-3.jsx`, `wizard-steps-4-5.jsx`, `dashboard-w1.jsx`, `dashboard-w2.jsx`, `dashboard-w3.jsx` đã user cung cấp.

## 0.1. Priority ranking (impact giảm dần)

| Phase | Tên | Impact | Time |
|---|---|---|---|
| **1** | Quick wins (border-radius, title typography) | 🔥🔥🔥 Cao nhất | ~45 phút |
| **2** | Onboarding visual polish | 🔥🔥🔥 Cao | ~5-6h |
| **3** | Dashboard visual polish | 🔥🔥🔥 Cao | ~5-6h |
| **4** | Nice-to-have polish | 🔥 Optional | ~2-3h |

Agent có thể skip Phase 4 nếu thiếu thời gian — Phase 1-3 đủ để visual đạt ~9/10.

---

# PHASE 1 — QUICK WINS (~45 phút)

Tác động cao, công ít nhất. Làm xong là user sẽ thấy "đẹp hơn nhiều" ngay.

## Fix 1.1 — WizardCard border-radius + shadow

**File:** `src/components/onboarding/shared/WizardCard.tsx`

**Vấn đề:** Card đang dùng `rounded-lg` (8px) → trông giống admin form. Design dùng `rounded: 20` (~24px) → premium feel.

**BEFORE:**
```tsx
const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <section
      className={`relative z-10 mx-auto w-full max-w-[720px] rounded-lg border border-gray-100 bg-white p-6 shadow-sm md:p-10 ${className}`}
      style={{ boxShadow: '0 18px 42px -18px rgba(15, 31, 26, 0.2)' }}
    >
      {children}
    </section>
  );
};
```

**AFTER:**
```tsx
const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <section
      className={`relative z-10 mx-auto w-full max-w-[720px] rounded-3xl border border-gray-100 bg-white p-6 md:px-12 md:py-10 ${className}`}
      style={{
        boxShadow:
          '0 1px 2px rgba(15, 31, 26, 0.04), 0 12px 32px -12px rgba(15, 31, 26, 0.12), 0 0 0 1px rgba(15, 31, 26, 0.02)',
      }}
    >
      {children}
    </section>
  );
};
```

**Why:** `rounded-3xl` = 24px khớp design. Multi-layer shadow tạo depth tinh tế hơn shadow đơn lẻ.

---

## Fix 1.2 — DashboardCard title typography

**File:** `src/components/dashboard/DashboardCard.tsx`

**Vấn đề:** Title đang `text-base font-semibold text-gray-900` ("Thể trạng hiện tại" — chữ thường đen đậm). Design: `text-xs font-bold uppercase tracking-wider text-gray-500` ("THỂ TRẠNG HIỆN TẠI"). Đây là **vấn đề visual hierarchy lớn nhất của Dashboard**.

**BEFORE:**
```tsx
const DashboardCard: React.FC<DashboardCardProps> = ({
  title, rightAction, children, className = '',
}) => {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || rightAction) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          {rightAction}
        </div>
      )}
      {children}
    </section>
  );
};
```

**AFTER:**
```tsx
interface DashboardCardProps {
  title?: string;
  subtitle?: string;       // ← THÊM optional subtitle
  info?: string;           // ← THÊM optional tooltip text
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title, subtitle, info, rightAction, children, className = '',
}) => {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-6 ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
    >
      {(title || rightAction) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                {title}
                {info && (
                  <span
                    title={info}
                    className="inline-grid h-3.5 w-3.5 cursor-help place-items-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-500"
                  >
                    i
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {rightAction}
        </div>
      )}
      {children}
    </section>
  );
};
```

**Why:** Title uppercase + tracking + gray-500 tạo visual hierarchy chuẩn — title chỉ là "section label" để các value bên dưới (constitution name, weight number) shine ra. Bonus thêm `subtitle` + `info` (tooltip icon) cho phép các card phức tạp render rich hơn.

---

## Fix 1.3 — Background Onboarding shell

**File:** `src/components/onboarding/shared/OnboardingShell.tsx`

**Vấn đề:** Logo đang là "HC" trong box xanh — không khớp design (design có icon `+` plus mark + wordmark "Health**Care**" với "Care" màu xanh).

**BEFORE:**
```tsx
<div className="flex items-center gap-3">
  <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-green text-white shadow-sm">
    <span className="text-base font-bold">HC</span>
  </div>
  <span className="text-lg font-bold text-brand-green-dark">HealthCare</span>
</div>
```

**AFTER:**
```tsx
<div className="flex items-center gap-2.5">
  <div
    className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-green to-emerald-500"
    style={{ boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.45)' }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.75" strokeLinecap="round" />
    </svg>
  </div>
  <span className="text-base font-bold tracking-tight text-gray-900">
    Health<span className="text-brand-green">Care</span>
  </span>
</div>
```

**Why:** Plus icon gradient box + wordmark split-color = brand identity rõ ràng, match design 100%.

---

## ✅ Acceptance Phase 1

- [ ] Card onboarding bo góc lớn hơn rõ rệt, shadow tinh tế hơn
- [ ] Header onboarding có icon `+` gradient và wordmark "HealthCare" với "Care" xanh
- [ ] Mọi Dashboard card có title in hoa nhỏ ("THỂ TRẠNG HIỆN TẠI"), không phải chữ thường đậm

---

# PHASE 2 — ONBOARDING VISUAL POLISH (~5-6h)

## Fix 2.1 — Step 1 Welcome rebuild

**File:** `src/components/onboarding/steps/Step1Welcome.tsx`

**Vấn đề:** Hiện đang là 3 ô gray-50 đơn điệu. Design có pill "Mất 2 phút" + H1 hấp dẫn + 3 value cards có icon + footer microcopy. Đây là trang đầu user thấy → cần ấn tượng.

**REPLACE TOÀN BỘ FILE:**

```tsx
import React from 'react';

interface Step1WelcomeProps {
  onNext: () => void;
}

const valueProps = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Cá nhân hóa theo thể trạng',
    description: 'Phân tích BMI + PBF để gợi ý thực đơn phù hợp.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
      </svg>
    ),
    title: 'Toàn bộ là món Việt',
    description: 'Cơm tấm, bún bò, phở... những món bạn ăn hằng ngày.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Đề xuất thông minh hằng ngày',
    description: 'Mỗi ngày một bộ thực đơn cân bằng, có thể đổi món tùy ý.',
  },
];

const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onNext }) => {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-8 text-center md:py-12">
      {/* Pill "Mất khoảng 2 phút" */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-green-dark backdrop-blur">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green" />
        Mất khoảng 2 phút
      </div>

      {/* H1 với gradient text */}
      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
        Chào mừng bạn đến với{' '}
        <span className="bg-gradient-to-br from-brand-green to-emerald-500 bg-clip-text text-transparent">
          HealthCare
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mb-10 max-w-md text-base leading-7 text-gray-600 md:text-lg">
        Trợ lý dinh dưỡng cá nhân của bạn. Mỗi ngày một thực đơn phù hợp,
        chỉ với vài thông tin cơ bản.
      </p>

      {/* 3 value cards */}
      <div className="mb-10 grid w-full gap-3 md:grid-cols-3 md:gap-4">
        {valueProps.map((vp) => (
          <div
            key={vp.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 text-left transition hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-brand-green-light text-brand-green-dark">
              {vp.icon}
            </div>
            <div className="text-sm font-semibold text-gray-900">{vp.title}</div>
            <p className="mt-1 text-xs leading-5 text-gray-500">{vp.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-500 px-8 py-3.5 text-base font-semibold text-white transition hover:from-brand-green-dark hover:to-emerald-600"
        style={{ boxShadow: '0 8px 20px -6px rgba(5, 150, 105, 0.5)' }}
      >
        Bắt đầu
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Footer microcopy */}
      <p className="mt-8 max-w-sm text-xs leading-5 text-gray-400">
        🔒 Thông tin của bạn được bảo mật và chỉ dùng để cá nhân hóa thực đơn.
        Bạn có thể chỉnh sửa bất kỳ lúc nào trong Hồ sơ.
      </p>
    </div>
  );
};

export default Step1Welcome;
```

**Why:** Welcome KHÔNG dùng `WizardCard` — design có layout free, không bị bó vào card 720px. Pill + gradient H1 + value cards có icon SVG + CTA size lớn + footer microcopy = brand-on welcome.

---

## Fix 2.2 — Step 2 Goal: grid 3 cols + icon SVG

**File:** `src/components/onboarding/steps/Step2Goal.tsx`

**Vấn đề:** Cards đang stack vertical 1 column. Design dùng grid 3 cols (desktop), mỗi card có icon SVG arrow.

**REPLACE `goals` const + render section của 3 card:**

Thay block:
```tsx
const goals: Array<{ code: GoalCode; title: string; description: string }> = [ ... ];
```

Bằng:
```tsx
const goals: Array<{
  code: GoalCode;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    code: 'GIAM',
    title: 'Giảm cân',
    description: 'Phù hợp khi bạn muốn xuống cân an toàn (~0.5kg/tuần).',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    ),
  },
  {
    code: 'DUY_TRI',
    title: 'Duy trì cân nặng',
    description: 'Giữ ổn định thể trạng, xây dựng thói quen ăn lành mạnh.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    code: 'TANG',
    title: 'Tăng cân',
    description: 'Tăng cân lành mạnh, ưu tiên cơ và năng lượng.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
];
```

Thay đổi h1 (mềm hơn cho user):
```tsx
<h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
  Bạn muốn đạt mục tiêu gì?
</h1>
<p className="mt-2 text-sm leading-6 text-gray-600 md:text-base">
  Chúng tôi sẽ tùy chỉnh thực đơn theo mục tiêu này. Bạn có thể đổi sau.
</p>
```

Thay block `<div className="mt-6 grid gap-3">` (cards) bằng:
```tsx
<div className="mt-7 grid gap-3 md:grid-cols-3 md:gap-4">
  {goals.map((goal) => {
    const selected = selectedGoal === goal.code;
    return (
      <button
        key={goal.code}
        type="button"
        onClick={() => {
          setValue('goalCode', goal.code, { shouldDirty: true, shouldValidate: true });
          updateData({ goalCode: goal.code });
        }}
        className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition ${
          selected
            ? 'border-brand-green bg-brand-green-light'
            : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
        }`}
      >
        {selected && (
          <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-green text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <div
          className={`grid h-12 w-12 place-items-center rounded-xl ${
            selected ? 'bg-white text-brand-green-dark' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {goal.icon}
        </div>
        <div>
          <div className={`text-base font-bold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
            {goal.title}
          </div>
          <div className="mt-1 text-xs leading-5 text-gray-600">{goal.description}</div>
        </div>
      </button>
    );
  })}
</div>
```

**Why:** Grid 3 cols + icon SVG + checkmark góc trên phải khi selected + border 2px = visual hierarchy đẹp hơn list dọc.

---

## Fix 2.3 — Step 3 Personal: segmented control cho Gender

**File:** `src/components/onboarding/steps/Step3Personal.tsx`

**Vấn đề:** Field `<select>` xấu. Design: 3 button "Nam | Nữ | Khác" như iOS segmented control.

**Thay block field Giới tính:**

```tsx
<WizardField label="Giới tính" required error={errors.gender?.message}>
  <select className={inputClassName(!!errors.gender)} {...register('gender')}>
    <option value="">Chọn giới tính</option>
    <option value="MALE">Nam</option>
    <option value="FEMALE">Nữ</option>
    <option value="OTHER">Khác</option>
  </select>
</WizardField>
```

Bằng:
```tsx
<WizardField label="Giới tính" required error={errors.gender?.message}>
  <div className="grid grid-cols-3 gap-2">
    {[
      { value: 'MALE', label: 'Nam' },
      { value: 'FEMALE', label: 'Nữ' },
      { value: 'OTHER', label: 'Khác' },
    ].map((opt) => {
      const selected = watch('gender') === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => setValue('gender', opt.value as 'MALE' | 'FEMALE' | 'OTHER', {
            shouldDirty: true, shouldValidate: true,
          })}
          className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
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
</WizardField>
```

**Lưu ý:** Cần thêm `setValue` vào destructure của `useForm`:

```tsx
const {
  register,
  handleSubmit,
  watch,
  setValue,       // ← THÊM dòng này
  formState: { errors, isValid },
} = useForm<Step3Data>({ ... });
```

**Why:** Segmented control 3 button visible toàn bộ option ngay, click 1 lần là xong. Dropdown phải click 2 lần (mở + chọn) và mobile UX kém.

---

## Fix 2.4 — Step 4 Activity: thêm emoji icon lớn

**File:** `src/components/onboarding/steps/Step4Activity.tsx`

**Vấn đề:** Cards text-only + giá trị `1.55` bên phải (không có trong design). Design: emoji icon lớn bên trái + title + desc.

**REPLACE `activityOptions` const:**

```tsx
const activityOptions = [
  { value: 1.2, emoji: '🪑', title: 'Ít vận động', description: 'Làm văn phòng cả ngày, hầu như không tập' },
  { value: 1.375, emoji: '🚶', title: 'Vận động nhẹ', description: 'Đi bộ thường xuyên, tập 1-3 buổi/tuần' },
  { value: 1.55, emoji: '🏃', title: 'Vận động vừa', description: 'Tập đều 3-5 buổi/tuần' },
  { value: 1.725, emoji: '💪', title: 'Vận động nhiều', description: 'Tập 6-7 buổi/tuần' },
  { value: 1.9, emoji: '🔥', title: 'Rất vận động', description: 'Lao động chân tay nặng + tập gym' },
];
```

**REPLACE render card:**

```tsx
{activityOptions.map((option) => {
  const selected = selectedActivity === option.value;
  return (
    <button
      key={option.value}
      type="button"
      onClick={() =>
        setValue('activityFactor', option.value, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
        selected
          ? 'border-brand-green bg-brand-green-light'
          : 'border-gray-100 bg-white hover:border-emerald-200'
      }`}
    >
      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-2xl">
        {option.emoji}
      </span>
      <div className="flex-1">
        <div className={`text-sm font-semibold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
          {option.title}
        </div>
        <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
      </div>
      <span
        className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 ${
          selected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
        }`}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
    </button>
  );
})}
```

**Why:** Emoji icon 🪑/🚶/🏃/💪/🔥 visual identity rõ. Giá trị `1.55` không cần show cho user — họ không quan tâm số.

---

## Fix 2.5 — Step 5: info banner + pencil edit icon

**File:** `src/components/onboarding/steps/Step5Review.tsx`

**Vấn đề:** Thiếu info banner giải thích lợi ích nhập số đo, button "Sửa" dùng text thay vì pencil icon.

**Thêm info banner ngay sau `<p>...</p>` subtitle, TRƯỚC `<form>`:**

```tsx
<p className="mt-2 text-sm leading-6 text-gray-600">
  Số đo là tùy chọn, nhưng sẽ giúp hệ thống phân loại thể trạng chính xác hơn.
</p>

{/* MỚI: Info banner */}
<div className="mt-5 rounded-xl bg-brand-green-light p-4 text-sm">
  <div className="flex gap-2.5">
    <span className="text-lg leading-none">💡</span>
    <p className="leading-6 text-brand-green-darker">
      Có các số đo này, hệ thống sẽ tính được <b>% mỡ cơ thể chính xác hơn</b>.
      Nếu chưa có thước dây, bạn có thể bỏ qua và cập nhật sau.
    </p>
  </div>
</div>

<form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
```

**Thay `ReviewRow` component (đang dùng text "Sửa"):**

```tsx
const ReviewRow: React.FC<{ label: string; value: string; onEdit: () => void }> = ({
  label, value, onEdit,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0">
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-gray-900">{value}</div>
    </div>
    <button
      type="button"
      onClick={onEdit}
      title={`Sửa ${label.toLowerCase()}`}
      className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-brand-green-dark"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4v16h16v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  </div>
);
```

**Why:** Info banner xanh nhạt giải thích lợi ích = user hiểu vì sao nhập số đo, đỡ skip. Pencil icon cleaner hơn text "Sửa".

---

## Fix 2.6 — Form input style upgrade

**File:** `src/components/onboarding/shared/formStyles.ts`

**Vấn đề:** Input đang `rounded-md` (6px) + padding nhỏ. Design: `rounded-xl` (12px) + padding rộng hơn.

**REPLACE FILE:**

```ts
export const inputClassName = (hasError?: boolean) =>
  `w-full rounded-xl border-2 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green'
  }`;
```

**Why:** Border 2px (vs 1px hiện tại) khớp design. `rounded-xl` đồng bộ với card/button radius lớn hơn. Padding `py-3` rộng hơn `py-2.5` = touch target tốt hơn mobile.

---

## ✅ Acceptance Phase 2

- [ ] Step 1: Welcome page có pill "Mất 2 phút", H1 gradient text "HealthCare", 3 value cards có SVG icon, CTA lớn, footer microcopy
- [ ] Step 2: 3 goal cards layout grid 3 cols (desktop), 1 col (mobile), mỗi card có SVG arrow icon, checkmark khi selected
- [ ] Step 3: Gender dùng 3 button segmented control thay select dropdown
- [ ] Step 4: 5 activity cards có emoji icon lớn 🪑/🚶/🏃/💪/🔥, không show giá trị `1.55`
- [ ] Step 5: Info banner xanh "💡 Có số đo..." trên form, button edit là pencil icon
- [ ] Mọi input border 2px, rounded-xl, padding lớn hơn

---

# PHASE 3 — DASHBOARD VISUAL POLISH (~5-6h)

## Fix 3.1 — ConstitutionCard: custom glyph + advice text

**File:** `src/components/dashboard/ConstitutionCard.tsx`

**Vấn đề:** 4 constitution dùng Heroicons generic (giống nhau). Thiếu advice text đặc trưng.

**REPLACE block `meta` constant:**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type { ConstitutionResponse } from '../../services/constitution.service';
import type { MetricDataResponse } from '../../services/dashboard.service';
import type { ConstitutionCode } from '../../types/refactorUi.types';
import DashboardCard from './DashboardCard';

interface ConstitutionCardProps {
  constitution: ConstitutionResponse | null;
  bmiMetric?: MetricDataResponse;
  error?: string;
  onRetry: () => void;
}

// Glyph SVG riêng cho từng constitution
const ConstitutionGlyph: React.FC<{ type: 'thin' | 'check' | 'warn'; color: string }> = ({ type, color }) => {
  if (type === 'check') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.75" />
        <path d="M7 12.5l3.5 3.5L17 9" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'warn') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 21h20L12 2z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 10v5M12 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // thin (GẦY)
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.5" stroke={color} strokeWidth="1.75" />
      <path d="M10 9v6l-1.5 6M14 9v6l1.5 6M9 14h6" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
};

const meta: Record<ConstitutionCode, {
  label: string;
  border: string;
  bg: string;
  text: string;
  iconHex: string;        // hex color cho SVG (không qua Tailwind class)
  glyph: 'thin' | 'check' | 'warn';
  advice: string;
}> = {
  GAY: {
    label: 'GẦY',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    iconHex: '#f59e0b',
    glyph: 'thin',
    advice: 'Nên tăng cân lành mạnh, ưu tiên đạm và tinh bột tốt.',
  },
  CAN_DOI: {
    label: 'CÂN ĐỐI',
    border: 'border-emerald-200',
    bg: 'bg-brand-green-light',
    text: 'text-brand-green-darker',
    iconHex: '#059669',
    glyph: 'check',
    advice: 'Duy trì chế độ ăn cân bằng và vận động đều đặn.',
  },
  THUA_CAN: {
    label: 'THỪA CÂN',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    iconHex: '#ea580c',
    glyph: 'warn',
    advice: 'Cân nhắc giảm tinh bột tinh chế, tăng rau xanh và vận động.',
  },
  BEO_PHI: {
    label: 'BÉO PHÌ',
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
    iconHex: '#dc2626',
    glyph: 'warn',
    advice: 'Cần giảm cân có kế hoạch. Nên tham khảo bác sĩ dinh dưỡng.',
  },
};
```

**REPLACE block render constitution (lúc có data):**

Tìm block bắt đầu từ `const currentMeta = meta[constitution.constitution];` và replace cả block return cho tới hết function:

```tsx
const currentMeta = meta[constitution.constitution];
const updatedAt = constitution.computedAt || bmiMetric?.recordedAt || bmiMetric?.lastUpdatedAt;

return (
  <DashboardCard
    title="Thể trạng hiện tại"
    info="Phân loại theo BMI + PBF (worst case principle)"
  >
    <div className="flex items-start gap-4">
      <div className={`grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl border ${currentMeta.border} ${currentMeta.bg}`}>
        <ConstitutionGlyph type={currentMeta.glyph} color={currentMeta.iconHex} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-2xl font-extrabold tracking-tight ${currentMeta.text}`}>
          {currentMeta.label}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
          <span>
            <span className="mr-1 text-gray-400">BMI</span>
            <b className="text-gray-900">{constitution.bmi?.toFixed(1) ?? '--'}</b>
          </span>
          {constitution.pbf != null && (
            <>
              <span className="text-gray-200">·</span>
              <span>
                <span className="mr-1 text-gray-400">PBF</span>
                <b className="text-gray-900">{constitution.pbf.toFixed(1)}%</b>
                <span className="ml-1.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10.5px] font-medium text-gray-500">
                  {constitution.pbfSource === 'FORMULA' ? 'Navy' : 'ML'}
                </span>
              </span>
            </>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">{currentMeta.advice}</p>
      </div>
    </div>

    <BmiScale bmi={constitution.bmi} />

    {constitution.warning && (
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-700">
        <span className="text-base">💡</span>
        <span className="flex-1">{constitution.warning}</span>
        <Link to="/submit-data" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
          Cập nhật →
        </Link>
      </div>
    )}

    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
      <span>{formatDateTime(updatedAt)}</span>
      <Link to="/stats" className="font-semibold text-brand-green hover:text-brand-green-dark">
        Xem chi tiết →
      </Link>
    </div>
  </DashboardCard>
);
```

**Why:** Custom glyph SVG = visual identity 4 constitution khác biệt. Advice text = giá trị UX, user biết bước tiếp theo. Warning banner có CTA "Cập nhật" làm action explicit.

---

## Fix 3.2 — BmiScale: đúng tỉ lệ + labels số

**File:** `src/components/dashboard/ConstitutionCard.tsx` (cùng file)

**Vấn đề:** Segments hardcode 25% mỗi cái. Labels chỉ là text constitution.

**REPLACE component `BmiScale`:**

```tsx
const BmiScale: React.FC<{ bmi: number | null }> = ({ bmi }) => {
  const MIN = 14, MAX = 30;
  const marker = bmi == null ? null : Math.max(2, Math.min(98, ((bmi - MIN) / (MAX - MIN)) * 100));

  // Segment widths theo công thức (không hardcode)
  const segments = [
    { color: 'bg-amber-400', w: ((18.5 - MIN) / (MAX - MIN)) * 100 },   // ~28%
    { color: 'bg-emerald-500', w: ((23 - 18.5) / (MAX - MIN)) * 100 },  // ~28%
    { color: 'bg-orange-500', w: ((25 - 23) / (MAX - MIN)) * 100 },     // ~12.5%
    { color: 'bg-red-500', w: ((MAX - 25) / (MAX - MIN)) * 100 },       // ~31%
  ];

  return (
    <div className="mt-5">
      <div className="relative flex h-2 gap-0.5 overflow-visible">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`${s.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === segments.length - 1 ? 'rounded-r-full' : ''}`}
            style={{ width: `${s.w}%`, opacity: 0.85 }}
          />
        ))}
        {marker != null && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-900 bg-white"
            style={{ left: `${marker}%`, boxShadow: '0 2px 4px rgba(0,0,0,.2)' }}
          />
        )}
      </div>
      {/* Labels số, không phải text constitution (đã có ở title trên) */}
      <div
        className="mt-2 flex justify-between text-[10.5px] font-medium text-gray-400"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <span>14</span>
        <span>18.5</span>
        <span>23</span>
        <span>25</span>
        <span>30+</span>
      </div>
    </div>
  );
};
```

**Why:** Tỉ lệ đúng theo thực tế BMI threshold (không phải mỗi segment 25%). Labels số là information mới (constitution name đã hiển thị ở title rồi → không cần repeat).

---

## Fix 3.3 — ReminderList: emoji icons + dismiss + empty state

**File:** `src/components/dashboard/ReminderList.tsx`

**Vấn đề:** Icon Heroicons generic, không dismiss button, không empty state đẹp.

**REPLACE `Reminder` interface:**

```tsx
interface Reminder {
  key: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  emoji: string;     // ← THÊM
  title: string;
  message: string;
  ctaText: string;
  ctaPath: string;
}
```

**REPLACE `buildReminders` body — thêm `emoji` cho từng reminder:**

```tsx
const buildReminders = (
  user: UserProfileData | null,
  metrics: DashboardMetricsResponse | null,
  weightHistory: HealthHistoryPoint[],
  currentGoal: UserGoalResponse | null
): Reminder[] => {
  const reminders: Reminder[] = [];

  if (!user?.birthDate || !user?.gender) {
    reminders.push({
      key: 'profile-incomplete',
      priority: 'HIGH',
      emoji: '👤',
      title: 'Bổ sung thông tin hồ sơ',
      message: 'Ngày sinh và giới tính giúp hệ thống tính BMR, TDEE và PBF chính xác hơn.',
      ctaText: 'Cập nhật hồ sơ',
      ctaPath: '/profile',
    });
  }

  const lastWeightAt = metrics?.weight?.recordedAt || metrics?.weight?.lastUpdatedAt;
  const daysSinceWeight = daysBetween(lastWeightAt);
  if (daysSinceWeight == null || daysSinceWeight > 7) {
    reminders.push({
      key: 'weight-outdated',
      priority: 'HIGH',
      emoji: '⚖️',
      title: daysSinceWeight == null ? 'Chưa có cân nặng gần đây' : `Đã ${daysSinceWeight} ngày chưa cân`,
      message: 'Cập nhật cân nặng để dashboard phản ánh đúng tiến độ.',
      ctaText: 'Cập nhật cân nặng',
      ctaPath: '/submit-data',
    });
  }

  const trend = computeWeightTrend(weightHistory.slice(-7));
  if (trend != null && currentGoal?.goalCode === 'DUY_TRI' && trend < -0.7) {
    reminders.push({
      key: 'weight-dropping',
      priority: 'MEDIUM',
      emoji: '📉',
      title: 'Cân đang giảm nhanh hơn dự kiến',
      message: `Đã giảm ${Math.abs(trend).toFixed(1)}kg trong tuần. Mục tiêu là duy trì — xem lại chế độ?`,
      ctaText: 'Xem chi tiết',
      ctaPath: '/stats',
    });
  }

  // Reminder LOW gợi ý (giữ nguyên các reminder LOW khác nếu agent đã code)
  // Nếu chưa có, có thể thêm:
  if (reminders.length === 0) {
    // Sẽ render empty state
  }

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
};
```

**REPLACE `priorityStyle`:**

```tsx
const priorityStyle = {
  HIGH: {
    card: 'border-amber-200 bg-amber-50',
    iconBg: 'bg-amber-100',
  },
  MEDIUM: {
    card: 'border-blue-200 bg-blue-50',
    iconBg: 'bg-blue-100',
  },
  LOW: {
    card: 'border-gray-200 bg-gray-50',
    iconBg: 'bg-gray-100',
  },
};
```

**REPLACE `return` của ReminderList component:**

```tsx
return (
  <DashboardCard
    title="Nhắc nhở"
    subtitle={reminders.length > 0 ? `${reminders.length} việc cần làm` : undefined}
    rightAction={
      reminders.length > 0 ? (
        <Link to="/notifications" className="text-xs font-medium text-gray-400 hover:text-gray-600">
          Xem tất cả →
        </Link>
      ) : undefined
    }
  >
    {reminders.length === 0 ? (
      <div className="flex flex-col items-center gap-2.5 py-6 text-center">
        <div className="grid h-13 w-13 place-items-center rounded-2xl border border-emerald-200 bg-brand-green-light text-2xl">
          ✨
        </div>
        <div className="text-sm font-semibold text-gray-900">Tuyệt vời! Mọi thứ đều ổn.</div>
        <p className="max-w-xs text-xs leading-5 text-gray-500">
          Bạn đang theo dõi đầy đủ. Tiếp tục duy trì để đạt mục tiêu nhé!
        </p>
      </div>
    ) : (
      <div className="space-y-2.5">
        {reminders.map((reminder) => {
          const style = priorityStyle[reminder.priority];
          return (
            <div key={reminder.key} className={`relative rounded-xl border p-3.5 pl-3.5 pr-9 ${style.card}`}>
              <div className="flex gap-3">
                <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg ${style.iconBg}`}>
                  {reminder.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900">{reminder.title}</div>
                  <p className="mt-0.5 text-xs leading-5 text-gray-600">{reminder.message}</p>
                  <Link
                    to={reminder.ctaPath}
                    className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    {reminder.ctaText}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
              {/* Dismiss button góc trên phải */}
              <button
                type="button"
                title="Ẩn nhắc nhở này"
                className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-gray-400 hover:bg-white hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO V2: implement dismiss logic (persist to backend)
                  console.log('Dismiss reminder:', reminder.key);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    )}
  </DashboardCard>
);
```

**Why:** Emoji 👤⚖️📉 đặc trưng từng loại = user scan nhanh. Dismiss button cho phép tạm ẩn (logic backend V2). Empty state ✨ "Mọi thứ đều ổn" là moment vui — UX win lớn khi user thấy lần đầu.

---

## Fix 3.4 — MetricSummaryGrid value emphasis

**File:** `src/components/dashboard/MetricSummaryGrid.tsx`

**Vấn đề:** Layout hiện tại OK nhưng visual hierarchy yếu — value và label cùng size. Design metric cards có value rất nổi bật.

**REPLACE block return:**

```tsx
return (
  <div className="grid gap-3 sm:grid-cols-3">
    {items.map(({ label, value, helper, Icon, bg, text }) => (
      <section
        key={label}
        className="rounded-2xl border border-gray-200 bg-white p-4"
        style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}
      >
        <div className={`mb-3 inline-flex rounded-xl ${bg} p-2.5 ${text}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-0.5 text-[11px] text-gray-400">{helper}</div>
      </section>
    ))}
  </div>
);
```

**Why:** Value `text-2xl font-extrabold` + tabular-nums (số dóng thẳng cột) = main focus của card. Label uppercase + tracking + size nhỏ hơn = subtitle role. Visual hierarchy đúng pattern Dashboard.

---

## ✅ Acceptance Phase 3

- [ ] ConstitutionCard có glyph SVG riêng cho 4 nhóm (thin person/check/warning), không phải Heroicons generic
- [ ] ConstitutionCard có advice text khác nhau cho 4 nhóm
- [ ] BMI scale bar có segment width đúng tỉ lệ (28%/28%/12.5%/31%), labels số "14/18.5/23/25/30+"
- [ ] ReminderList: emoji icon đặc trưng (👤⚖️📉✨), dismiss button góc phải, empty state đẹp
- [ ] MetricSummaryGrid value lớn nổi bật, label nhỏ uppercase

---

# PHASE 4 — NICE-TO-HAVE POLISH (~2-3h, OPTIONAL)

## Fix 4.1 — HealthMetricsDetails: collapsible + tooltip per metric

**File:** `src/components/dashboard/HealthMetricsDetails.tsx`

**Vấn đề:** Section luôn expand, không có tooltip giải thích từng chỉ số (BMR là gì? PBF Navy là gì?). Design có collapse với preview khi collapsed + tooltip mỗi chỉ số.

**REPLACE TOÀN BỘ FILE:**

```tsx
import React, { useState } from 'react';
import type { DashboardMetricsResponse, MetricDataResponse } from '../../services/dashboard.service';

interface HealthMetricsDetailsProps {
  metrics: DashboardMetricsResponse | null;
  error?: string;
}

const metricRows: Array<{
  key: keyof DashboardMetricsResponse;
  label: string;
  fallbackUnit: string;
  tip?: string;
}> = [
  { key: 'height', label: 'Chiều cao', fallbackUnit: 'cm' },
  { key: 'weight', label: 'Cân nặng', fallbackUnit: 'kg' },
  { key: 'bmi', label: 'BMI', fallbackUnit: '', tip: 'Chỉ số khối cơ thể (WHO Asian)' },
  { key: 'bmr', label: 'BMR', fallbackUnit: 'kcal/ngày', tip: 'Tỉ lệ chuyển hóa cơ bản (Mifflin-St Jeor)' },
  { key: 'tdee', label: 'TDEE', fallbackUnit: 'kcal/ngày', tip: 'Tổng năng lượng tiêu thụ ngày' },
  { key: 'pbf', label: 'PBF', fallbackUnit: '%', tip: 'Tỉ lệ mỡ cơ thể (Navy formula)' },
  { key: 'whr', label: 'WHR', fallbackUnit: '', tip: 'Tỉ lệ eo/hông' },
];

const formatMetric = (metric: MetricDataResponse | undefined, fallbackUnit: string) => {
  if (!metric || metric.value == null) return '--';
  const unit = metric.unit ?? fallbackUnit;
  return `${metric.value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`;
};

const HealthMetricsDetails: React.FC<HealthMetricsDetailsProps> = ({ metrics, error }) => {
  const [open, setOpen] = useState(false);

  // Preview cho section khi collapsed (BMR/TDEE/PBF/WHR)
  const preview = [
    `BMR ${metrics?.bmr?.value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '--'}`,
    `TDEE ${metrics?.tdee?.value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '--'}`,
    `PBF ${metrics?.pbf?.value?.toFixed(1) || '--'}%`,
    `WHR ${metrics?.whr?.value?.toFixed(2) || '--'}`,
  ].join(' · ');

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Chi tiết chỉ số y khoa</span>
          {!open && (
            <span className="hidden truncate text-xs text-gray-400 sm:inline">· {preview}</span>
          )}
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{open ? 'Thu gọn' : 'Mở rộng'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5">
          {error && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {error}
            </div>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
            {metricRows.map((row) => (
              <div key={row.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {row.label}
                  {row.tip && (
                    <span
                      title={row.tip}
                      className="inline-grid h-3.5 w-3.5 cursor-help place-items-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-500"
                    >
                      i
                    </span>
                  )}
                </div>
                <div className="mt-1 text-base font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMetric(metrics?.[row.key], row.fallbackUnit)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsDetails;
```

**Why:** Collapsible saves vertical space khi user không quan tâm. Preview line khi collapsed cho power user thấy ngay BMR/TDEE/PBF. Tooltip giải thích là **defense talking point** — hội đồng hỏi "BMR là gì?" → user click → tooltip hiện "Mifflin-St Jeor".

---

## Fix 4.2 — Greeting hero gradient richer

**File:** `src/pages/DashboardPage.tsx`

**Vấn đề:** Greeting hero hiện tại OK nhưng background gradient nhạt. Design dùng gradient richer + goal pill với emoji.

**Tìm block `<section className="rounded-lg border border-emerald-100 bg-gradient-to-br...">` và REPLACE:**

```tsx
<section
  className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-brand-green-light via-emerald-50 to-white p-6 lg:p-7"
  style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}
>
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-[26px]">
        Xin chào, {displayName}! 👋
      </h1>
      {currentGoal && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span className="text-base">
            {currentGoal === 'GIAM' ? '📉' : currentGoal === 'TANG' ? '📈' : '⚖️'}
          </span>
          Đang theo mục tiêu:
          <span className="font-bold tracking-wide text-brand-green-darker">
            {goalLabels[currentGoal].toUpperCase()}
          </span>
        </div>
      )}
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
        PBF: <b className="text-gray-900">{pbfMethod}</b>
      </span>
      <Link
        to="/submit-data"
        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-200 px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-emerald-50"
      >
        <PlusCircleIcon className="h-4 w-4" />
        Cập nhật chỉ số
      </Link>
    </div>
  </div>
</section>
```

**Why:** Border `rounded-3xl` đồng bộ với các card khác. Gradient richer (3 stops từ brand-green-light → emerald-50 → white). Goal label UPPERCASE bold tạo emphasis. Emoji 📉📈⚖️ minh họa direction goal.

---

## ✅ Acceptance Phase 4

- [ ] HealthMetricsDetails có thể collapse/expand, có preview khi collapsed, tooltip giải thích chỉ số
- [ ] Greeting hero có gradient richer, goal label UPPERCASE bold, có emoji icon goal

---

# CÁC FILE PHỤ THUỘC KHÔNG CẦN ĐỘNG

Để agent KHÔNG đụng nhầm, đây là các file cần GIỮ NGUYÊN:

- `src/contexts/OnboardingContext.tsx` — state management OK
- `src/contexts/AuthContext.tsx` — refreshUser OK
- `src/components/common/OnboardingRoute.tsx` — routing guard OK
- `src/components/common/ProtectedRoute.tsx` — redirect logic OK
- `src/services/*` — toàn bộ service layer OK
- `src/types/onboarding.schemas.ts` — validation OK
- `src/components/onboarding/OnboardingWizard.tsx` — container OK
- `src/components/onboarding/GoalRecommendationModal.tsx` — trừ khi user phàn nàn cụ thể
- `src/components/onboarding/shared/WizardProgress.tsx` — OK
- `src/components/onboarding/shared/WizardField.tsx` — OK
- `src/components/onboarding/shared/WizardNavRow.tsx` — đã đúng design (gradient button + back text)
- `src/pages/OnboardingWizardPage.tsx` — wrapper OK
- `src/pages/DashboardPage.tsx` — trừ Fix 4.2 (greeting hero)

---

# 🔍 TEST SAU MỖI PHASE

```bash
# Sau Phase 1
npm run dev
# Mở /login → login → /onboarding/wizard
# Kiểm tra: card bo góc lớn hơn, dashboard title in hoa

# Sau Phase 2
# Click qua 5 step → kiểm tra visual mỗi step
# So sánh với mockup design

# Sau Phase 3
# Submit onboarding → vào /dashboard
# Kiểm tra ConstitutionCard glyph, BMI scale, ReminderList emoji

# Sau Phase 4 (nếu có)
# Click "Chi tiết chỉ số y khoa" → expand/collapse work
```

---

# DELIVERABLES

Sau khi xong cả 4 phase:

**Files đã thay đổi (KHÔNG file mới):**
- [ ] `src/components/onboarding/shared/WizardCard.tsx` — border-radius + shadow
- [ ] `src/components/onboarding/shared/OnboardingShell.tsx` — Logo plus icon + wordmark
- [ ] `src/components/onboarding/shared/formStyles.ts` — input style
- [ ] `src/components/onboarding/steps/Step1Welcome.tsx` — rebuild
- [ ] `src/components/onboarding/steps/Step2Goal.tsx` — grid 3 cols + icon
- [ ] `src/components/onboarding/steps/Step3Personal.tsx` — segmented gender
- [ ] `src/components/onboarding/steps/Step4Activity.tsx` — emoji activity
- [ ] `src/components/onboarding/steps/Step5Review.tsx` — info banner + pencil
- [ ] `src/components/dashboard/DashboardCard.tsx` — title typography
- [ ] `src/components/dashboard/ConstitutionCard.tsx` — glyph + advice + BMI scale
- [ ] `src/components/dashboard/ReminderList.tsx` — emoji + dismiss + empty state
- [ ] `src/components/dashboard/MetricSummaryGrid.tsx` — value emphasis
- [ ] `src/components/dashboard/HealthMetricsDetails.tsx` — collapsible (Phase 4)
- [ ] `src/pages/DashboardPage.tsx` — greeting hero (Phase 4)

**Commits theo phase:**
```
git commit -m "feat(ui): phase 1 polish - card radius + title typography"
git commit -m "feat(ui): phase 2 polish - onboarding visual identity"
git commit -m "feat(ui): phase 3 polish - dashboard widgets visual"
git commit -m "feat(ui): phase 4 polish - collapsible details + greeting hero"
```

---

# ⚠ LƯU Ý CHO AGENT

1. **KHÔNG đổi prop interface** — sẽ break các parent component.
2. **KHÔNG đổi className của tailwind dù trông "thừa"** — nhiều class đang dùng đúng (vd `bg-brand-green-light`, `text-brand-green-darker`).
3. **KHÔNG copy `style={{ fontFamily: ... }}` từ design** — font đã set ở OnboardingShell root.
4. **Test responsive sau mỗi Phase** — đặc biệt Step 2 (grid 3 cols → 1 col mobile) và Step 4 (activity cards).
5. **Nếu gặp lỗi TypeScript** — verify imports (vd `setValue` của react-hook-form), không import sai package.
6. **KHÔNG xóa logic submit/retry trong Step 5** — chỉ thay đổi presentation.

Nếu có gì không rõ, dừng lại và hỏi user trước khi guess.

---

## VERSION HISTORY

| Ngày | Version | Thay đổi |
|---|---|---|
| 26/05/2026 | v1.0 | Hướng dẫn polish ban đầu — 4 phase, ~14 file edit, ~1.5-2 ngày work. Apply BEFORE→AFTER snippet cụ thể, KHÔNG rewrite từ đầu. |
