// Nutrition Plan — Info Strip + Footer Summary (top + bottom of page)

// =========================================================================
// INFO STRIP — compact ~48px row with goal · TDEE · constitution + actions
// =========================================================================
function InfoStrip({
  goal = 'Giảm cân',
  tdee = 2100,
  constitution = 'Cân đối',
  date = '27/05/2026',
  onChangeGoal,
  onRegen,
  mobile = false,
}) {
  return (
    <div
      style={{
        background: DB.green50,
        borderLeft: `4px solid ${DB.green}`,
        borderRadius: '0 12px 12px 0',
        padding: mobile ? '12px 14px' : '12px 20px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: 8,
        columnGap: mobile ? 10 : 14,
        marginBottom: mobile ? 16 : 20,
        boxShadow: '0 1px 2px rgba(5,150,105,.05)',
      }}
    >
      {/* Goal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: DB.greenDark }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span style={{ color: DB.textMute }}>Mục tiêu:</span>
        <span style={{ fontWeight: 700, color: DB.greenDark }}>{goal}</span>
      </div>

      <Dot />

      {/* TDEE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: DB.greenDark }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span style={{ color: DB.textMute }}>TDEE:</span>
        <span style={{ fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums' }}>
          {tdee.toLocaleString('vi-VN')} kcal
        </span>
      </div>

      <Dot />

      {/* Constitution */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: DB.greenDark }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span style={{ color: DB.textMute }}>Thể trạng:</span>
        <span style={{ fontWeight: 700, color: DB.ink }}>{constitution}</span>
      </div>

      {!mobile && <Dot />}

      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: DB.textMute }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {date}
        </div>
      )}

      {/* Push right */}
      <div style={{ flex: 1 }} />

      {/* Change goal text link */}
      <button
        onClick={onChangeGoal}
        style={{
          background: 'transparent',
          border: 'none',
          color: DB.greenDark,
          fontSize: 13.5,
          fontWeight: 600,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 6,
          fontFamily: 'inherit',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(6,95,70,.3)',
          textUnderlineOffset: 3,
        }}
      >
        Thay đổi mục tiêu →
      </button>

      {/* Regen button */}
      <BtnPrimary onClick={onRegen} size="sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5" />
        </svg>
        Gen lại cả ngày
      </BtnPrimary>
    </div>
  );
}

function Dot() {
  return (
    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#a7f3d0', flexShrink: 0 }} />
  );
}

// =========================================================================
// FOOTER SUMMARY — full-width card, day total
// =========================================================================
function FooterSummary({
  kcal = 2120,    kcalTarget = 2100,
  p    = 128,    pTarget    = 130,
  f    = 58,     fTarget    = 65,
  c    = 268,    cTarget    = 280,
  mobile = false,
}) {
  // Macro distribution by kcal (4/9/4 kcal per gram)
  const pKcal = p * 4;
  const fKcal = f * 9;
  const cKcal = c * 4;
  const totalKcal = pKcal + fKcal + cKcal;
  const pPct = Math.round((pKcal / totalKcal) * 100);
  const fPct = Math.round((fKcal / totalKcal) * 100);
  const cPct = 100 - pPct - fPct;

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${DB.border}`,
        borderRadius: 16,
        padding: mobile ? 18 : 26,
        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: mobile ? 17 : 19, fontWeight: 700, color: DB.ink, letterSpacing: '-0.01em' }}>
            Tổng dinh dưỡng cả ngày
          </h3>
          <div style={{ fontSize: 12.5, color: DB.textMute, marginTop: 4 }}>
            Tính từ các bữa <b>Đã ăn</b> + bữa <b>Đề xuất</b> còn lại
          </div>
        </div>
        <ScoreBadge score={82.3} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 280px',
          gap: mobile ? 18 : 36,
          alignItems: 'center',
        }}
      >
        {/* 2×2 metrics block (Kcal + Protein on row 1, Fat + Carb on row 2) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: mobile ? 16 : '22px 32px',
          }}
        >
          <SummaryCol label="Tổng Kcal"  value={kcal} target={kcalTarget} unit="kcal" />
          <SummaryCol label="Protein"    value={p}    target={pTarget}    unit="g" />
          <SummaryCol label="Fat"        value={f}    target={fTarget}    unit="g" />
          <SummaryCol label="Carb"       value={c}    target={cTarget}    unit="g" />
        </div>

        {/* Donut — sits on the right, no longer competes for horizontal space with 4 columns */}
        <div style={{ display: 'flex', justifyContent: mobile ? 'center' : 'flex-end' }}>
          <MacroDonut p={pPct} f={fPct} c={cPct} pG={p} fG={f} cG={c} />
        </div>
      </div>
    </div>
  );
}

function SummaryCol({ label, value, target, unit }) {
  const pct = Math.min(120, (value / Math.max(target, 1)) * 100);
  const pctDisplay = Math.round(pct);
  const color = macroDeviationColor(value, target);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: DB.textMute, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {value.toLocaleString('vi-VN')}
        </span>
        <span style={{ fontSize: 14, color: DB.textMute, fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: DB.textFaint, marginTop: 4 }}>
        / {target.toLocaleString('vi-VN')}{unit} target
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 8, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 8 }} />
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {pctDisplay}%
        </span>
      </div>
    </div>
  );
}

// SVG donut for macro distribution
function MacroDonut({ p, f, c, pG, fG, cG }) {
  const r = 56;
  const cx = 70, cy = 70;
  const C = 2 * Math.PI * r;
  const seg = (pct) => (pct / 100) * C;

  // Stroke segments via dasharray + offset (rotate -90 so they start at top)
  let acc = 0;
  const arcs = [
    { pct: p, color: '#10b981', label: 'P' },
    { pct: f, color: '#f59e0b', label: 'F' },
    { pct: c, color: '#3b82f6', label: 'C' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
          {arcs.map((a, i) => {
            const dash = seg(a.pct);
            const offset = -seg(acc);
            acc += a.pct;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
            <div style={{ fontSize: 11, color: DB.textMute, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Phân bổ</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: DB.ink, marginTop: 4 }}>P/F/C</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
        <LegendRow color="#10b981" label="Protein" pct={p} g={pG} />
        <LegendRow color="#f59e0b" label="Fat"     pct={f} g={fG} />
        <LegendRow color="#3b82f6" label="Carb"    pct={c} g={cG} />
        <div style={{
          fontSize: 10.5, color: DB.textFaint, fontStyle: 'italic',
          marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${DB.borderSoft}`,
          lineHeight: 1.4,
        }}>
          Tính theo % calo (P×4 · F×9 · C×4)
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, pct, g }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ color: DB.textMid, fontWeight: 500, minWidth: 50 }}>{label}</span>
      <span style={{ color: DB.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      <span style={{ color: DB.textFaint, fontVariantNumeric: 'tabular-nums' }}>· {g}g</span>
    </div>
  );
}

Object.assign(window, { InfoStrip, FooterSummary, MacroDonut });
