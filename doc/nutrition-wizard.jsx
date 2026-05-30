// Nutrition Plan — Setup Wizard (lần đầu user vào trang, chưa có user_preferences)
// 3 bước: Số bữa → Cấu hình từng bữa → Xác nhận

// =========================================================================
// MODAL SHELL + BACKDROP
// =========================================================================
function WizardModalShell({ children, mobile = false, page = 'dashboard' }) {
  // Behind the modal: a dimmed view of the dashboard or whatever page they're on
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...dbFont }}>
      {/* Background page (dimmed) */}
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(1.5px) saturate(.85)', opacity: 0.45 }}>
        {mobile ? <NutritionPlanMobile /> : <NutritionPlanDesktop collapsedSang />}
      </div>

      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,.55)',
          zIndex: 10,
          display: 'flex',
          alignItems: mobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          padding: mobile ? 0 : 40,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =========================================================================
// PROGRESS DOTS — 3 dots indicator
// =========================================================================
function ProgressDots({ active = 0, count = 3 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 28 : 10,
              height: 10,
              borderRadius: 999,
              background: isActive ? DB.green : isDone ? '#a7f3d0' : '#e5e7eb',
              transition: 'width .25s, background .25s',
            }}
          />
        );
      })}
    </div>
  );
}

// =========================================================================
// MODAL CHROME (header logo + close button + body wrapper)
// =========================================================================
function WizardCard({ children, mobile = false, step = 0 }) {
  return (
    <div
      style={{
        width: mobile ? '100%' : '100%',
        maxWidth: mobile ? '100%' : 560,
        background: '#fff',
        borderRadius: mobile ? '20px 20px 0 0' : 18,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,.35), 0 8px 16px -8px rgba(0,0,0,.2)',
        padding: mobile ? '20px 22px 24px' : '32px 36px',
        position: 'relative',
        maxHeight: mobile ? '92%' : 'none',
        overflowY: 'auto',
      }}
    >
      {/* Drag handle on mobile */}
      {mobile && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: '#e5e7eb' }} />
        </div>
      )}

      {/* Tiny brand mark + Step N/3 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${DB.green}, #10b981)`,
            display: 'grid', placeItems: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: DB.greenDark, letterSpacing: '0.02em' }}>HealthCare</span>
        </div>
        <span style={{ fontSize: 12, color: DB.textMute, fontWeight: 600, letterSpacing: '0.05em' }}>
          Bước {step + 1} / 3
        </span>
      </div>

      <ProgressDots active={step} />
      {children}
    </div>
  );
}

// =========================================================================
// STEP 1 — choose meal count (2 big radio cards)
// =========================================================================
function WizardStep1({ mobile = false, selected = '3_BUA' }) {
  const opts = [
    { id: '3_BUA', title: '3 bữa truyền thống', icons: ['☀️', '🍽', '🌙'], desc: 'Sáng – Trưa – Tối', tag: 'Phổ biến nhất' },
    { id: '5_BUA', title: '5 bữa phân bố',       icons: ['☀️', '🥪', '🍽', '☕', '🌙'], desc: 'Sáng – Phụ – Trưa – Phụ – Tối', tag: 'Hợp với mục tiêu tăng cơ' },
  ];
  return (
    <>
      <h2 style={{ margin: 0, fontSize: mobile ? 20 : 23, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>
        Chọn số bữa ăn trong ngày
      </h2>
      <p style={{ margin: '6px 0 22px', fontSize: 13.5, color: DB.textMid, lineHeight: 1.55 }}>
        Bạn muốn ăn theo kế hoạch nào? Lựa chọn này có thể đổi sau trong phần cài đặt.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }}>
        {opts.map((o) => {
          const isSel = o.id === selected;
          return (
            <div
              key={o.id}
              style={{
                position: 'relative',
                padding: '22px 18px',
                borderRadius: 14,
                border: isSel ? `2px solid ${DB.green}` : `1.5px solid ${DB.border}`,
                background: isSel ? DB.green50 : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background .15s, border-color .15s, box-shadow .15s',
                boxShadow: isSel ? '0 8px 20px -8px rgba(5,150,105,.35)' : 'none',
              }}
            >
              {isSel && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 22, height: 22, borderRadius: '50%',
                  background: DB.green, display: 'grid', placeItems: 'center',
                  boxShadow: '0 2px 6px rgba(5,150,105,.4)',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              )}
              <div style={{
                fontSize: 30, letterSpacing: '0.04em', lineHeight: 1.2,
                marginBottom: 12,
                display: 'flex', justifyContent: 'center', gap: 4,
                filter: isSel ? 'none' : 'grayscale(.25)',
              }}>
                {o.icons.map((i, k) => <span key={k}>{i}</span>)}
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: DB.ink }}>{o.title}</div>
              <div style={{ fontSize: 12.5, color: DB.textMid, marginTop: 5 }}>{o.desc}</div>
              <div style={{
                marginTop: 12,
                display: 'inline-flex', padding: '3px 10px',
                background: isSel ? '#fff' : DB.borderSoft,
                color: isSel ? DB.greenDark : DB.textMute,
                fontSize: 11, fontWeight: 600,
                borderRadius: 999,
                boxShadow: isSel ? `inset 0 0 0 1px ${DB.green200 || '#bbf7d0'}` : 'none',
              }}>
                {o.tag}
              </div>
            </div>
          );
        })}
      </div>

      <WizardFooter
        right={<BtnPrimary>Tiếp tục →</BtnPrimary>}
        mobile={mobile}
      />
    </>
  );
}

// =========================================================================
// STEP 2 — per-meal configuration (dropdown + steppers)
// =========================================================================
function WizardStep2({ mobile = false }) {
  const meals = [
    { name: 'Bữa Sáng', icon: '☀️', mode: 'COMBO',   nMain: 0, nRau: 0, nCarb: 0 },
    { name: 'Bữa Trưa', icon: '🍽',  mode: 'NHIEU',   nMain: 1, nRau: 1, nCarb: 1 },
    { name: 'Bữa Tối',  icon: '🌙',  mode: 'NHIEU',   nMain: 1, nRau: 1, nCarb: 1 },
  ];
  return (
    <>
      <h2 style={{ margin: 0, fontSize: mobile ? 20 : 23, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>
        Cấu hình từng bữa
      </h2>
      <p style={{ margin: '6px 0 18px', fontSize: 13.5, color: DB.textMid, lineHeight: 1.55 }}>
        Mỗi bữa có thể chọn kiểu <b>1 món combo</b> (như phở, bún) hoặc <b>nhiều món riêng</b>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {meals.map((m, i) => <MealConfigRow key={i} meal={m} />)}
      </div>

      <WizardFooter
        left={<BtnOutline>← Quay lại</BtnOutline>}
        right={<BtnPrimary>Tiếp tục →</BtnPrimary>}
        mobile={mobile}
      />
    </>
  );
}

function MealConfigRow({ meal }) {
  const isMulti = meal.mode === 'NHIEU';
  return (
    <div style={{
      border: `1px solid ${DB.border}`,
      borderRadius: 12,
      padding: '14px 16px',
      background: '#fafafa',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: '#fff', border: `1px solid ${DB.border}`,
            display: 'grid', placeItems: 'center', fontSize: 18,
          }}>{meal.icon}</div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: DB.ink }}>{meal.name}</div>
        </div>

        <Dropdown
          value={meal.mode === 'COMBO' ? '1 món combo (phở, bún…)' : 'Nhiều món riêng'}
        />
      </div>

      {isMulti && (
        <div style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          paddingTop: 12,
          borderTop: `1px solid ${DB.borderSoft}`,
        }}>
          <Stepper label="Món chính" min={1} max={3} value={meal.nMain} />
          <Stepper label="Món rau"   min={0} max={2} value={meal.nRau} />
          <Stepper label="Tinh bột"  min={0} max={1} value={meal.nCarb} />
        </div>
      )}
    </div>
  );
}

function Dropdown({ value }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 12px',
      background: '#fff',
      border: `1px solid ${DB.border}`,
      borderRadius: 9,
      fontSize: 13, fontWeight: 600, color: DB.text,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>
      {value}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function Stepper({ label, min, max, value }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${DB.border}`, borderRadius: 10, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <StepperBtn disabled={value <= min}>−</StepperBtn>
        <span style={{ fontSize: 18, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums', minWidth: 24, textAlign: 'center' }}>
          {value}
        </span>
        <StepperBtn disabled={value >= max}>+</StepperBtn>
      </div>
      <div style={{ fontSize: 10.5, color: DB.textFaint, marginTop: 2, textAlign: 'center' }}>
        {min}–{max}
      </div>
    </div>
  );
}

function StepperBtn({ children, disabled }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: 26, height: 26, borderRadius: 7,
        border: `1px solid ${disabled ? DB.borderSoft : DB.border}`,
        background: disabled ? '#fafafa' : '#fff',
        color: disabled ? DB.textFaint : DB.text,
        fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'grid', placeItems: 'center',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

// =========================================================================
// STEP 3 — confirmation summary
// =========================================================================
function WizardStep3({ mobile = false }) {
  return (
    <>
      <h2 style={{ margin: 0, fontSize: mobile ? 20 : 23, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>
        Xác nhận lựa chọn
      </h2>
      <p style={{ margin: '6px 0 20px', fontSize: 13.5, color: DB.textMid, lineHeight: 1.55 }}>
        Xem qua lại lựa chọn — bạn có thể đổi sau trong cài đặt.
      </p>

      {/* Summary card */}
      <div style={{
        border: `1px solid ${DB.border}`,
        borderRadius: 14,
        padding: 18,
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <SummaryRow
          icon="🍽"
          label="Kế hoạch"
          value="3 bữa truyền thống"
          hint="Sáng – Trưa – Tối"
        />
        <Divider />
        <SummaryRow
          icon="☀️"
          label="Bữa Sáng"
          value="1 món combo"
          hint="vd: phở, bún, xôi"
        />
        <Divider />
        <SummaryRow
          icon="🍽"
          label="Bữa Trưa"
          value="Nhiều món riêng"
          hint="1 món chính · 1 rau · 1 tinh bột"
        />
        <Divider />
        <SummaryRow
          icon="🌙"
          label="Bữa Tối"
          value="Nhiều món riêng"
          hint="1 món chính · 1 rau · 1 tinh bột"
        />
      </div>

      {/* Note */}
      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        background: DB.green50, borderLeft: `3px solid ${DB.green}`,
        borderRadius: '0 8px 8px 0',
        fontSize: 12.5, color: DB.greenDark, lineHeight: 1.5,
      }}>
        💡 Chúng tôi sẽ tính TDEE = <b>2100 kcal/ngày</b> dựa trên thông tin sức khỏe của bạn, chia theo tỉ lệ 25% / 40% / 35%.
      </div>

      <WizardFooter
        left={<BtnOutline>← Quay lại</BtnOutline>}
        right={
          <BtnPrimary style={{ padding: '12px 22px', fontSize: 14.5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3" />
            </svg>
            Bắt đầu đề xuất →
          </BtnPrimary>
        }
        mobile={mobile}
      />
    </>
  );
}

function SummaryRow({ icon, label, value, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: '#fff', border: `1px solid ${DB.border}`,
        display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: DB.textMute, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: DB.ink, marginTop: 2 }}>{value}</div>
        <div style={{ fontSize: 12, color: DB.textFaint, marginTop: 2 }}>{hint}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DB.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: DB.borderSoft }} />;
}

// =========================================================================
// FOOTER (back + continue buttons)
// =========================================================================
function WizardFooter({ left, right, mobile = false }) {
  return (
    <div style={{
      marginTop: 22,
      paddingTop: 18,
      borderTop: `1px solid ${DB.borderSoft}`,
      display: 'flex',
      justifyContent: left ? 'space-between' : 'flex-end',
      alignItems: 'center',
      flexDirection: mobile ? 'column-reverse' : 'row',
      gap: mobile ? 10 : 12,
    }}>
      {left && <div style={{ width: mobile ? '100%' : 'auto' }}>{left}</div>}
      <div style={{ width: mobile ? '100%' : 'auto', display: 'flex', justifyContent: mobile ? 'center' : 'flex-end' }}>
        {right}
      </div>
    </div>
  );
}

// =========================================================================
// SCENE WRAPPERS — for canvas artboards
// =========================================================================
function WizardSceneDesktop({ step = 0 }) {
  const StepComp = [WizardStep1, WizardStep2, WizardStep3][step];
  return (
    <WizardModalShell>
      <WizardCard step={step}>
        <StepComp />
      </WizardCard>
    </WizardModalShell>
  );
}

function WizardSceneMobile({ step = 0 }) {
  const StepComp = [WizardStep1, WizardStep2, WizardStep3][step];
  return (
    <WizardModalShell mobile>
      <WizardCard step={step} mobile>
        <StepComp mobile />
      </WizardCard>
    </WizardModalShell>
  );
}

Object.assign(window, {
  WizardSceneDesktop, WizardSceneMobile,
  WizardStep1, WizardStep2, WizardStep3,
  ProgressDots,
});
