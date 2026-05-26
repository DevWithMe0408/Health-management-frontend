// Full-page Dashboard layouts (Desktop + Mobile) + the canvas wrapper

// =========================================================================
// PAGE FRAME — wraps with sidebar + header
// =========================================================================
function PageFrame({ children, mobile = false, userName = 'Chiến' }) {
  if (mobile) {
    return (
      <div
        style={{
          ...dbFont,
          background: DB.bg,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Mobile top bar */}
        <header
          style={{
            background: '#fff',
            borderBottom: `1px solid ${DB.border}`,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <button
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              color: DB.text,
              display: 'flex',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: DB.greenDark }}>HealthCare</span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${DB.green}, #10b981)`,
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {userName[0]}
          </div>
        </header>
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            background: DB.bg,
          }}
        >
          {children}
        </main>
        {/* Mobile bottom nav */}
        <nav
          style={{
            background: '#fff',
            borderTop: `1px solid ${DB.border}`,
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-around',
            flexShrink: 0,
          }}
        >
          {[
            { icon: <IconHome />, label: 'Tổng quan', active: true },
            { icon: <IconPencil />, label: 'Cập nhật' },
            { icon: <IconBeaker />, label: 'Thực đơn' },
            { icon: <IconBell />, label: 'Thông báo' },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 10px',
                color: it.active ? DB.green : DB.textMute,
                fontWeight: it.active ? 600 : 500,
                fontSize: 10.5,
              }}
            >
              {it.icon}
              {it.label}
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div
      style={{
        ...dbFont,
        background: DB.bg,
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <Sidebar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader userName={userName} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 40px',
            background: DB.bg,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Local re-imports of icons used by mobile bottom nav (defined in shared)
function IconHome() { return <SvLocal><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z" /></SvLocal>; }
function IconPencil() { return <SvLocal><path d="M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" /></SvLocal>; }
function IconBeaker() { return <SvLocal><path d="M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3" /></SvLocal>; }
function IconBell() { return <SvLocal><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0" /></SvLocal>; }
function SvLocal({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// =========================================================================
// FULL DASHBOARD — desktop default
// =========================================================================
function DashboardDesktop({ scenario = 'normal' }) {
  return (
    <PageFrame>
      <GreetingHero userName="Chiến" goal="GIAM" />

      {/* Row 1: Constitution + Notifications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <W1Constitution
          state="normal"
          constitution="CAN_DOI"
          bmi={22.1}
          pbf={15.4}
          updatedDaysAgo={2}
        />
        <W3Notifications />
      </div>

      {/* Row 2: Weight chart full */}
      <div style={{ marginBottom: 20 }}>
        <W2WeightChart />
      </div>

      {/* Row 3: Compliance + Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <W2Compliance />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <W2Metrics />
        </div>
      </div>

      {/* Row 4: Medical detail collapsed */}
      <MedicalDetailSection open={false} />
    </PageFrame>
  );
}

// =========================================================================
// MOBILE DASHBOARD
// =========================================================================
function DashboardMobile() {
  return (
    <PageFrame mobile>
      <GreetingHero userName="Chiến" goal="GIAM" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <W1Constitution
          state="normal"
          constitution="CAN_DOI"
          bmi={22.1}
          pbf={15.4}
          updatedDaysAgo={2}
        />
        <W3Notifications />
        <W2WeightChart height={180} />
        <W2Compliance />
        <W2Metrics />
        <MedicalDetailSection open={false} />
      </div>
    </PageFrame>
  );
}

Object.assign(window, { PageFrame, DashboardDesktop, DashboardMobile });
