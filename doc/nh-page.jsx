// Nhật ký bữa ăn — page frame + full-page composition
// HistorySidebar (thêm mục "Nhật ký bữa ăn") · HistoryPageFrame · NutritionHistoryPage

// ---- Sidebar (mirror dashboard-shared Sidebar + thêm mục lịch sử) --
function HistorySidebar() {
  const items = [
    { id: 'dashboard', label: 'Thông số Sức khỏe', d: 'M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z' },
    { id: 'submit', label: 'Cập nhật Chỉ số', d: 'M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
    { id: 'nutrition', label: 'Đề xuất Thực đơn', d: 'M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3' },
    { id: 'history', label: 'Nhật ký bữa ăn', calendar: true },
    { id: 'notif', label: 'Thông báo', d: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0' },
  ];
  return (
    <aside style={{ width: 256, background: '#fff', borderRight: `1px solid ${DB.border}`, height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 16px', boxShadow: '2px 0 8px -4px rgba(15,23,42,.04)', flexShrink: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: DB.greenDark, letterSpacing: '-0.01em' }}>HealthCare</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {items.map((it) => {
          const active = it.id === 'history';
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
              fontSize: 14.5, fontWeight: active ? 600 : 500, color: active ? '#fff' : DB.text,
              background: active ? DB.green : 'transparent', boxShadow: active ? '0 4px 10px -3px rgba(5,150,105,.4)' : 'none', cursor: 'pointer',
            }}>
              <span style={{ color: active ? '#fff' : DB.textMid, display: 'flex' }}>
                {it.calendar ? <NhCalendar size={20} sw={1.75} /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={it.d} /></svg>
                )}
              </span>
              {it.label}
            </div>
          );
        })}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, fontSize: 14.5, color: DB.textMid, cursor: 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
        Đăng xuất
      </div>
    </aside>
  );
}

// ---- PageFrame ----------------------------------------------------
function HistoryPageFrame({ children, mobile = false, userName = 'Chiến' }) {
  if (mobile) {
    return (
      <div style={{ ...dbFont, background: DB.bg, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ background: '#fff', borderBottom: `1px solid ${DB.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: DB.text, display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: DB.ink }}>Nhật ký bữa ăn</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${DB.green}, #10b981)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>{userName[0]}</div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 16, background: DB.bg }}>{children}</main>
        <nav style={{ background: '#fff', borderTop: `1px solid ${DB.border}`, padding: '8px 12px', display: 'flex', justifyContent: 'space-around', flexShrink: 0 }}>
          {[
            { label: 'Tổng quan', icon: 'M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z' },
            { label: 'Thực đơn', icon: 'M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3' },
            { label: 'Nhật ký', calendar: true, active: true },
            { label: 'Thông báo', icon: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 10px', color: it.active ? DB.green : DB.textMute, fontWeight: it.active ? 600 : 500, fontSize: 10.5 }}>
              {it.calendar ? <NhCalendar size={20} sw={1.75} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>}
              {it.label}
            </div>
          ))}
        </nav>
      </div>
    );
  }
  return (
    <div style={{ ...dbFont, background: DB.bg, width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      <HistorySidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader userName={userName} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 36px 40px', background: DB.bg }}>{children}</main>
      </div>
    </div>
  );
}

// ---- Page content (header + segmented + summary + range view) -----
function NutritionHistoryContent({ range = 'day', mobile = false, logs = NH_MOCK_LOGS, openNoteFor }) {
  const rangeLabel = range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng';
  const todayKey = nhFmtKey(NH_TODAY);

  // logs trong khoảng đang chọn → thẻ tóm tắt
  let rangeLogs;
  if (range === 'day') rangeLogs = logs.filter((l) => l.mealDate === todayKey);
  else if (range === 'week') { const mon = nhStartOfWeek(NH_TODAY); const keys = new Set(Array.from({ length: 7 }, (_, i) => nhFmtKey(nhAddDays(mon, i)))); rangeLogs = logs.filter((l) => keys.has(l.mealDate)); }
  else rangeLogs = logs.filter((l) => { const d = nhParseKey(l.mealDate); return d.getMonth() === NH_TODAY.getMonth() && d.getFullYear() === NH_TODAY.getFullYear(); });

  return (
    <div style={{ maxWidth: mobile ? '100%' : 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: mobile ? 21 : 24, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>Nhật ký bữa ăn</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: DB.textMute }}>Xem bạn đã ăn gì và mức độ bám sát thực đơn.</p>
        </div>
        {!mobile && <RangeSegmented value={range} />}
      </div>
      {mobile && <div style={{ marginBottom: 20 }}><RangeSegmented value={range} /></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ComplianceSummaryCard rangeLabel={rangeLabel} logs={rangeLogs} mobile={mobile} />
        {range === 'day' && <DayView dateKey={todayKey} logs={logs} openNoteFor={openNoteFor} />}
        {range === 'week' && <WeekView anchorKey={todayKey} logs={logs} />}
        {range === 'month' && <MonthView anchorKey={todayKey} logs={logs} />}
      </div>
    </div>
  );
}

// ---- Full-page wrappers -------------------------------------------
function NutritionHistoryDesktop({ range = 'day', openNoteFor }) {
  return <HistoryPageFrame><NutritionHistoryContent range={range} openNoteFor={openNoteFor} /></HistoryPageFrame>;
}
function NutritionHistoryMobile({ range = 'day', openNoteFor }) {
  return <HistoryPageFrame mobile><NutritionHistoryContent range={range} mobile openNoteFor={openNoteFor} /></HistoryPageFrame>;
}
function NutritionHistoryEmptyDesktop() {
  return (
    <HistoryPageFrame>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>Nhật ký bữa ăn</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: DB.textMute }}>Xem bạn đã ăn gì và mức độ bám sát thực đơn.</p>
          </div>
          <RangeSegmented value="day" />
        </div>
        <NhEmptyState />
      </div>
    </HistoryPageFrame>
  );
}

Object.assign(window, {
  HistorySidebar, HistoryPageFrame, NutritionHistoryContent,
  NutritionHistoryDesktop, NutritionHistoryMobile, NutritionHistoryEmptyDesktop,
});
