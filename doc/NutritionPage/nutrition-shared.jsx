// Shared atoms for Nutrition Plan page
// Reuses DB tokens + dbFont from dashboard-shared.jsx

// =========================================================================
// SCORE BADGE — used everywhere; 3 tiers
// =========================================================================
function ScoreBadge({ score = 87.5, size = 'md' }) {
  const tier = score >= 80
    ? { label: 'Rất tốt', bg: '#d1fae5', fg: '#065f46', ring: 'rgba(16,185,129,.18)' }
    : score >= 60
    ? { label: 'Khá', bg: '#fef3c7', fg: '#92400e', ring: 'rgba(245,158,11,.18)' }
    : { label: 'Cần cân nhắc', bg: '#fed7aa', fg: '#9a3412', ring: 'rgba(249,115,22,.2)' };
  const pad = size === 'sm' ? '3px 9px' : '5px 12px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: pad,
        borderRadius: 999,
        background: tier.bg,
        color: tier.fg,
        fontSize: fs,
        fontWeight: 600,
        boxShadow: `inset 0 0 0 1px ${tier.ring}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
      </svg>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(1)}</span>
      <span style={{ opacity: 0.55, fontWeight: 500 }}>·</span>
      <span>{tier.label}</span>
    </span>
  );
}

// =========================================================================
// STATUS PILL — bữa: Đề xuất / Đã ăn / Bỏ qua
// =========================================================================
function StatusPill({ status = 'suggested' }) {
  const map = {
    suggested: {
      label: 'Đề xuất',
      bg: DB.green50, fg: DB.greenDark, ring: '#bbf7d0',
      iconPath: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    },
    eaten: {
      label: 'Đã ăn',
      bg: '#d1fae5', fg: '#065f46', ring: '#a7f3d0',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    skipped: {
      label: 'Bỏ qua',
      bg: '#f3f4f6', fg: '#4b5563', ring: '#e5e7eb',
      iconPath: 'M13 5l7 7-7 7M5 5l7 7-7 7',
    },
  };
  const m = map[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 11px',
        borderRadius: 999,
        background: m.bg,
        color: m.fg,
        fontSize: 12.5,
        fontWeight: 600,
        boxShadow: `inset 0 0 0 1px ${m.ring}`,
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={m.iconPath} />
      </svg>
      {m.label}
    </span>
  );
}

// =========================================================================
// CHIPS — slot (Món chính/Rau/Tinh bột) + food group
// =========================================================================
function SlotChip({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 6,
        background: '#f3f4f6',
        color: DB.textMid,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}
function FoodGroupChip({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 6,
        background: '#ecfdf5',
        color: '#047857',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </span>
  );
}

// =========================================================================
// BUTTONS
// =========================================================================
function BtnPrimary({ children, size = 'md', style, ...rest }) {
  const pad = size === 'sm' ? '7px 14px' : '10px 18px';
  const fs = size === 'sm' ? 13 : 14;
  return (
    <button
      {...rest}
      style={{
        background: DB.green,
        color: '#fff',
        border: 'none',
        padding: pad,
        borderRadius: 10,
        fontSize: fs,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 1px 2px rgba(5,150,105,.25), 0 4px 10px -4px rgba(5,150,105,.4)',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
function BtnOutline({ children, size = 'md', style, ...rest }) {
  const pad = size === 'sm' ? '6px 12px' : '9px 16px';
  const fs = size === 'sm' ? 12.5 : 13.5;
  return (
    <button
      {...rest}
      style={{
        background: '#fff',
        color: DB.textMid,
        border: `1px solid ${DB.border}`,
        padding: pad,
        borderRadius: 10,
        fontSize: fs,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
function BtnGhost({ children, style, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        background: 'transparent',
        color: DB.textMute,
        border: 'none',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// =========================================================================
// FOOD THUMBNAIL — placeholder (subtle gradient + initial)
// =========================================================================
function FoodThumb({ name = '', size = 64, group = 'GIA_CAM' }) {
  // Pleasant earthy gradient per food group — placeholder until imageUrl wired.
  const palettes = {
    GIA_CAM:        ['#fde68a', '#f59e0b'], // gold (gia cầm)
    CA:             ['#bae6fd', '#0284c7'], // blue (cá)
    THIT_DO:        ['#fecaca', '#dc2626'], // red (thịt đỏ)
    RAU_LA:         ['#bbf7d0', '#059669'], // green (rau)
    TINH_BOT_GAO:   ['#fef3c7', '#d97706'], // wheat (tinh bột)
    COMBO:          ['#fed7aa', '#ea580c'], // orange (combo phở)
    HAI_SAN:        ['#c7d2fe', '#4f46e5'], // indigo (hải sản)
    TRUNG:          ['#fef9c3', '#ca8a04'], // pale yellow (trứng)
    SALAD:          ['#d9f99d', '#65a30d'], // lime (salad)
  };
  const [a, b] = palettes[group] || ['#e5e7eb', '#6b7280'];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: 'rgba(255,255,255,.92)',
        fontWeight: 700,
        fontSize: size * 0.3,
        letterSpacing: '0.04em',
        boxShadow: 'inset 0 -2px 6px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      title={name}
    >
      <span style={{ position: 'relative', zIndex: 1, textShadow: '0 1px 2px rgba(0,0,0,.2)' }}>
        {name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
      </span>
      {/* subtle dots texture so it doesn't read as a flat gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 25% 30%, rgba(255,255,255,.18) 1px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(255,255,255,.12) 1px, transparent 2px)',
          backgroundSize: '14px 14px, 18px 18px',
          opacity: 0.7,
        }}
      />
    </div>
  );
}

// =========================================================================
// HEART (favorite) icon
// =========================================================================
function HeartIcon({ filled = false, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : DB.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

// =========================================================================
// MACRO BAR — 4-column block at the bottom of each meal card
// =========================================================================
function macroDeviationColor(actual, target) {
  if (target === 0) return DB.green;
  const pct = Math.abs((actual - target) / target) * 100;
  if (pct <= 10) return '#10b981';   // ±10% green
  if (pct <= 20) return '#f59e0b';   // 10-20% amber
  return '#ef4444';                   // >20% red
}

function MacroCol({ label, value, target, unit = '' }) {
  const color = macroDeviationColor(value, target);
  const pct = Math.min(100, Math.max(0, (value / Math.max(target, 1)) * 100));
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'baseline', display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 12.5, color: DB.textMute, fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: DB.textFaint, marginTop: 2 }}>/ {target}{unit} target</div>
      <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function MacroBar({ kcal, kcalTarget, p, pTarget, f, fTarget, c, cTarget }) {
  return (
    <div style={{ display: 'flex', gap: 28, padding: '16px 20px', background: '#f9fafb', borderRadius: 12, border: `1px solid ${DB.borderSoft}` }}>
      <MacroCol label="Kcal"     value={kcal} target={kcalTarget} />
      <MacroCol label="Protein"  value={p}    target={pTarget}    unit="g" />
      <MacroCol label="Fat"      value={f}    target={fTarget}    unit="g" />
      <MacroCol label="Carb"     value={c}    target={cTarget}    unit="g" />
    </div>
  );
}

// =========================================================================
// MACRO RING — alternative variation (ring chart instead of bars)
// =========================================================================
function MacroRing({ label, value, target, unit = '', color = '#059669' }) {
  const pct = Math.min(100, (value / Math.max(target, 1)) * 100);
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const devColor = macroDeviationColor(value, target);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={devColor} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center', lineHeight: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
            <div style={{ fontSize: 9, color: DB.textMute, marginTop: 2 }}>{unit || 'kcal'}</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: DB.textMid, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{ fontSize: 10.5, color: DB.textFaint, marginTop: -4 }}>/ {target}{unit}</div>
    </div>
  );
}

function MacroRingRow({ kcal, kcalTarget, p, pTarget, f, fTarget, c, cTarget }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '16px 12px', background: '#f9fafb', borderRadius: 12, border: `1px solid ${DB.borderSoft}` }}>
      <MacroRing label="Kcal"    value={kcal} target={kcalTarget} />
      <MacroRing label="Protein" value={p}    target={pTarget}    unit="g" />
      <MacroRing label="Fat"     value={f}    target={fTarget}    unit="g" />
      <MacroRing label="Carb"    value={c}    target={cTarget}    unit="g" />
    </div>
  );
}

// =========================================================================
// Chevron toggle icon
// =========================================================================
function Chevron({ open = true, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

Object.assign(window, {
  ScoreBadge, StatusPill, SlotChip, FoodGroupChip,
  BtnPrimary, BtnOutline, BtnGhost,
  FoodThumb, HeartIcon, Chevron,
  MacroBar, MacroCol, MacroRingRow, MacroRing,
  macroDeviationColor,
});
