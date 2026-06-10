// Nutrition Plan — full page (Desktop + Mobile) with sample data
// Reuses Sidebar, TopHeader from dashboard-shared.jsx

// =========================================================================
// PageFrame — same shell as dashboard, with 'nutrition' active
// =========================================================================
function NutritionPageFrame({ children, mobile = false, userName = 'Chiến' }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
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
          <button style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: DB.text, display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: DB.ink }}>Đề xuất Thực đơn</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${DB.green}, #10b981)`, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>
            {userName[0]}
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 16, background: DB.bg }}>
          {children}
        </main>
        <nav style={{ background: '#fff', borderTop: `1px solid ${DB.border}`, padding: '8px 12px', display: 'flex', justifyContent: 'space-around', flexShrink: 0 }}>
          {[
            { label: 'Tổng quan', icon: 'M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2V10z' },
            { label: 'Cập nhật', icon: 'M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z' },
            { label: 'Thực đơn', icon: 'M9 3h6M10 3v6L5 19a2 2 0 002 2h10a2 2 0 002-2L14 9V3', active: true },
            { label: 'Thông báo', icon: 'M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0' },
          ].map((it, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 10px', color: it.active ? DB.green : DB.textMute, fontWeight: it.active ? 600 : 500, fontSize: 10.5 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={it.icon} />
              </svg>
              {it.label}
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div style={{ ...dbFont, background: DB.bg, width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
      <div
        style={{
          width: sidebarOpen ? 256 : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width .25s ease',
        }}
      >
        <Sidebar active="nutrition" />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader userName={userName} onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 36px 40px', background: DB.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// PAGE HEADER — title + date line + [Hôm nay · Ngày mai] selector
// =========================================================================
function PageHeader({ mobile = false, day = 'today', onChangeDay = () => {} }) {
  const info = DAY_INFO[day];
  const isTomorrow = day === 'tomorrow';

  // Title + date block (shared by both layouts)
  const titleBlock = (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: mobile ? 22 : 28, fontWeight: 700, color: DB.ink, letterSpacing: '-0.02em' }}>
          {info.title}
        </h1>
        {isTomorrow && <TomorrowChip small={mobile} />}
      </div>
      <div style={{ fontSize: 13.5, color: DB.textMute, marginTop: 4 }}>
        {info.weekday} · {info.dateLong} — đề xuất cá nhân hoá cho <b style={{ color: DB.text }}>Nguyễn Văn A</b>
      </div>
      {isTomorrow && info.subNote && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: DB.greenDark, marginTop: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          {info.subNote}
        </div>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div style={{ marginBottom: 16 }}>
        {titleBlock}
        <div style={{ marginTop: 12 }}>
          <DaySelector value={day} onChange={onChangeDay} full />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
      {titleBlock}
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        <DaySelector value={day} onChange={onChangeDay} />
      </div>
    </div>
  );
}

// =========================================================================
// SAMPLE DATA (per the prompt)
// =========================================================================
const MEAL_DATA = {
  sang: {
    id: 'sang',
    name: 'Bữa Sáng',
    icon: '☀️',
    iconBg: '#fef3c7',
    target: 525,
    status: 'eaten',
    score: 84.5,
    targets: { p: 26, f: 15, c: 75 },
    foods: [
      { name: 'Phở bò tái', slot: 'Combo', group: 'COMBO', groupLabel: 'PHỞ / COMBO', serving: 1, unit: 'tô', grams: 350, kcal: 525, p: 22, f: 14, c: 72 },
    ],
    totals: { kcal: 525, p: 22, f: 14, c: 72 },
  },
  trua: {
    id: 'trua',
    name: 'Bữa Trưa',
    icon: '🍽',
    iconBg: '#fed7aa',
    target: 840,
    status: 'suggested',
    score: 87.5,
    targets: { p: 42, f: 25, c: 95 },
    foods: [
      { name: 'Gà luộc',             slot: 'Món chính', group: 'GIA_CAM',      groupLabel: 'GIA CẦM',     serving: 1, unit: 'đĩa', grams: 280, kcal: 380, p: 35, f: 10, c: 0, favorite: true },
      { name: 'Canh rau dền nấu tôm', slot: 'Rau',       group: 'RAU_LA',       groupLabel: 'RAU LÁ',      serving: 1, unit: 'tô',  grams: 250, kcal: 85,  p: 6,  f: 3,  c: 8 },
      { name: 'Cơm trắng',           slot: 'Tinh bột',   group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT',   serving: 2, unit: 'bát', grams: 200, kcal: 385, p: 7,  f: 0,  c: 87 },
    ],
    totals: { kcal: 850, p: 48, f: 13, c: 95 },
  },
  toi: {
    id: 'toi',
    name: 'Bữa Tối',
    icon: '🌙',
    iconBg: '#e0e7ff',
    target: 735,
    status: 'suggested',
    score: 76.2,
    targets: { p: 37, f: 22, c: 83 },
    foods: [
      { name: 'Cá kho tộ',           slot: 'Món chính', group: 'CA',           groupLabel: 'CÁ',          serving: 1, unit: 'phần', grams: 220, kcal: 320, p: 28, f: 18, c: 5 },
      { name: 'Rau muống xào tỏi',    slot: 'Rau',       group: 'RAU_LA',       groupLabel: 'RAU LÁ',      serving: 1, unit: 'đĩa',  grams: 200, kcal: 65,  p: 4,  f: 2,  c: 8 },
      { name: 'Bún tươi',            slot: 'Tinh bột',   group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT',   serving: 1, unit: 'tô',   grams: 180, kcal: 340, p: 8,  f: 1,  c: 75 },
    ],
    totals: { kcal: 725, p: 40, f: 21, c: 88 },
  },
};

// =========================================================================
// SAMPLE DATA — NGÀY MAI (chưa ăn bữa nào → cả 3 bữa đều "Đề xuất")
// =========================================================================
const MEAL_DATA_TOMORROW = {
  sang: {
    id: 'sang',
    name: 'Bữa Sáng',
    icon: '☀️',
    iconBg: '#fef3c7',
    target: 525,
    status: 'suggested',
    score: 86.0,
    targets: { p: 26, f: 15, c: 75 },
    foods: [
      { name: 'Bánh cuốn nhân thịt', slot: 'Combo', group: 'COMBO', groupLabel: 'COMBO', serving: 1, unit: 'đĩa', grams: 300, kcal: 500, p: 20, f: 12, c: 74 },
    ],
    totals: { kcal: 500, p: 20, f: 12, c: 74 },
  },
  trua: {
    id: 'trua',
    name: 'Bữa Trưa',
    icon: '🍽',
    iconBg: '#fed7aa',
    target: 840,
    status: 'suggested',
    score: 89.0,
    targets: { p: 42, f: 25, c: 95 },
    foods: [
      { name: 'Thịt bò xào đậu',    slot: 'Món chính', group: 'THIT_DO',      groupLabel: 'THỊT ĐỘ',   serving: 1, unit: 'đĩa', grams: 260, kcal: 410, p: 34, f: 18, c: 10 },
      { name: 'Canh bí đao nấu tôm', slot: 'Rau',       group: 'RAU_LA',       groupLabel: 'RAU LÁ',     serving: 1, unit: 'tô',  grams: 250, kcal: 70,  p: 5,  f: 2,  c: 7 },
      { name: 'Cơm gạo lứt',         slot: 'Tinh bột',   group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT',  serving: 1, unit: 'bát', grams: 180, kcal: 350, p: 7,  f: 2,  c: 76 },
    ],
    totals: { kcal: 830, p: 46, f: 22, c: 93 },
  },
  toi: {
    id: 'toi',
    name: 'Bữa Tối',
    icon: '🌙',
    iconBg: '#e0e7ff',
    target: 735,
    status: 'suggested',
    score: 82.4,
    targets: { p: 37, f: 22, c: 83 },
    foods: [
      { name: 'Tôm rang',           slot: 'Món chính', group: 'HAI_SAN',      groupLabel: 'HẢI SẢN',   serving: 1, unit: 'phần', grams: 200, kcal: 300, p: 30, f: 14, c: 6 },
      { name: 'Cải ngọt luộc',      slot: 'Rau',       group: 'RAU_LA',       groupLabel: 'RAU LÁ',     serving: 1, unit: 'đĩa',  grams: 200, kcal: 55,  p: 4,  f: 1,  c: 8 },
      { name: 'Cơm trắng',          slot: 'Tinh bột',   group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT',  serving: 1, unit: 'bát',  grams: 180, kcal: 345, p: 6,  f: 1,  c: 78 },
    ],
    totals: { kcal: 700, p: 40, f: 16, c: 92 },
  },
};

// =========================================================================
// DESKTOP PAGE — main scenario
// =========================================================================
function NutritionPlanDesktop({ collapsedSang = true, mealVariant = 'default', initialDay = 'today' }) {
  const [day, setDay] = React.useState(initialDay);
  const data = day === 'tomorrow' ? MEAL_DATA_TOMORROW : MEAL_DATA;
  const info = DAY_INFO[day];
  // Tomorrow: nothing eaten yet → don't collapse the morning meal.
  const collapseMorning = day === 'tomorrow' ? false : collapsedSang;
  const t = data.sang.totals, u = data.trua.totals, v = data.toi.totals;
  return (
    <NutritionPageFrame>
      <PageHeader day={day} onChangeDay={setDay} />

      <InfoStrip
        goal="Giảm cân"
        tdee={2100}
        constitution="Cân đối"
        date={info.dateShort}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
        <MealCard meal={data.sang} collapsed={collapseMorning} variant={mealVariant} />
        <MealCard meal={data.trua} variant={mealVariant} />
        <MealCard meal={data.toi}  variant={mealVariant} />
      </div>

      <FooterSummary
        kcal={t.kcal + u.kcal + v.kcal}
        kcalTarget={2100}
        p={t.p + u.p + v.p}
        pTarget={130}
        f={t.f + u.f + v.f}
        fTarget={65}
        c={t.c + u.c + v.c}
        cTarget={280}
      />
    </NutritionPageFrame>
  );
}

// =========================================================================
// MOBILE PAGE
// =========================================================================
function NutritionPlanMobile({ initialDay = 'today' }) {
  const [day, setDay] = React.useState(initialDay);
  const data = day === 'tomorrow' ? MEAL_DATA_TOMORROW : MEAL_DATA;
  const info = DAY_INFO[day];
  const t = data.sang.totals, u = data.trua.totals, v = data.toi.totals;
  return (
    <NutritionPageFrame mobile>
      <PageHeader mobile day={day} onChangeDay={setDay} />
      <InfoStrip goal="Giảm cân" tdee={2100} constitution="Cân đối" date={info.dateShort} mobile />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        <MealCard meal={data.sang} collapsed={day !== 'tomorrow'} mobile />
        <MealCard meal={data.trua} mobile />
        <MealCard meal={data.toi}  mobile />
      </div>

      <FooterSummary
        kcal={t.kcal + u.kcal + v.kcal}
        kcalTarget={2100}
        p={t.p + u.p + v.p} pTarget={130}
        f={t.f + u.f + v.f} fTarget={65}
        c={t.c + u.c + v.c} cTarget={280}
        mobile
      />
    </NutritionPageFrame>
  );
}

// =========================================================================
// ISOLATED MEAL CARD — for the zoom + alt variation artboards
// =========================================================================
function IsolatedMeal({ variant = 'default', meal = MEAL_DATA.trua, confirmLoading = false }) {
  return (
    <div style={{ ...dbFont, background: DB.bg, padding: 24, width: '100%', height: '100%' }}>
      <MealCard meal={meal} variant={variant} confirmLoading={confirmLoading} />
    </div>
  );
}

// =========================================================================
// HEADER SHOWCASE — just the page header (title + date + selector), framed
// =========================================================================
function HeaderShowcase({ initialDay = 'today' }) {
  const [day, setDay] = React.useState(initialDay);
  return (
    <div style={{ ...dbFont, background: '#fff', width: '100%', height: '100%', padding: '28px 32px', display: 'flex', alignItems: 'flex-start' }}>
      <div style={{ width: '100%' }}>
        <PageHeader day={day} onChangeDay={setDay} />
      </div>
    </div>
  );
}

Object.assign(window, {
  NutritionPlanDesktop, NutritionPlanMobile, IsolatedMeal, MEAL_DATA, MEAL_DATA_TOMORROW,
  PageHeader, HeaderShowcase,
});
