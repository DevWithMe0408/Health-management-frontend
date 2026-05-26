// Steps 4-5: Activity level, Measurements + Review, Loading

// =========================================================================
// STEP 4 — ACTIVITY LEVEL
// =========================================================================
function Step4Activity({ mobile = false, selected = 'NHE' }) {
  const levels = [
    { id: 'IT', emoji: '🪑', title: 'Ít vận động', factor: '1.2', desc: 'Làm văn phòng cả ngày, hầu như không tập' },
    { id: 'NHE', emoji: '🚶', title: 'Vận động nhẹ', factor: '1.375', desc: 'Đi bộ thường xuyên, tập 1-3 buổi/tuần' },
    { id: 'VUA', emoji: '🏃', title: 'Vận động vừa', factor: '1.55', desc: 'Tập đều 3-5 buổi/tuần' },
    { id: 'NHIEU', emoji: '💪', title: 'Vận động nhiều', factor: '1.725', desc: 'Tập 6-7 buổi/tuần' },
    { id: 'RAT_NHIEU', emoji: '🏋️', title: 'Rất vận động', factor: '1.9', desc: 'Lao động chân tay nặng + tập gym' },
  ];

  return (
    <div style={pageBg}>
      <BackgroundDecor variant="left" />
      {!mobile && <TopBar />}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: mobile ? '24px 16px' : '88px 32px 32px',
        }}
      >
        {mobile && (
          <div style={{ position: 'absolute', top: 20, left: 20 }}>
            <Logo />
          </div>
        )}
        <WizardCard style={mobile ? { padding: '24px 20px', maxWidth: '100%', marginTop: 60 } : null}>
          <Progress current={3} />

          <h2 style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Mức độ vận động hằng ngày?
          </h2>
          <p style={{ fontSize: 15, color: BRAND.textMid, margin: '0 0 24px', lineHeight: 1.55 }}>
            Chọn mức gần nhất với lối sống của bạn. Chúng tôi dùng cái này để tính nhu cầu calo.
          </p>

          {/* Top row: height + weight */}
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <MetricInput label="Chiều cao" unit="cm" value="168" />
            <MetricInput label="Cân nặng" unit="kg" value="58.5" />
          </div>

          {/* Activity cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {levels.map((lv) => {
              const isSel = lv.id === selected;
              return (
                <div
                  key={lv.id}
                  style={{
                    background: isSel ? BRAND.greenLight : '#fff',
                    border: isSel ? `2px solid ${BRAND.green}` : `1.5px solid ${BRAND.border}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: isSel ? '0 6px 16px -8px rgba(5, 150, 105, 0.3)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: isSel ? '#fff' : BRAND.greenLight,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {lv.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: BRAND.ink, marginBottom: 2 }}>
                      {lv.title}
                    </div>
                    <div style={{ fontSize: 13, color: BRAND.textMute, lineHeight: 1.4 }}>
                      {lv.desc}
                    </div>
                  </div>
                  {isSel ? (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: BRAND.green,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `2px solid ${BRAND.border}`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <NavRow />
        </WizardCard>
      </div>
    </div>
  );
}

function MetricInput({ label, unit, value }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13.5, fontWeight: 500, color: BRAND.text, marginBottom: 7 }}>
        {label} <span style={{ color: BRAND.green }}>*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          defaultValue={value}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px 50px 11px 14px',
            fontSize: 16,
            fontWeight: 600,
            border: `1.5px solid ${BRAND.border}`,
            borderRadius: 10,
            fontFamily: 'inherit',
            color: BRAND.ink,
            outline: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13,
            color: BRAND.textMute,
            fontWeight: 500,
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// STEP 5 — MEASUREMENTS + REVIEW + LOADING
// =========================================================================
function Step5Review({ loading = false }) {
  return (
    <div style={pageBg}>
      <BackgroundDecor variant="right" />
      <TopBar />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px 32px 32px',
        }}
      >
        <WizardCard>
          <Progress current={4} />

          <h2 style={{ fontSize: 26, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Hoàn thiện hồ sơ
          </h2>
          <p style={{ fontSize: 15, color: BRAND.textMid, margin: '0 0 22px', lineHeight: 1.55 }}>
            Số đo nâng cao (tùy chọn) và xem lại toàn bộ thông tin trước khi tạo thực đơn.
          </p>

          {/* Banner */}
          <div
            style={{
              background: BRAND.greenLight,
              border: `1px solid ${BRAND.greenTint}`,
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>💡</div>
            <div style={{ fontSize: 13.5, color: BRAND.greenDarker, lineHeight: 1.5 }}>
              Có các số đo này, hệ thống sẽ tính được <b>% mỡ cơ thể</b> chính xác hơn. Nếu chưa
              có thước dây, bạn có thể bỏ qua và cập nhật sau.
            </div>
          </div>

          {/* Section: measurements */}
          <Section title="Số đo cơ thể" collapsible>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <CircumInput label="Vòng eo" tipPos="quanh rốn" value="68" />
              <CircumInput label="Vòng hông" tipPos="phần rộng nhất hông" value="92" />
              <CircumInput label="Vòng cổ" tipPos="dưới yết hầu" value="32" />
              <CircumInput label="Vòng ngực" tipPos="ngang núm" value="84" />
            </div>
            <button
              style={{
                marginTop: 12,
                background: 'transparent',
                border: 'none',
                color: BRAND.green,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '6px 0',
                fontFamily: 'inherit',
              }}
            >
              Tôi sẽ cập nhật sau →
            </button>
          </Section>

          {/* Section: review */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.ink, marginBottom: 10 }}>
              Tóm tắt thông tin
            </div>
            <div
              style={{
                background: '#fafbfa',
                border: `1px solid ${BRAND.borderSoft}`,
                borderRadius: 12,
                padding: '4px 14px',
              }}
            >
              <ReviewRow icon="🎯" label="Mục tiêu" value="Giảm cân" />
              <ReviewRow icon="👤" label="Họ và tên" value="Nguyễn Minh Anh" />
              <ReviewRow icon="🎂" label="Tuổi" value="23 tuổi · Nữ" />
              <ReviewRow icon="📏" label="Chiều cao · Cân nặng" value="168 cm · 58.5 kg" />
              <ReviewRow icon="🚶" label="Mức vận động" value="Vận động nhẹ" last />
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: `1px solid ${BRAND.borderSoft}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: BRAND.textMid,
                fontSize: 14.5,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quay lại
            </button>
            <button
              style={{
                background: loading
                  ? BRAND.greenDark
                  : `linear-gradient(135deg, ${BRAND.green} 0%, #10b981 100%)`,
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 22px -8px rgba(5, 150, 105, 0.55)',
                fontFamily: 'inherit',
                flex: 1,
                justifyContent: 'center',
                maxWidth: 340,
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Đang phân tích thể trạng của bạn...
                </>
              ) : (
                <>
                  Hoàn tất
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </WizardCard>
      </div>
    </div>
  );
}

function Section({ title, collapsible, children }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.ink }}>{title}</div>
        {collapsible && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: BRAND.textMute }}>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
}

function CircumInput({ label, tipPos, value }) {
  return (
    <div>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: BRAND.text,
          marginBottom: 6,
        }}
      >
        {label}
        <HelpIcon tip={`Đo ${tipPos}`} />
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          defaultValue={value}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 40px 10px 12px',
            fontSize: 14.5,
            fontWeight: 600,
            border: `1.5px solid ${BRAND.border}`,
            borderRadius: 9,
            fontFamily: 'inherit',
            color: BRAND.ink,
            outline: 'none',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            color: BRAND.textMute,
            fontWeight: 500,
          }}
        >
          cm
        </span>
      </div>
    </div>
  );
}

function ReviewRow({ icon, label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '11px 0',
        gap: 12,
        borderBottom: last ? 'none' : `1px solid ${BRAND.borderSoft}`,
      }}
    >
      <div style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13.5, color: BRAND.textMute }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.ink }}>{value}</div>
      <button
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 6,
          color: BRAND.textMute,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'wizSpin 0.9s linear infinite' }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

Object.assign(window, { Step4Activity, Step5Review });
