// Nutrition Plan — Day selector [Hôm nay] · [Ngày mai]
// Inline-style match of the [Ngày · Tuần · Tháng] segmented control used in
// Nhật ký bữa ăn (doc/RangeSegmentedControl.tsx). Uses DB tokens for parity.

// =========================================================================
// SEG BUTTON — one segment, with inline hover state
// =========================================================================
function SegButton({ active, children, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minWidth: 92,
        padding: '7px 18px',
        borderRadius: 9,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13.5,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        transition: 'background .15s ease, color .15s ease',
        background: active ? DB.green : 'transparent',
        color: active ? '#fff' : hover ? DB.text : DB.textMute,
        boxShadow: active ? '0 1px 2px rgba(5,150,105,.3)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// =========================================================================
// DAY SELECTOR — segmented control [Hôm nay] · [Ngày mai]
// =========================================================================
function DaySelector({ value = 'today', onChange = () => {}, full = false }) {
  const opts = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'tomorrow', label: 'Ngày mai' },
  ];
  return (
    <div
      role="tablist"
      aria-label="Chọn ngày thực đơn"
      style={{
        display: full ? 'flex' : 'inline-flex',
        width: full ? '100%' : 'auto',
        padding: 4,
        gap: 2,
        borderRadius: 12,
        border: `1px solid ${DB.border}`,
        background: DB.bg,
      }}
    >
      {opts.map((o) => (
        <div key={o.key} style={{ flex: full ? 1 : '0 0 auto', display: 'flex' }}>
          <SegButton active={value === o.key} onClick={() => onChange(o.key)}>
            <span style={{ width: '100%' }}>{o.label}</span>
          </SegButton>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// "Ngày mai" indicator chip — sits next to the page title
// =========================================================================
function TomorrowChip({ small = false }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: small ? '3px 9px' : '4px 11px',
        borderRadius: 999,
        background: DB.green50,
        color: DB.greenDark,
        fontSize: small ? 11.5 : 12.5,
        fontWeight: 600,
        boxShadow: 'inset 0 0 0 1px #bbf7d0',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Ngày mai
    </span>
  );
}

// =========================================================================
// DAY DATA — today / tomorrow header copy + plan data
// Tomorrow: nothing eaten yet → all meals are "Đề xuất"; different dishes.
// =========================================================================
const DAY_INFO = {
  today: {
    title: 'Thực đơn hôm nay',
    weekday: 'Thứ tư',
    dateLong: '27 tháng 05, 2026',
    dateShort: '27/05/2026',
    subNote: null,
  },
  tomorrow: {
    title: 'Thực đơn ngày mai',
    weekday: 'Thứ năm',
    dateLong: '28 tháng 05, 2026',
    dateShort: '28/05/2026',
    subNote: 'Đề xuất chuẩn bị trước — chưa có bữa nào được ghi nhận',
  },
};

// =========================================================================
// SHOWCASE — isolated control, both states, interactive
// =========================================================================
function DaySelectorShowcase() {
  const [a, setA] = React.useState('today');
  const [b, setB] = React.useState('tomorrow');
  return (
    <div style={{ ...dbFont, background: '#fff', width: '100%', height: '100%', padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Mặc định — đang chọn “Hôm nay”
        </div>
        <DaySelector value={a} onChange={setA} />
      </div>
      <div style={{ height: 1, background: DB.borderSoft }} />
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Đang chọn “Ngày mai”
        </div>
        <DaySelector value={b} onChange={setB} />
      </div>
      <div style={{ height: 1, background: DB.borderSoft }} />
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Mobile — full-width
        </div>
        <div style={{ maxWidth: 320 }}>
          <DaySelector value="today" onChange={() => {}} full />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DaySelector, SegButton, TomorrowChip, DAY_INFO, DaySelectorShowcase });
