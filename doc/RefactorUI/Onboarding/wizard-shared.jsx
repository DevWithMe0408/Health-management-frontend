// Shared atoms for the Onboarding Wizard artboards
// All artboards share these so visual language stays consistent

const BRAND = {
  green: '#059669',
  greenDark: '#047857',
  greenDarker: '#065f46',
  greenLight: '#ecfdf5',
  greenLighter: '#f0fdf4',
  greenTint: '#d1fae5',
  ink: '#0f1f1a',
  text: '#1f2937',
  textMid: '#4b5563',
  textMute: '#6b7280',
  border: '#e5e7eb',
  borderSoft: '#f1f5f4',
  bg: '#ffffff',
  rose: '#dc2626',
  roseLight: '#fef2f2',
};

// Page background — soft top→bottom wash white to a hint of green
const pageBg = {
  background:
    'linear-gradient(180deg, #ffffff 0%, #ffffff 35%, #f6fdf9 70%, #ecfdf5 100%)',
  width: '100%',
  height: '100%',
  position: 'relative',
  fontFamily: '"Be Vietnam Pro", system-ui, -apple-system, sans-serif',
  color: BRAND.text,
  overflow: 'hidden',
};

// Subtle organic blobs for depth — not loud
function BackgroundDecor({ variant = 'right' }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMaxYMin slice"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="blobA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blobB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {variant === 'right' && (
        <>
          <circle cx="1080" cy="120" r="280" fill="url(#blobA)" />
          <circle cx="1180" cy="640" r="220" fill="url(#blobB)" />
          <circle cx="60" cy="720" r="180" fill="url(#blobB)" />
        </>
      )}
      {variant === 'left' && (
        <>
          <circle cx="120" cy="160" r="260" fill="url(#blobA)" />
          <circle cx="-40" cy="620" r="200" fill="url(#blobB)" />
        </>
      )}
      {variant === 'center' && (
        <>
          <circle cx="600" cy="-40" r="320" fill="url(#blobA)" />
          <circle cx="120" cy="700" r="220" fill="url(#blobB)" />
          <circle cx="1080" cy="700" r="220" fill="url(#blobB)" />
        </>
      )}
    </svg>
  );
}

// Brand logo — small plus mark + wordmark
function Logo({ size = 'sm' }) {
  const isLg = size === 'lg';
  const iconSize = isLg ? 36 : 26;
  const fontSize = isLg ? 22 : 16;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${BRAND.green} 0%, #10b981 100%)`,
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.45)',
        }}
      >
        <svg width={iconSize * 0.55} height={iconSize * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4v16M4 12h16"
            stroke="white"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: BRAND.ink,
        }}
      >
        Health<span style={{ color: BRAND.green }}>Care</span>
      </span>
    </div>
  );
}

// Top bar with logo (used by all steps)
function TopBar({ rightSlot }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: 32,
        right: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5,
      }}
    >
      <Logo />
      {rightSlot}
    </div>
  );
}

// Progress strip — 4 nodes for Step 2..5 (labeled 1..4 to user)
function Progress({ current, label }) {
  // current is 1..4 (Step 2 = 1, Step 3 = 2, Step 4 = 3, Step 5 = 4)
  const labels = ['Mục tiêu', 'Cá nhân', 'Chỉ số', 'Số đo'];
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {[1, 2, 3, 4].map((n, i) => {
          const done = n < current;
          const active = n === current;
          return (
            <React.Fragment key={n}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: done ? BRAND.green : active ? '#fff' : '#fff',
                  border: active
                    ? `2px solid ${BRAND.green}`
                    : done
                    ? `2px solid ${BRAND.green}`
                    : `1.5px solid ${BRAND.border}`,
                  color: done ? '#fff' : active ? BRAND.green : '#9ca3af',
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'all .2s',
                  boxShadow: active ? `0 0 0 4px ${BRAND.greenLight}` : 'none',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  n
                )}
              </div>
              {i < 3 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: n < current ? BRAND.green : BRAND.border,
                    margin: '0 2px',
                    borderRadius: 2,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 13,
          color: BRAND.textMute,
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        Bước {current}/4 · {labels[current - 1]}
      </div>
    </div>
  );
}

// Bottom navigation row
function NavRow({ showBack = true, nextLabel = 'Tiếp theo', nextDisabled = false, nextIsPrimary = true }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
        paddingTop: 24,
        borderTop: `1px solid ${BRAND.borderSoft}`,
      }}
    >
      {showBack ? (
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
            padding: '8px 4px',
            fontFamily: 'inherit',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quay lại
        </button>
      ) : (
        <span />
      )}
      <button
        style={{
          background: nextDisabled
            ? '#e5e7eb'
            : `linear-gradient(135deg, ${BRAND.green} 0%, #10b981 100%)`,
          color: nextDisabled ? '#9ca3af' : '#fff',
          border: 'none',
          padding: '13px 28px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: nextDisabled
            ? 'none'
            : '0 6px 18px -6px rgba(5, 150, 105, 0.55), 0 2px 4px -1px rgba(5, 150, 105, 0.25)',
          fontFamily: 'inherit',
          transition: 'all .2s',
        }}
      >
        {nextLabel}
        {nextIsPrimary && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Card wrapper — the main 720px wizard card
function WizardCard({ children, maxWidth = 720, style }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 20,
        border: `1px solid ${BRAND.borderSoft}`,
        boxShadow:
          '0 1px 2px rgba(15, 31, 26, 0.04), 0 12px 32px -12px rgba(15, 31, 26, 0.12), 0 0 0 1px rgba(15, 31, 26, 0.02)',
        padding: '40px 48px 32px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Tooltip help icon
function HelpIcon({ tip }) {
  return (
    <span
      title={tip}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: BRAND.borderSoft,
        color: BRAND.textMute,
        fontSize: 10,
        fontWeight: 700,
        marginLeft: 6,
        cursor: 'help',
        verticalAlign: 'middle',
      }}
    >
      ?
    </span>
  );
}

Object.assign(window, {
  BRAND,
  pageBg,
  BackgroundDecor,
  Logo,
  TopBar,
  Progress,
  NavRow,
  WizardCard,
  HelpIcon,
});
