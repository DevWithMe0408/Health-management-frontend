// Dashboard shell — sidebar, header, page chrome, atoms
// Brand tokens mirror tailwind.config.ts: brand-green=#059669, brand-gray-*

const DB = {
  green: '#059669',
  greenHover: '#047857',
  greenDark: '#065f46',
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber300: '#fcd34d',
  amber500: '#f59e0b',
  amber700: '#b45309',
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue300: '#93c5fd',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  orange50: '#fff7ed',
  orange600: '#ea580c',
  orange700: '#c2410c',
  red50: '#fef2f2',
  red100: '#fee2e2',
  red600: '#dc2626',
  red700: '#b91c1c',
  ink: '#111827',
  text: '#1f2937',
  textMid: '#4b5563',
  textMute: '#6b7280',
  textFaint: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: '#f3f4f6',
  bg: '#f9fafb',
  white: '#ffffff',
};

const dbFont = {
  fontFamily:
    '"Be Vietnam Pro", "Inter", system-ui, -apple-system, sans-serif',
  color: DB.text,
};

// =========================================================================
// Sidebar (matches src/components/layout/Sidebar.tsx — user-facing, not admin)
// =========================================================================
function Sidebar({ active = 'dashboard' }) {
  const items = [
    { id: 'dashboard', label: 'Thông số Sức khỏe', icon: <IconHome /> },
    { id: 'submit', label: 'Cập nhật Chỉ số', icon: <IconPencil /> },
    { id: 'nutrition', label: 'Đề xuất Thực đơn', icon: <IconBeaker /> },
    { id: 'notif', label: 'Thông báo', icon: <IconBell /> },
  ];
  return (
    <aside
      style={{
        width: 256,
        background: '#fff',
        borderRight: `1px solid ${DB.border}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '2px 0 8px -4px rgba(15,23,42,.04)',
        flexShrink: 0,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: DB.greenDark,
            letterSpacing: '-0.01em',
          }}
        >
          HealthCare
        </span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <div
              key={it.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : DB.text,
                background: isActive ? DB.green : 'transparent',
                boxShadow: isActive ? '0 4px 10px -3px rgba(5,150,105,.4)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: isActive ? '#fff' : DB.textMid, display: 'flex' }}>
                {it.icon}
              </span>
              {it.label}
            </div>
          );
        })}
      </nav>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: 14.5,
          color: DB.textMid,
          cursor: 'pointer',
        }}
      >
        <IconLogout />
        Đăng xuất
      </div>
    </aside>
  );
}

// =========================================================================
// Top header bar (matches src/components/layout/Header.tsx style)
// =========================================================================
function TopHeader({ userName = 'Chiến' }) {
  return (
    <header
      style={{
        height: 64,
        background: '#fff',
        borderBottom: `1px solid ${DB.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            padding: 8,
            borderRadius: 8,
            color: DB.textMid,
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
          }}
        >
          <IconBell />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              background: DB.red600,
              borderRadius: '50%',
            }}
          />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px 6px 6px',
            borderRadius: 999,
            background: DB.borderSoft,
          }}
        >
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
          <span style={{ fontSize: 13.5, fontWeight: 500, color: DB.text }}>{userName}</span>
        </div>
      </div>
    </header>
  );
}

// =========================================================================
// Greeting hero + current goal pill
// =========================================================================
function GreetingHero({ userName = 'Chiến', goal = 'GIAM' }) {
  const goalLabel = { GIAM: 'GIẢM CÂN', DUY_TRI: 'DUY TRÌ', TANG: 'TĂNG CÂN' }[goal];
  const goalIcon = { GIAM: '📉', DUY_TRI: '⚖️', TANG: '📈' }[goal];
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${DB.green50} 0%, #ecfdf5 60%, #ffffff 100%)`,
        border: `1px solid ${DB.green200}`,
        borderRadius: 20,
        padding: '22px 28px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: DB.ink,
            letterSpacing: '-0.02em',
          }}
        >
          Xin chào, {userName}! 👋
        </h1>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14.5,
            color: DB.textMid,
          }}
        >
          <span>{goalIcon}</span>
          Đang theo mục tiêu:
          <span
            style={{
              fontWeight: 700,
              color: DB.greenDark,
              letterSpacing: '0.02em',
            }}
          >
            {goalLabel}
          </span>
        </div>
      </div>
      <button
        style={{
          background: '#fff',
          border: `1.5px solid ${DB.green200}`,
          color: DB.greenDark,
          padding: '10px 18px',
          borderRadius: 10,
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        Đổi mục tiêu
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// =========================================================================
// Card wrapper used by every widget
// =========================================================================
function Card({ children, title, subtitle, info, action, padding = 24, style }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${DB.border}`,
        borderRadius: 16,
        padding,
        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)',
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 18,
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: DB.textMute,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {title}
                {info && <InfoIcon tip={info} />}
              </h3>
            )}
            {subtitle && (
              <div style={{ fontSize: 12.5, color: DB.textMute, marginTop: 4 }}>{subtitle}</div>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoIcon({ tip }) {
  return (
    <span
      title={tip}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: DB.borderSoft,
        color: DB.textMute,
        fontSize: 9,
        fontWeight: 700,
        cursor: 'help',
        textTransform: 'none',
      }}
    >
      i
    </span>
  );
}

// =========================================================================
// Icons
// =========================================================================
function Sv({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
function IconHome() { return <Sv><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z" /></Sv>; }
function IconPencil() { return <Sv><path d="M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" /></Sv>; }
function IconBeaker() { return <Sv><path d="M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3" /></Sv>; }
function IconBell() { return <Sv><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0" /></Sv>; }
function IconLogout() { return <Sv><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Sv>; }

Object.assign(window, {
  DB, dbFont, Sidebar, TopHeader, GreetingHero, Card, InfoIcon,
});
