// Steps 1-3: Welcome, Goal, Personal Info

// =========================================================================
// STEP 1 — WELCOME
// =========================================================================
function Step1Welcome({ mobile = false }) {
  const valueCards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={BRAND.green} strokeWidth="1.75" />
          <circle cx="12" cy="12" r="5" stroke={BRAND.green} strokeWidth="1.75" />
          <circle cx="12" cy="12" r="1.5" fill={BRAND.green} />
        </svg>
      ),
      title: 'Cá nhân hóa theo thể trạng',
      desc: 'Thực đơn riêng cho chỉ số của bạn',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 14c0-3.866 3.134-7 7-7s7 3.134 7 7v3H5v-3z"
            stroke={BRAND.green}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M3 17h18M9 7V5M12 7V4M15 7V5" stroke={BRAND.green} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      ),
      title: 'Toàn bộ là món Việt quen thuộc',
      desc: 'Phở, cơm tấm, bún, gỏi — đủ vị',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c-1.5 3-4 4-4 7a4 4 0 008 0c0-3-2.5-4-4-7z"
            stroke={BRAND.green}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M8 17h8M9 20h6" stroke={BRAND.green} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      ),
      title: 'Đề xuất thông minh hằng ngày',
      desc: 'Mỗi ngày một bữa hợp lý, không lặp',
    },
  ];

  return (
    <div style={{ ...pageBg, padding: mobile ? '0' : '0' }}>
      <BackgroundDecor variant="center" />
      {!mobile && <TopBar />}

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: mobile ? '80px 20px 32px' : '88px 32px 32px',
        }}
      >
        {mobile && (
          <div style={{ marginBottom: 24 }}>
            <Logo size="lg" />
          </div>
        )}

        {/* Time pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: '#fff',
            border: `1px solid ${BRAND.greenTint}`,
            borderRadius: 999,
            fontSize: 12.5,
            color: BRAND.greenDarker,
            fontWeight: 500,
            marginBottom: 24,
            boxShadow: '0 2px 6px -2px rgba(5, 150, 105, 0.15)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          Mất khoảng 2 phút
        </div>

        <h1
          style={{
            fontSize: mobile ? 30 : 44,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: BRAND.ink,
            textAlign: 'center',
            margin: '0 0 18px',
            lineHeight: 1.1,
            maxWidth: 640,
          }}
        >
          Chào mừng bạn đến với{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${BRAND.green} 0%, #10b981 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HealthCare
          </span>
        </h1>

        <p
          style={{
            fontSize: mobile ? 15 : 17,
            color: BRAND.textMid,
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 0 36px',
            lineHeight: 1.55,
            textWrap: 'pretty',
          }}
        >
          Chúng tôi sẽ cá nhân hóa thực đơn Việt Nam hàng ngày dành riêng cho bạn,
          dựa trên thể trạng và mục tiêu sức khỏe. Tất cả những gì bạn cần làm là
          trả lời vài câu hỏi đơn giản.
        </p>

        {/* Value cards */}
        <div
          style={{
            display: mobile ? 'flex' : 'grid',
            flexDirection: 'column',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            width: '100%',
            maxWidth: 720,
            marginBottom: 36,
          }}
        >
          {valueCards.map((c, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: `1px solid ${BRAND.borderSoft}`,
                borderRadius: 14,
                padding: '18px 18px 16px',
                display: 'flex',
                flexDirection: mobile ? 'row' : 'column',
                gap: mobile ? 14 : 10,
                alignItems: mobile ? 'center' : 'flex-start',
                boxShadow: '0 1px 2px rgba(15,31,26,.03), 0 6px 18px -10px rgba(15,31,26,.08)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: BRAND.greenLight,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: BRAND.ink, marginBottom: 2 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 13, color: BRAND.textMute, lineHeight: 1.45 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            background: `linear-gradient(135deg, ${BRAND.green} 0%, #10b981 100%)`,
            color: '#fff',
            border: 'none',
            padding: mobile ? '16px 40px' : '17px 56px',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            boxShadow:
              '0 10px 28px -10px rgba(5, 150, 105, 0.65), 0 4px 8px -2px rgba(5, 150, 105, 0.3)',
            fontFamily: 'inherit',
            minWidth: mobile ? '100%' : 240,
            justifyContent: 'center',
          }}
        >
          Bắt đầu
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          style={{
            marginTop: 18,
            fontSize: 12.5,
            color: BRAND.textMute,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textAlign: 'center',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.75" />
          </svg>
          Thông tin của bạn được bảo mật. Bạn có thể cập nhật bất cứ lúc nào.
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// STEP 2 — GOAL
// =========================================================================
function Step2Goal({ mobile = false, selected = 'GIAM' }) {
  const goals = [
    {
      id: 'GIAM',
      title: 'Giảm cân',
      desc: 'Phù hợp khi bạn muốn xuống cân an toàn ~0.5kg/tuần',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M7 13l5-5 5 5" stroke={BRAND.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 12 11)" />
          <path d="M12 4v13" stroke={BRAND.green} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="19" r="2" fill={BRAND.green} />
        </svg>
      ),
    },
    {
      id: 'DUY_TRI',
      title: 'Duy trì cân nặng',
      desc: 'Giữ ổn định thể trạng và xây dựng thói quen ăn uống lành mạnh',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M4 12h16" stroke={BRAND.green} strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="6" cy="12" r="2" fill={BRAND.green} />
          <circle cx="18" cy="12" r="2" fill={BRAND.green} />
        </svg>
      ),
    },
    {
      id: 'TANG',
      title: 'Tăng cân',
      desc: 'Phù hợp khi bạn muốn tăng cân lành mạnh, ưu tiên cơ',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M7 11l5-5 5 5" stroke={BRAND.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 6v13" stroke={BRAND.green} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div style={pageBg}>
      <BackgroundDecor variant="right" />
      {!mobile && <TopBar />}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: mobile ? '24px 16px' : '88px 32px 32px',
        }}
      >
        {mobile && (
          <div style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
            <Logo />
          </div>
        )}
        <WizardCard style={mobile ? { padding: '24px 20px', maxWidth: '100%' } : null}>
          <Progress current={1} />

          <h2 style={{ fontSize: mobile ? 22 : 28, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Bạn muốn đạt mục tiêu gì?
          </h2>
          <p style={{ fontSize: 15, color: BRAND.textMid, margin: '0 0 28px', lineHeight: 1.55 }}>
            Chúng tôi sẽ tùy chỉnh thực đơn của bạn theo mục tiêu này. Bạn có thể đổi sau.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 14,
            }}
          >
            {goals.map((g) => {
              const isSel = g.id === selected;
              return (
                <div
                  key={g.id}
                  style={{
                    background: isSel ? BRAND.greenLight : '#fff',
                    border: isSel ? `2px solid ${BRAND.green}` : `1.5px solid ${BRAND.border}`,
                    borderRadius: 16,
                    padding: mobile ? '18px 16px' : '22px 18px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all .2s',
                    boxShadow: isSel ? '0 8px 20px -8px rgba(5, 150, 105, 0.25)' : 'none',
                    display: 'flex',
                    flexDirection: mobile ? 'row' : 'column',
                    alignItems: mobile ? 'center' : 'flex-start',
                    gap: mobile ? 14 : 14,
                  }}
                >
                  {isSel && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: BRAND.green,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: isSel ? '#fff' : BRAND.greenLight,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {g.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: BRAND.ink, marginBottom: 4 }}>
                      {g.title}
                    </div>
                    <div style={{ fontSize: 13, color: BRAND.textMute, lineHeight: 1.5 }}>
                      {g.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <NavRow showBack={false} nextDisabled={!selected} />
        </WizardCard>
      </div>
    </div>
  );
}

// =========================================================================
// STEP 3 — PERSONAL INFO (default + error variant)
// =========================================================================
function Step3Personal({ errorState = false, goalLabel = 'giảm cân hiệu quả', mobile = false }) {
  const nameError = errorState;
  return (
    <div style={pageBg}>
      <BackgroundDecor variant="right" />
      {!mobile && <TopBar />}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100%',
          display: 'flex',
          alignItems: mobile ? 'flex-start' : 'center',
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
          <Progress current={2} />

          <h2 style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, color: BRAND.ink, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Một chút về bạn
          </h2>
          <p style={{ fontSize: mobile ? 14 : 15, color: BRAND.textMid, margin: '0 0 24px', lineHeight: 1.55 }}>
            Để {goalLabel}, chúng tôi cần biết một vài thông tin cơ bản.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 14 : 18 }}>
            {/* Họ và tên */}
            <Field
              label="Họ và tên"
              required
              error={nameError ? 'Vui lòng nhập họ và tên' : null}
              span={2}
            >
              <input
                type="text"
                placeholder="Vd. Nguyễn Minh Anh"
                defaultValue={nameError ? '' : 'Nguyễn Minh Anh'}
                style={inputStyle(nameError)}
              />
            </Field>

            {/* Ngày sinh */}
            <Field label="Ngày sinh" required helper="Bạn 23 tuổi">
              <input
                type="text"
                defaultValue="15/03/2002"
                style={{ ...inputStyle(false), paddingRight: 40 }}
              />
              <CalendarIcon />
            </Field>

            {/* Giới tính */}
            <Field
              label="Giới tính"
              required
              tooltip="Giới tính dùng để tính chính xác nhu cầu calo cơ bản (BMR) theo công thức Mifflin-St Jeor"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  background: '#f9fafb',
                  border: `1.5px solid ${BRAND.border}`,
                  borderRadius: 10,
                  padding: 3,
                  gap: 2,
                }}
              >
                {['Nam', 'Nữ', 'Khác'].map((g, i) => (
                  <button
                    key={g}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 7,
                      border: 'none',
                      background: i === 1 ? '#fff' : 'transparent',
                      color: i === 1 ? BRAND.ink : BRAND.textMute,
                      fontWeight: i === 1 ? 600 : 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: i === 1 ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Số điện thoại"
              optional
              tooltip="Dùng để gửi nhắc nhở bữa ăn (tùy chọn — bạn có thể bỏ qua)"
              span={2}
            >
              <input
                type="text"
                placeholder="0xxx xxx xxx"
                defaultValue="0912 345 678"
                style={inputStyle(false)}
              />
            </Field>
          </div>

          <NavRow nextDisabled={errorState} />
        </WizardCard>
      </div>
    </div>
  );
}

function Field({ label, required, optional, helper, error, tooltip, children, span = 1 }) {
  return (
    <div style={{ gridColumn: span === 2 ? '1 / -1' : undefined, position: 'relative' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 13.5,
          fontWeight: 500,
          color: BRAND.text,
          marginBottom: 7,
        }}
      >
        {label}
        {required && <span style={{ color: BRAND.green, marginLeft: 3 }}>*</span>}
        {optional && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 11.5,
              color: BRAND.textMute,
              fontWeight: 500,
              background: BRAND.borderSoft,
              padding: '1px 7px',
              borderRadius: 4,
            }}
          >
            tùy chọn
          </span>
        )}
        {tooltip && <HelpIcon tip={tooltip} />}
      </label>
      <div style={{ position: 'relative' }}>{children}</div>
      {error && (
        <div
          style={{
            fontSize: 12.5,
            color: BRAND.rose,
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}
      {helper && !error && (
        <div style={{ fontSize: 12.5, color: BRAND.greenDark, marginTop: 6, fontWeight: 500 }}>
          ✓ {helper}
        </div>
      )}
    </div>
  );
}

function inputStyle(error) {
  return {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    fontSize: 14.5,
    border: `1.5px solid ${error ? BRAND.rose : BRAND.border}`,
    background: error ? BRAND.roseLight : '#fff',
    borderRadius: 10,
    fontFamily: 'inherit',
    color: BRAND.ink,
    outline: 'none',
  };
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <rect x="4" y="6" width="16" height="14" rx="2" stroke={BRAND.textMute} strokeWidth="1.75" />
      <path d="M4 10h16M8 4v4M16 4v4" stroke={BRAND.textMute} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

Object.assign(window, { Step1Welcome, Step2Goal, Step3Personal });
