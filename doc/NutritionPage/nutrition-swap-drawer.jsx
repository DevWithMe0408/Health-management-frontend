// Nutrition Plan — Swap Drawer ("Đổi món")
// Desktop: side drawer 480px slide from right
// Mobile:  bottom sheet 75% height slide from bottom

// 10 lựa chọn thay thế Món chính bữa Trưa (đang là Gà luộc)
const SWAP_ALTERNATES = [
  { name: 'Mực xào sa tế',     group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  grams: 120, kcal: 250, score: 89.2, delta: 1.7 },
  { name: 'Bò xào cần tỏi',     group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  grams: 150, kcal: 280, score: 88.5, delta: 1.0 },
  { name: 'Cá kho tộ',          group: 'CA',      groupLabel: 'CÁ',       grams: 200, kcal: 320, score: 86.3, delta: -1.2 },
  { name: 'Tôm rim',            group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  grams: 130, kcal: 220, score: 85.8, delta: -1.7 },
  { name: 'Sườn ram',           group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  grams: 180, kcal: 340, score: 84.1, delta: -3.4 },
  { name: 'Thịt heo luộc',      group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  grams: 200, kcal: 290, score: 83.5, delta: -4.0 },
  { name: 'Vịt quay',           group: 'GIA_CAM', groupLabel: 'GIA CẦM',  grams: 160, kcal: 380, score: 82.2, delta: -5.3 },
  { name: 'Trứng kho thịt',     group: 'TRUNG',   groupLabel: 'TRỨNG',    grams: 140, kcal: 260, score: 80.8, delta: -6.7, favorite: true },
  { name: 'Lươn xào lăn',       group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  grams: 150, kcal: 310, score: 78.5, delta: -9.0 },
  { name: 'Ếch xào sả ớt',      group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  grams: 140, kcal: 270, score: 76.0, delta: -11.5 },
];

// =========================================================================
// DELTA PILL — small +1.7 / -3.4 score delta indicator
// =========================================================================
function DeltaPill({ value }) {
  const positive = value >= 0;
  const bg = positive ? '#d1fae5' : '#fee2e2';
  const fg = positive ? '#065f46' : '#991b1b';
  const arrow = positive ? '▲' : '▼';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 7px',
        borderRadius: 6,
        background: bg,
        color: fg,
        fontSize: 11.5,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 8 }}>{arrow}</span>
      {positive ? '+' : ''}{value.toFixed(1)}
    </span>
  );
}

// =========================================================================
// ALTERNATE OPTION CARD — single row in the drawer list
// =========================================================================
function AlternateCard({ alt, selected, onSelect, mobile = false }) {
  const isSelected = selected;
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: mobile ? '12px 12px' : '14px 14px',
        borderRadius: 12,
        border: isSelected ? `2px solid ${DB.green}` : `1px solid ${DB.border}`,
        background: isSelected ? DB.green50 : '#fff',
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s, box-shadow .15s',
        boxShadow: isSelected ? '0 2px 8px -2px rgba(5,150,105,.25)' : 'none',
        margin: isSelected ? 0 : '1px 1px', // compensate for border width diff so layout doesn't jump
      }}
    >
      <FoodThumb name={alt.name} group={alt.group} size={mobile ? 52 : 56} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: DB.ink }}>{alt.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <FoodGroupChip>{alt.groupLabel}</FoodGroupChip>
        </div>

        <div style={{ fontSize: 12, color: DB.textMid, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: DB.textMute }}>Khẩu phần:</span>{' '}
          <b style={{ color: DB.text }}>{alt.grams}g · {alt.kcal} kcal</b>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12.5, fontWeight: 700, color: DB.ink,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z" />
            </svg>
            {alt.score.toFixed(1)}
          </span>
          <DeltaPill value={alt.delta} />
          <span style={{ fontSize: 11, color: DB.textFaint }}>so với hiện tại</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', display: 'inline-flex' }}
          title={alt.favorite ? 'Đã yêu thích' : 'Đánh dấu yêu thích'}
          onClick={(e) => e.stopPropagation()}
        >
          <HeartIcon filled={!!alt.favorite} size={16} />
        </button>

        <RadioDot selected={isSelected} />
      </div>
    </div>
  );
}

function RadioDot({ selected }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: selected ? `5px solid ${DB.green}` : `2px solid ${DB.border}`,
        background: '#fff',
        transition: 'border-color .15s, border-width .15s',
        display: 'inline-block',
        boxSizing: 'border-box',
      }}
    />
  );
}

// =========================================================================
// SUGGESTION BANNER — đề xuất tự động để tăng điểm
// =========================================================================
function SwapSuggestionBanner() {
  return (
    <div
      style={{
        background: '#fef3c7',
        borderLeft: '4px solid #f59e0b',
        borderRadius: '0 10px 10px 0',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#78350f', lineHeight: 1.5 }}>
        <b>Gợi ý:</b> Đổi sang <b>Salad gà nướng</b> để tăng điểm lên <b>82.5</b>
      </div>
      <button
        style={{
          background: '#f59e0b',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        Áp dụng
      </button>
    </div>
  );
}

// =========================================================================
// SWAP DRAWER — full component (desktop side / mobile bottom-sheet)
// Props:
//   open          - bool
//   mobile        - bool (true → bottom sheet)
//   selectedIndex - 0-based index of pre-selected alt (for static demo)
//   showSuggestion- show the orange suggestion banner at bottom
// =========================================================================
function SwapDrawer({
  open = true,
  mobile = false,
  selectedIndex = 0,
  showSuggestion = false,
  confirmLoading = false,
  current = { slot: 'Món chính', name: 'Gà luộc', grams: 280, kcal: 380 },
  alternates = SWAP_ALTERNATES,
}) {
  if (!open) return null;

  // Container & panel positioning differs by viewport
  const panelStyle = mobile
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '75%',
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -10px 40px -10px rgba(0,0,0,.25), 0 -2px 8px rgba(0,0,0,.06)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 480,
        background: '#fff',
        borderLeft: `1px solid ${DB.border}`,
        boxShadow: '-12px 0 40px -10px rgba(0,0,0,.18), -2px 0 8px rgba(0,0,0,.04)',
        display: 'flex',
        flexDirection: 'column',
      };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,.4)',
        zIndex: 50,
        ...dbFont,
      }}
    >
      <div style={panelStyle}>
        {/* Mobile drag handle */}
        {mobile && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 4, background: '#e5e7eb' }} />
          </div>
        )}

        {/* ───── Header ───── */}
        <div
          style={{
            padding: mobile ? '12px 18px 16px' : '20px 22px',
            borderBottom: `1px solid ${DB.borderSoft}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: mobile ? 17 : 18, fontWeight: 700, color: DB.ink, letterSpacing: '-0.01em' }}>
              Đổi món: <span style={{ color: DB.greenDark }}>{current.slot}</span>
            </div>
            <div style={{ fontSize: 12.5, color: DB.textMute, marginTop: 4 }}>
              Đang là: <b style={{ color: DB.textMid }}>{current.name}</b> · {current.grams}g · {current.kcal} kcal
            </div>
          </div>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              padding: 6,
              borderRadius: 8,
              cursor: 'pointer',
              color: DB.textMid,
              display: 'flex',
              flexShrink: 0,
            }}
            title="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ───── Section heading + sort/filter row ───── */}
        <div style={{
          padding: mobile ? '14px 18px 8px' : '16px 22px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: DB.text }}>
            {alternates.length} lựa chọn thay thế
          </div>
          <button style={{
            background: 'transparent', border: 'none', padding: '4px 6px',
            fontSize: 12.5, color: DB.textMid, cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500,
          }}>
            Sắp xếp: <b style={{ color: DB.text }}>Điểm cao → thấp</b>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* ───── Scrollable body ───── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: mobile ? '4px 18px 16px' : '4px 22px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {alternates.map((alt, i) => (
            <AlternateCard
              key={i}
              alt={alt}
              selected={i === selectedIndex}
              mobile={mobile}
            />
          ))}
        </div>

        {/* ───── Sticky footer ───── */}
        <div
          style={{
            padding: mobile ? '12px 18px 18px' : '16px 22px 20px',
            borderTop: `1px solid ${DB.borderSoft}`,
            background: '#fff',
            flexShrink: 0,
          }}
        >
          {showSuggestion && <SwapSuggestionBanner />}
          <button
            disabled={selectedIndex < 0 || confirmLoading}
            style={{
              width: '100%',
              background: selectedIndex >= 0 ? DB.green : '#d1d5db',
              opacity: confirmLoading ? 0.7 : 1,
              color: '#fff',
              border: 'none',
              padding: '13px 18px',
              borderRadius: 12,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: (selectedIndex >= 0 && !confirmLoading) ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: (selectedIndex >= 0 && !confirmLoading) ? '0 4px 12px -4px rgba(5,150,105,.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {confirmLoading ? (
              <React.Fragment>
                <Spinner size={14} thin />
                Đang lưu...
              </React.Fragment>
            ) : (
              <React.Fragment>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5" />
                </svg>
                Xác nhận đổi món
              </React.Fragment>
            )}
          </button>
          {selectedIndex >= 0 && (
            <div style={{ fontSize: 11.5, color: DB.textMute, marginTop: 8, textAlign: 'center' }}>
              Sẽ đổi <b>{current.name}</b> → <b style={{ color: DB.text }}>{alternates[selectedIndex].name}</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SCENE WRAPPERS — meal page with drawer open on top
// =========================================================================
function NutritionWithDrawerDesktop({ selectedIndex = 0, showSuggestion = false }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <NutritionPlanDesktop collapsedSang={true} />
      <SwapDrawer open selectedIndex={selectedIndex} showSuggestion={showSuggestion} />
    </div>
  );
}

function NutritionWithDrawerMobile({ selectedIndex = 0, showSuggestion = false }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <NutritionPlanMobile />
      <SwapDrawer open mobile selectedIndex={selectedIndex} showSuggestion={showSuggestion} />
    </div>
  );
}

Object.assign(window, {
  SwapDrawer, AlternateCard, DeltaPill, SwapSuggestionBanner,
  SWAP_ALTERNATES,
  NutritionWithDrawerDesktop, NutritionWithDrawerMobile,
});
