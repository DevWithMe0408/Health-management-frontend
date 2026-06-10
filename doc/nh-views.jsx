// Nhật ký bữa ăn — views (inline-style, DB tokens)
// RangeCard · DishList · QuickAction · MealLogRow · DayView · WeekView · MonthView · EmptyState

// ---- RangeCard (card + tiêu đề IN HOA + cụm nav prev/next) --------
function RangeCard({ title, label, labelMinWidth = 130, children }) {
  const navBtn = {
    width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 8,
    border: `1px solid ${DB.border}`, background: '#fff', color: DB.textMute, cursor: 'pointer',
  };
  return (
    <Card
      title={title}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={navBtn}><NhChevL size={16} /></div>
          <span style={{ minWidth: labelMinWidth, textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: DB.textMid, textTransform: 'capitalize' }}>{label}</span>
          <div style={navBtn}><NhChevR size={16} /></div>
        </div>
      }
    >
      {children}
    </Card>
  );
}

// ---- DishList -----------------------------------------------------
function DishList({ dishes, muted = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', opacity: muted ? 0.5 : 1 }}>
      {dishes.map((d, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, fontSize: 13.5, color: DB.textMid }}>
          <span style={{ fontWeight: 500 }}>{d.dishName}</span>
          <span style={{ fontSize: 11.5, color: DB.textFaint, fontVariantNumeric: 'tabular-nums' }}>{d.dishKcal} kcal</span>
        </span>
      ))}
    </div>
  );
}

// ---- QuickAction --------------------------------------------------
function QuickAction({ icon: Ic, label, tone, active, hideLabel = false }) {
  const map = {
    green: { on: { bg: DB.green, fg: '#fff', bd: DB.green }, off: { bg: '#fff', fg: DB.greenDark, bd: DB.green200 } },
    amber: { on: { bg: DB.amber500, fg: '#fff', bd: DB.amber500 }, off: { bg: '#fff', fg: DB.amber700, bd: DB.amber300 } },
    gray:  { on: { bg: '#6b7280', fg: '#fff', bd: '#6b7280' }, off: { bg: '#fff', fg: DB.textMid, bd: DB.border } },
  };
  const c = active ? map[tone].on : map[tone].off;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8,
      border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      <Ic size={16} />{!hideLabel && label}
    </span>
  );
}

// ---- MealLogRow ---------------------------------------------------
function MealLogRow({ log, noteOpen = false, hideLabels = false }) {
  const s = NH_STATUS[log.status];
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${DB.border}`, background: '#fff', padding: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 4, height: 28, borderRadius: 999, background: log.status === 'SUGGESTED' ? '#e2e8f0' : s.color }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: DB.ink }}>{NH_MEAL_LABEL[log.mealType]}</span>
            <StatusBadge status={log.status} />
          </div>
          <div style={{ paddingLeft: 14 }}>
            {log.status === 'FOLLOWED' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px' }}>
                <DishList dishes={log.dishes} />
                <span style={{ fontSize: 12, fontWeight: 600, color: DB.green, fontVariantNumeric: 'tabular-nums' }}>· {log.totalKcalActual} kcal</span>
              </div>
            )}
            {log.status === 'CUSTOM' && (
              <p style={{ margin: 0, fontSize: 13.5, color: DB.textMid }}>
                <span style={{ fontWeight: 500, color: DB.amber700 }}>Đã ăn: </span>{log.customNote}
                {log.totalKcalActual > 0 && <span style={{ marginLeft: 6, fontSize: 11.5, color: DB.textFaint, fontVariantNumeric: 'tabular-nums' }}>(~{log.totalKcalActual} kcal)</span>}
              </p>
            )}
            {log.status === 'SKIPPED' && <p style={{ margin: 0, fontSize: 13.5, fontStyle: 'italic', color: DB.textFaint }}>Đã bỏ bữa này.</p>}
            {log.status === 'SUGGESTED' && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11.5, fontWeight: 500, color: DB.textFaint }}>Đề xuất (chưa báo cáo):</p>
                <DishList dishes={log.dishes} muted />
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <QuickAction icon={NhCheck}  label="Đã ăn đúng" tone="green" active={log.status === 'FOLLOWED'} hideLabel={hideLabels} />
          <QuickAction icon={NhPencil} label="Ăn khác"    tone="amber" active={log.status === 'CUSTOM'}   hideLabel={hideLabels} />
          <QuickAction icon={NhNo}     label="Bỏ bữa"     tone="gray"  active={log.status === 'SKIPPED'}  hideLabel={hideLabels} />
        </div>
      </div>
      {noteOpen && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, borderRadius: 10, border: `1px solid ${DB.amber300}`, background: DB.amber50, padding: '10px 10px 10px 14px' }}>
          <NhPencil size={16} style={{ color: DB.amber500, flexShrink: 0 }} />
          <input readOnly value="" placeholder="Bạn đã ăn gì? (vd: bún bò Huế)"
            style={{ flex: 1, minWidth: 0, borderRadius: 6, border: `1px solid ${DB.amber300}`, background: '#fff', padding: '7px 12px', fontSize: 13.5, color: DB.textMid }} />
          <span style={{ borderRadius: 6, background: DB.amber500, color: '#fff', padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Lưu</span>
          <span style={{ borderRadius: 6, padding: '7px 8px', fontSize: 12, fontWeight: 600, color: DB.textFaint, cursor: 'pointer' }}>Hủy</span>
        </div>
      )}
    </div>
  );
}

// ---- DayView ------------------------------------------------------
function DayView({ dateKey, logs, openNoteFor }) {
  const date = nhParseKey(dateKey);
  const dayLogs = nhLogsForDate(logs, dateKey);
  return (
    <RangeCard title="Chi tiết theo ngày" label={nhFormatVNDate(date)} labelMinWidth={210}>
      {dayLogs.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13.5, color: DB.textFaint }}>Không có bữa ăn nào cho ngày này.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayLogs.map((log) => <MealLogRow key={log.id} log={log} noteOpen={openNoteFor === log.mealType} />)}
        </div>
      )}
    </RangeCard>
  );
}

// ---- WeekView -----------------------------------------------------
function WeekView({ anchorKey, logs }) {
  const monday = nhStartOfWeek(nhParseKey(anchorKey));
  const days = Array.from({ length: 7 }, (_, i) => nhAddDays(monday, i));
  const end = nhAddDays(monday, 6);
  const rangeLabel = `${monday.getDate()}/${monday.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}`;
  return (
    <RangeCard title="Theo tuần" label={rangeLabel} labelMinWidth={110}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {days.map((d, i) => {
          const key = nhFmtKey(d);
          const dayLogs = nhLogsForDate(logs, key);
          const today = nhSameDay(d, NH_TODAY);
          return (
            <div key={key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 8px 8px',
              borderRadius: 12, border: `1px solid ${today ? DB.green : DB.border}`, background: today ? DB.green50 : '#fff', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: today ? DB.greenDark : DB.textFaint }}>{NH_DAY_LABELS[i]}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: today ? DB.greenDark : DB.textMid, fontVariantNumeric: 'tabular-nums' }}>{d.getDate()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: '100%' }}>
                {NH_MEAL_ORDER.map((mt) => {
                  const lg = dayLogs.find((l) => l.mealType === mt);
                  const st = lg ? lg.status : 'SUGGESTED';
                  const sc = NH_STATUS[st];
                  const dashed = st === 'SUGGESTED';
                  return <div key={mt} title={`${NH_MEAL_LABEL[mt]}: ${sc.label}`}
                    style={{ height: 14, width: '100%', maxWidth: 38, borderRadius: 5, background: dashed ? '#f9fafb' : sc.color, border: dashed ? `1px dashed ${DB.border}` : 'none' }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <StatusLegend style={{ marginTop: 20 }} />
    </RangeCard>
  );
}

// ---- MonthView ----------------------------------------------------
function MonthView({ anchorKey, logs }) {
  const anchor = nhParseKey(anchorKey);
  const year = anchor.getFullYear(), month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const summary = (key) => {
    const dl = nhLogsForDate(logs, key);
    const { counts, reported, percent } = nhCompliance(dl);
    let dominant = 'SUGGESTED';
    if (reported > 0) dominant = ['FOLLOWED', 'CUSTOM', 'SKIPPED'].reduce((a, b) => (counts[b] > counts[a] ? b : a), 'FOLLOWED');
    return { reported, percent, dominant };
  };

  return (
    <RangeCard title="Theo tháng" label={`${NH_MONTH_NAMES[month]} ${year}`} labelMinWidth={130}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
        {NH_DAY_LABELS.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: DB.textFaint }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = nhFmtKey(d);
          const today = nhSameDay(d, NH_TODAY);
          const { reported, percent, dominant } = summary(key);
          const sc = NH_STATUS[dominant];
          return (
            <div key={key} style={{
              aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              borderRadius: 12, border: `1px solid ${today ? DB.green : DB.borderSoft}`,
              boxShadow: today ? `0 0 0 1px ${DB.green200}` : 'none', padding: 6, cursor: 'pointer',
            }}>
              <span style={{ alignSelf: 'flex-end', fontSize: 12, fontWeight: 600, color: today ? DB.greenDark : DB.textMute, fontVariantNumeric: 'tabular-nums' }}>{d.getDate()}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingBottom: 2 }}>
                {reported > 0 ? (
                  <>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: sc.color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: DB.textFaint, fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>
                  </>
                ) : (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', border: `1px dashed ${DB.border}` }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <StatusLegend style={{ marginTop: 20 }} />
    </RangeCard>
  );
}

// ---- EmptyState ---------------------------------------------------
function NhEmptyState() {
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: 16, background: DB.green50, color: DB.green }}>
          <NhCalendar size={28} />
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: DB.ink }}>Chưa có bữa ăn nào được ghi nhận</h3>
        <p style={{ margin: 0, maxWidth: 360, fontSize: 13.5, lineHeight: 1.6, color: DB.textMute }}>Hãy tạo thực đơn để bắt đầu theo dõi mức độ tuân thủ của bạn.</p>
        <span style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 12, background: DB.green, color: '#fff', padding: '10px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 10px -3px rgba(5,150,105,.4)' }}>
          <NhSparkles size={16} />Tạo thực đơn
        </span>
      </div>
    </Card>
  );
}

Object.assign(window, { RangeCard, DishList, QuickAction, MealLogRow, DayView, WeekView, MonthView, NhEmptyState });
