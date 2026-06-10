// Nhật ký bữa ăn — shared atoms (inline-style, DB tokens from dashboard-shared.jsx)
// Status meta · date+compliance helpers · icons · StatusBadge · StatusLegend
// · ComplianceRing · ComplianceBreakdown · ComplianceSummaryCard · RangeSegmented

// ---- status meta --------------------------------------------------
// FOLLOWED = ăn đúng (green) · CUSTOM = ăn khác (amber) · SKIPPED = bỏ bữa (gray)
// SUGGESTED = chưa báo cáo (viền đứt)
const NH_STATUS = {
  FOLLOWED:  { key: 'FOLLOWED',  label: 'Đã ăn đúng',   color: DB.green,     soft: DB.green50,  text: DB.greenDark },
  CUSTOM:    { key: 'CUSTOM',    label: 'Ăn khác',      color: DB.amber500,  soft: DB.amber50,  text: DB.amber700 },
  SKIPPED:   { key: 'SKIPPED',   label: 'Bỏ bữa',       color: '#9ca3af',    soft: '#f9fafb',   text: DB.textMid },
  SUGGESTED: { key: 'SUGGESTED', label: 'Chưa báo cáo', color: '#cbd5e1',    soft: '#ffffff',   text: '#64748b' },
};

const NH_MEAL_LABEL = { SANG: 'Sáng', PHU_SANG: 'Phụ sáng', TRUA: 'Trưa', PHU_CHIEU: 'Phụ chiều', TOI: 'Tối' };
const NH_MEAL_ORDER = ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];
const NH_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NH_MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

// ---- date helpers -------------------------------------------------
const NH_TODAY = new Date(2026, 5, 10); // mock "hôm nay" 10/06/2026
const nhFmtKey = (d) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const nhParseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const nhAddDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const nhStartOfWeek = (d) => { const day = d.getDay(); return nhAddDays(d, day === 0 ? -6 : 1 - day); };
const nhSameDay = (a, b) => nhFmtKey(a) === nhFmtKey(b);
const nhFormatVNDate = (d) => d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// ---- compliance ---------------------------------------------------
// % = FOLLOWED / (FOLLOWED + CUSTOM + SKIPPED). SUGGESTED đếm riêng.
function nhCompliance(logs) {
  const counts = { FOLLOWED: 0, CUSTOM: 0, SKIPPED: 0, SUGGESTED: 0 };
  logs.forEach((l) => { counts[l.status] += 1; });
  const reported = counts.FOLLOWED + counts.CUSTOM + counts.SKIPPED;
  const percent = reported === 0 ? 0 : Math.round((counts.FOLLOWED / reported) * 100);
  return { counts, reported, percent, total: logs.length };
}
function nhLogsForDate(logs, key) {
  const byType = {};
  logs.filter((l) => l.mealDate === key).forEach((l) => { byType[l.mealType] = l; });
  return NH_MEAL_ORDER.map((mt) => byType[mt]).filter(Boolean);
}

// ---- icons (Heroicons outline subset, inline) ---------------------
function NhIcon({ d, size = 18, sw = 1.7, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
const NhCheck    = (p) => <NhIcon {...p} d={['M9 12.75 11.25 15 15 9.75', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z']} />;
const NhPencil   = (p) => <NhIcon {...p} d="M16.86 4.49 18.55 2.8a1.875 1.875 0 1 1 2.65 2.65L6.83 19.82a4.5 4.5 0 0 1-1.9 1.13l-2.68.8.8-2.68a4.5 4.5 0 0 1 1.13-1.9L16.86 4.49Z" />;
const NhNo       = (p) => <NhIcon {...p} d={['M18.36 18.36A9 9 0 0 0 5.64 5.64', 'M18.36 18.36A9 9 0 0 1 5.64 5.64', 'M18.36 18.36 5.64 5.64']} />;
const NhChevL    = (p) => <NhIcon {...p} d="M15.75 19.5 8.25 12l7.5-7.5" />;
const NhChevR    = (p) => <NhIcon {...p} d="m8.25 4.5 7.5 7.5-7.5 7.5" />;
const NhCalendar = (p) => <NhIcon {...p} d={['M6.75 3v2.25M17.25 3v2.25', 'M3 8.25A2.25 2.25 0 0 1 5.25 6h13.5A2.25 2.25 0 0 1 21 8.25v10.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25Z', 'M3 11.25h18']} />;
const NhSparkles = (p) => <NhIcon {...p} d="M9.81 15.9 9 18.75l-.81-2.85a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.85-.81a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.81 2.85a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.85.81a4.5 4.5 0 0 0-3.09 3.09Z" />;

// ---- StatusBadge --------------------------------------------------
function StatusBadge({ status }) {
  const s = NH_STATUS[status];
  const dashed = status === 'SUGGESTED';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: dashed ? '#fff' : s.soft, color: s.text,
      border: dashed ? `1px dashed ${DB.border}` : '1px solid transparent',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dashed ? '#cbd5e1' : s.color }} />
      {s.label}
    </span>
  );
}

// ---- StatusLegend -------------------------------------------------
function StatusLegend({ style }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', ...style }}>
      {['FOLLOWED', 'CUSTOM', 'SKIPPED', 'SUGGESTED'].map((k) => {
        const s = NH_STATUS[k];
        const dashed = k === 'SUGGESTED';
        return (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: DB.textMute }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: dashed ? '#fff' : s.color, border: dashed ? `1px dashed ${DB.border}` : 'none' }} />
            {s.label}
          </span>
        );
      })}
    </div>
  );
}

// ---- ComplianceRing (multi-segment SVG donut) ---------------------
function ComplianceRing({ counts, percent, size = 132, stroke = 13 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const reported = counts.FOLLOWED + counts.CUSTOM + counts.SKIPPED;
  const segs = reported === 0 ? [] : [
    { v: counts.FOLLOWED, color: NH_STATUS.FOLLOWED.color },
    { v: counts.CUSTOM, color: NH_STATUS.CUSTOM.color },
    { v: counts.SKIPPED, color: NH_STATUS.SKIPPED.color },
  ].filter((s) => s.v > 0);
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segs.map((s, i) => {
          const len = (s.v / reported) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, color: DB.ink, fontVariantNumeric: 'tabular-nums' }}>
            {percent}<span style={{ fontSize: 18 }}>%</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: DB.textFaint }}>Tuân thủ</div>
        </div>
      </div>
    </div>
  );
}

// ---- ComplianceBreakdown ------------------------------------------
function ComplianceBreakdown({ counts, cols = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {['FOLLOWED', 'CUSTOM', 'SKIPPED', 'SUGGESTED'].map((k) => {
        const s = NH_STATUS[k];
        const dashed = k === 'SUGGESTED';
        return (
          <div key={k} style={{ borderRadius: 12, border: `1px solid ${DB.borderSoft}`, background: '#fafbfc', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: dashed ? '#fff' : s.color, border: dashed ? `1px dashed ${DB.border}` : 'none' }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums' }}>{counts[k]}</span>
            </div>
            <div style={{ marginTop: 2, fontSize: 12, fontWeight: 500, color: DB.textMute }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---- ComplianceSummaryCard (luôn hiện, theo khoảng) ---------------
function ComplianceSummaryCard({ rangeLabel, logs, mobile = false }) {
  const { counts, percent, reported } = nhCompliance(logs);
  return (
    <Card
      title={`Mức độ tuân thủ · ${rangeLabel}`}
      action={
        <span style={{ borderRadius: 999, background: DB.green50, color: DB.greenDark, padding: '5px 11px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {reported} bữa đã báo cáo
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'center', gap: mobile ? 20 : 32 }}>
        <div style={{ flexShrink: 0 }}>
          <ComplianceRing counts={counts} percent={percent} />
        </div>
        <div style={{ flex: 1, width: '100%' }}>
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: DB.textMute, lineHeight: 1.5 }}>
            Trong số <b style={{ color: DB.textMid }}>{reported}</b> bữa đã báo cáo, bạn ăn đúng đề xuất <b style={{ color: DB.green }}>{counts.FOLLOWED}</b> bữa.
          </p>
          <ComplianceBreakdown counts={counts} cols={mobile ? 2 : 4} />
        </div>
      </div>
    </Card>
  );
}

// ---- RangeSegmented ([Ngày] · [Tuần] · [Tháng]) -------------------
function RangeSegmented({ value }) {
  const ranges = [{ k: 'day', l: 'Ngày' }, { k: 'week', l: 'Tuần' }, { k: 'month', l: 'Tháng' }];
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 4, borderRadius: 12, border: `1px solid ${DB.border}`, background: DB.bg }}>
      {ranges.map((r) => {
        const active = value === r.k;
        return (
          <div key={r.k} style={{
            minWidth: 72, textAlign: 'center', padding: '6px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
            color: active ? '#fff' : DB.textMute, background: active ? DB.green : 'transparent',
            boxShadow: active ? '0 1px 2px rgba(5,150,105,.35)' : 'none', cursor: 'pointer',
          }}>{r.l}</div>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  NH_STATUS, NH_MEAL_LABEL, NH_MEAL_ORDER, NH_DAY_LABELS, NH_MONTH_NAMES,
  NH_TODAY, nhFmtKey, nhParseKey, nhAddDays, nhStartOfWeek, nhSameDay, nhFormatVNDate,
  nhCompliance, nhLogsForDate,
  NhCheck, NhPencil, NhNo, NhChevL, NhChevR, NhCalendar, NhSparkles,
  StatusBadge, StatusLegend, ComplianceRing, ComplianceBreakdown, ComplianceSummaryCard, RangeSegmented,
});
