// Nutrition Plan — Phase 2 scene wrappers (S1–S7)
// Reuses SwapDrawer (evolved) + MealCard + page backgrounds.
// Mô hình C: ghim 1 slot → hệ thống GIỮ NGUYÊN 2 slot còn lại, chỉ tối ưu serving.

// =========================================================================
// Background helper — page behind the drawer
// =========================================================================
function P2Bg({ mobile }) {
  return mobile ? <NutritionPlanMobile /> : <NutritionPlanDesktop collapsedSang={true} />;
}

function P2Scene({ mobile, children }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <P2Bg mobile={mobile} />
      {children}
    </div>
  );
}

// =========================================================================
// S1 — Drawer initial · slot Món chính · search rỗng · chưa chọn món
// =========================================================================
function P2_S1({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={-1}
        query=""
        current={{ slot: 'Món chính', name: 'Gà luộc', grams: 280, kcal: 380 }}
        alternates={SWAP_ALTERNATES}
        keepNames="Canh rau dền + Cơm trắng"
      />
    </P2Scene>
  );
}

// =========================================================================
// S2 — Drawer đang search "cơm" · slot Tinh bột · Cơm trắng selected
// =========================================================================
function P2_S2({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={0}
        query="cơm"
        current={{ slot: 'Tinh bột', name: 'Cơm trắng', grams: 200, kcal: 385 }}
        alternates={SEARCH_COM}
        keepNames="Gà luộc + Canh rau dền"
      />
    </P2Scene>
  );
}

// =========================================================================
// S3 — Drawer có strip "Đang ghim" · slot Món chính · search "cá"
// =========================================================================
const P2_PINS = [
  { name: 'Cơm trắng', group: 'TINH_BOT_GAO', serving: 2, unit: 'bát', grams: 200 },
];

function P2_S3({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={0}
        query="cá"
        pins={P2_PINS}
        current={{ slot: 'Món chính', name: 'Gà luộc', grams: 280, kcal: 380 }}
        alternates={SEARCH_CA}
        keepNames="Cơm trắng + Canh rau dền"
      />
    </P2Scene>
  );
}

// =========================================================================
// S4 — Drawer search empty · "xyzabc"
// =========================================================================
function P2_S4({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={-1}
        query="xyzabc"
        current={{ slot: 'Món chính', name: 'Gà luộc', grams: 280, kcal: 380 }}
        alternates={[]}
        keepNames="Canh rau dền + Cơm trắng"
      />
    </P2Scene>
  );
}

// =========================================================================
// S5 — Soft warning kcal (mode B) · override 3 bát cơm
// =========================================================================
function P2_S5({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={0}
        query="cơm"
        current={{ slot: 'Tinh bột', name: 'Cơm trắng', grams: 200, kcal: 385 }}
        alternates={SEARCH_COM}
        stepperOverride={{ serving: 3, grams: 300 }}
        warnMode={{
          text: (
            <React.Fragment>
              <b>Khó cân đối kcal</b> với khẩu phần đã chọn. Bạn có thể: giảm xuống <b>2 bát</b>,
              hoặc đổi <b>Cá kho tộ → Cá hồi áp chảo</b> để <b>+2.4 điểm</b>.
            </React.Fragment>
          ),
        }}
      />
    </P2Scene>
  );
}

// =========================================================================
// S6 — Carb-bomb warning (mode B) · 78% kcal từ carb
// =========================================================================
function P2_S6({ mobile = false }) {
  return (
    <P2Scene mobile={mobile}>
      <SwapDrawer
        open mobile={mobile}
        selectedIndex={0}
        query="cơm"
        current={{ slot: 'Tinh bột', name: 'Cơm trắng', grams: 200, kcal: 385 }}
        alternates={SEARCH_COM}
        stepperOverride={{ serving: 3, grams: 300 }}
        warnMode={{
          text: (
            <React.Fragment>
              Bữa này <b>khá nặng tinh bột (78% kcal từ carb)</b>. Cân nhắc giảm khẩu phần cơm
              hoặc đổi sang <b>bún tươi</b> cho cân bằng hơn.
            </React.Fragment>
          ),
        }}
      />
    </P2Scene>
  );
}

// =========================================================================
// S7 — MealCard sau khi áp dụng thành công (isolated, không drawer)
//   2 món ghim (📌) + 1 món thường · banner suggestion · điểm 73.2
// =========================================================================
const P2_MEAL_APPLIED = {
  id: 'trua',
  name: 'Bữa Trưa',
  icon: '🍽',
  iconBg: '#fed7aa',
  target: 840,
  status: 'suggested',
  score: 73.2,
  targets: { p: 42, f: 25, c: 95 },
  foods: [
    { name: 'Cơm trắng',            slot: 'Tinh bột',  group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT', serving: 2, unit: 'bát',  grams: 200, kcal: 220, p: 4,  f: 0,  c: 49, pinned: true },
    { name: 'Cá hồi áp chảo',       slot: 'Món chính', group: 'CA',           groupLabel: 'CÁ',       serving: 1, unit: 'phần', grams: 150, kcal: 312, p: 31, f: 20, c: 0,  pinned: true },
    { name: 'Canh rau dền nấu tôm', slot: 'Rau',       group: 'RAU_LA',       groupLabel: 'RAU LÁ',   serving: 1, unit: 'tô',   grams: 250, kcal: 85,  p: 6,  f: 3,  c: 8 },
  ],
  totals: { kcal: 617, p: 41, f: 23, c: 57 },
};

function P2_S7({ mobile = false }) {
  return (
    <div style={{ ...dbFont, background: DB.bg, padding: mobile ? 16 : 24, width: '100%', height: '100%' }}>
      <MealCard
        meal={P2_MEAL_APPLIED}
        mobile={mobile}
        suggestion={{
          text: (
            <React.Fragment>
              <b>Gợi ý:</b> Bữa <b>Trưa</b> hiện <b>73.2</b> điểm — có thể cao hơn.
              Đổi <b>Canh rau dền → Salad bắp cải tím</b> để <b>+3.5 điểm</b>.
            </React.Fragment>
          ),
        }}
      />
    </div>
  );
}

Object.assign(window, {
  P2_S1, P2_S2, P2_S3, P2_S4, P2_S5, P2_S6, P2_S7,
});
