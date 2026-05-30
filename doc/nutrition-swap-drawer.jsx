// Nutrition Plan — Swap Drawer ("Đổi món")
// Desktop: side drawer 480px slide from right
// Mobile:  bottom sheet 75% height slide from bottom

// Format số khẩu phần: integer bỏ ".0" (2 không phải 2.0); 0.5/1.5 giữ 1 chữ số
function fmtServing(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// 10 lựa chọn thay thế Món chính bữa Trưa (đang là Gà luộc)
// serving + unit: đơn vị khẩu phần Việt từ DB (bát, đĩa, phần, chén, khúc...)
const SWAP_ALTERNATES = [
  { name: 'Mực xào sa tế',     group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  serving: 1, unit: 'đĩa nhỏ', grams: 120, kcal: 250, score: 89.2, delta: 1.7 },
  { name: 'Bò xào cần tỏi',     group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  serving: 1, unit: 'đĩa',     grams: 150, kcal: 280, score: 88.5, delta: 1.0 },
  { name: 'Cá kho tộ',          group: 'CA',      groupLabel: 'CÁ',       serving: 1, unit: 'phần',    grams: 200, kcal: 320, score: 86.3, delta: -1.2 },
  { name: 'Tôm rim',            group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  serving: 1, unit: 'đĩa nhỏ', grams: 130, kcal: 220, score: 85.8, delta: -1.7 },
  { name: 'Sườn ram',           group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  serving: 1, unit: 'đĩa',     grams: 180, kcal: 340, score: 84.1, delta: -3.4 },
  { name: 'Thịt heo luộc',      group: 'THIT_DO', groupLabel: 'THỊT ĐỎ',  serving: 1, unit: 'đĩa',     grams: 200, kcal: 290, score: 83.5, delta: -4.0 },
  { name: 'Vịt quay',           group: 'GIA_CAM', groupLabel: 'GIA CẦM',  serving: 1, unit: 'phần',    grams: 160, kcal: 380, score: 82.2, delta: -5.3 },
  { name: 'Trứng kho thịt',     group: 'TRUNG',   groupLabel: 'TRỨNG',    serving: 1, unit: 'chén',    grams: 140, kcal: 260, score: 80.8, delta: -6.7, favorite: true },
  { name: 'Lươn xào lăn',       group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  serving: 1, unit: 'đĩa',     grams: 150, kcal: 310, score: 78.5, delta: -9.0 },
  { name: 'Ếch xào sả ớt',      group: 'HAI_SAN', groupLabel: 'HẢI SẢN',  serving: 1, unit: 'đĩa nhỏ', grams: 140, kcal: 270, score: 76.0, delta: -11.5 },
];

// Kết quả search "cơm" — slot Tinh bột (S2)
const SEARCH_COM = [
  { name: 'Cơm trắng',      group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT', serving: 2,   unit: 'bát', grams: 200, kcal: 220, score: 86.8, delta: 0.6,  expectedServing: 2 },
  { name: 'Cơm gạo lứt',    group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT', serving: 1.5, unit: 'bát', grams: 165, kcal: 180, score: 88.4, delta: 2.2,  expectedServing: 1.5 },
  { name: 'Cơm tấm',        group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT', serving: 1,   unit: 'đĩa', grams: 220, kcal: 290, score: 82.1, delta: -4.1, expectedServing: 1 },
  { name: 'Xôi đậu xanh',   group: 'TINH_BOT_GAO', groupLabel: 'TINH BỘT', serving: 1,   unit: 'phần', grams: 180, kcal: 320, score: 79.5, delta: -6.7, expectedServing: 1 },
];

// Kết quả search "cá" — slot Món chính (S3)
const SEARCH_CA = [
  { name: 'Cá kho tộ',       group: 'CA', groupLabel: 'CÁ', serving: 1, unit: 'phần', grams: 200, kcal: 320, score: 86.3, delta: -1.2, expectedServing: 1 },
  { name: 'Cá thu chiên',    group: 'CA', groupLabel: 'CÁ', serving: 1, unit: 'khúc', grams: 160, kcal: 280, score: 84.7, delta: -2.8, expectedServing: 1 },
  { name: 'Cá hồi áp chảo',  group: 'CA', groupLabel: 'CÁ', serving: 1, unit: 'phần', grams: 150, kcal: 312, score: 89.1, delta: 1.6,  expectedServing: 1 },
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
          <b style={{ color: DB.text }}>{fmtServing(alt.serving)} {alt.unit} ({alt.grams}g) · {alt.kcal} kcal</b>
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
// SUGGESTION BANNER — amber, 2 mode
//   mode 'suggest' (A): 1 nút "Áp dụng" — gợi ý tăng điểm sau apply
//   mode 'warn'    (B): 2 nút "Vẫn áp dụng" (outline) + "Điều chỉnh lại" (ghost)
// =========================================================================
function SwapSuggestionBanner({
  mode = 'suggest',
  text,
}) {
  const body = text || (
    <React.Fragment><b>Gợi ý:</b> Đổi sang <b>Salad gà nướng</b> để tăng điểm lên <b>82.5</b></React.Fragment>
  );
  return (
    <div
      style={{
        background: '#fef3c7',
        borderLeft: '4px solid #f59e0b',
        borderRadius: '0 10px 10px 0',
        padding: '11px 13px',
        display: 'flex',
        alignItems: mode === 'warn' ? 'flex-start' : 'center',
        gap: 10,
        marginBottom: 10,
        flexWrap: mode === 'warn' ? 'wrap' : 'nowrap',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>💡</span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#78350f', lineHeight: 1.5 }}>
        {body}
      </div>
      {mode === 'warn' ? (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 26 }}>
          <button
            style={{
              background: '#fff', color: '#92400e',
              border: '1px solid #f59e0b', padding: '6px 12px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Vẫn áp dụng
          </button>
          <button
            style={{
              background: 'transparent', color: '#92400e',
              border: 'none', padding: '6px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Điều chỉnh lại
          </button>
        </div>
      ) : (
        <button
          style={{
            background: '#f59e0b', color: '#fff', border: 'none',
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          Áp dụng
        </button>
      )}
    </div>
  );
}

// =========================================================================
// SEARCH BAR — tìm món cùng slot
// =========================================================================
function SearchBar({ value = '', mobile = false, onClear }) {
  const hasValue = value && value.length > 0;
  return (
    <div style={{ padding: mobile ? '14px 18px' : '16px 22px', flexShrink: 0 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 12, display: 'flex', color: DB.textMute, pointerEvents: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          type="text"
          defaultValue={value}
          placeholder="Tìm món... (vd: cơm trắng, cá kho)"
          aria-label="Tìm món"
          style={{
            width: '100%', height: 40, padding: '0 38px',
            border: `1px solid ${DB.border}`, borderRadius: 10, background: '#fff',
            fontSize: 14, color: DB.text, fontFamily: 'inherit', outline: 'none',
            boxShadow: hasValue ? `0 0 0 2px ${DB.green}, 0 0 0 4px rgba(5,150,105,.12)` : 'none',
          }}
        />
        {hasValue && (
          <button
            onClick={onClear}
            title="Xoá tìm kiếm"
            style={{
              position: 'absolute', right: 10, display: 'flex', padding: 2,
              background: 'transparent', border: 'none', cursor: 'pointer', color: DB.textMute,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// PINNED STRIP — món đã ghim ở slot KHÁC của cùng bữa
// =========================================================================
function PinnedStrip({ pins = [], mobile = false }) {
  if (!pins.length) return null;
  return (
    <div style={{
      background: DB.green50, borderBottom: `1px solid ${DB.borderSoft}`,
      padding: mobile ? '10px 18px' : '12px 22px', flexShrink: 0,
    }}>
      <div style={{
        fontSize: 11.5, fontWeight: 600, color: DB.textMute,
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        Đang ghim · sẽ giữ nguyên khi áp dụng
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {pins.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            background: '#fff', border: `1px solid ${DB.border}`, borderRadius: 8,
            padding: '6px 10px',
          }}>
            <FoodThumb name={p.name} group={p.group} size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: DB.text,
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: DB.textMute, fontVariantNumeric: 'tabular-nums' }}>
                {fmtServing(p.serving)} {p.unit} ({p.grams}g)
              </div>
            </div>
            <button
              title="Bỏ ghim"
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'flex', padding: 2, background: 'transparent', border: 'none', cursor: 'pointer', color: DB.textMute, flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// SERVING STEPPER — chỉnh khẩu phần món đang chọn (trong footer)
// =========================================================================
function ServingStepper({ name, serving, unit, grams, expectedServing = serving }) {
  const min = 0.5;
  const max = Math.round(1.5 * expectedServing * 10) / 10;
  const atMin = serving <= min;
  const atMax = serving >= max;
  const stepBtn = (disabled, plus) => (
    <button
      disabled={disabled}
      title={plus ? 'Tăng khẩu phần' : 'Giảm khẩu phần'}
      style={{
        width: 36, height: 36, border: `1.5px solid ${DB.green}`, borderRadius: 8,
        background: '#fff', color: DB.greenDark, display: 'grid', placeItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1, flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {plus ? <path d="M12 5v14M5 12h14" /> : <path d="M5 12h14" />}
      </svg>
    </button>
  );
  return (
    <div style={{
      background: DB.green50, border: '1px solid #bbf7d0', borderRadius: 12,
      padding: '14px 16px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: DB.greenDark, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Khẩu phần
          </div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: DB.ink, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {stepBtn(atMin, false)}
          <div style={{ margin: '0 12px', textAlign: 'center', minWidth: 90 }}>
            <div style={{ lineHeight: 1.1 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: DB.ink, fontVariantNumeric: 'tabular-nums' }}>{fmtServing(serving)}</span>
              <span style={{ fontSize: 14, color: DB.textMid, fontWeight: 500 }}> {unit}</span>
            </div>
            <div style={{ fontSize: 11.5, color: DB.textFaint, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>≈ {grams}g</div>
          </div>
          {stepBtn(atMax, true)}
        </div>
      </div>
      <div style={{ fontSize: 12, color: DB.textMute, marginTop: 8, textAlign: 'center' }}>
        Bước 0.5 {unit} · Min {fmtServing(min)} · Max {fmtServing(max)}
      </div>
    </div>
  );
}

// =========================================================================
// SWAP DRAWER — full component (desktop side / mobile bottom-sheet)
// Props:
//   open          - bool
//   mobile        - bool (true → bottom sheet)
//   selectedIndex - 0-based index of selected alt (-1 = chưa chọn)
//   showSuggestion- mode A suggestion banner trên nút Áp dụng
//   query         - search text (rỗng = chế độ "Gợi ý")
//   pins          - [{name, group, serving, unit, grams}] strip "Đang ghim"
//   warnMode      - null | { text } → thay nút Áp dụng bằng banner mode B
//   keepNames     - chuỗi 2 món còn lại sẽ giữ nguyên (phụ đề nút)
//   stepperOverride - { serving, grams } ghi đè khẩu phần item đang chọn
// =========================================================================
function SwapDrawer({
  open = true,
  mobile = false,
  selectedIndex = 0,
  showSuggestion = false,
  confirmLoading = false,
  query = '',
  pins = [],
  warnMode = null,
  keepNames = 'Canh rau dền + Cơm trắng',
  stepperOverride = null,
  current = { slot: 'Món chính', name: 'Gà luộc', grams: 280, kcal: 380 },
  alternates = SWAP_ALTERNATES,
}) {
  if (!open) return null;
  const hasResults = alternates.length > 0;
  const sel = selectedIndex >= 0 ? alternates[selectedIndex] : null;

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

        {/* ───── Pinned strip (Đang ghim) ───── */}
        <PinnedStrip pins={pins} mobile={mobile} />

        {/* ───── Search bar ───── */}
        <SearchBar value={query} mobile={mobile} />

        {/* ───── Section heading + static sort caption ───── */}
        <div style={{
          padding: mobile ? '4px 18px 8px' : '4px 22px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: DB.text }}>
            {query
              ? <React.Fragment>{alternates.length} kết quả cho “{query}”</React.Fragment>
              : `${alternates.length} lựa chọn thay thế`}
          </div>
          <div style={{
            fontSize: 12.5, color: DB.textMute, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            Điểm cao → thấp
          </div>
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
          {hasResults ? (
            alternates.map((alt, i) => (
              <AlternateCard
                key={i}
                alt={alt}
                selected={i === selectedIndex}
                mobile={mobile}
              />
            ))
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center', padding: '40px 20px', gap: 14,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={DB.textFaint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
              </svg>
              <div style={{ fontSize: 13.5, color: DB.textMute }}>
                Không tìm thấy món nào với “{query}”
              </div>
              <BtnOutline size="sm">Xóa tìm kiếm</BtnOutline>
            </div>
          )}
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
          {/* Mode A suggestion banner (above apply) */}
          {showSuggestion && !warnMode && <SwapSuggestionBanner />}

          {/* Serving stepper — chỉ khi đã chọn 1 món */}
          {sel && (
            <ServingStepper
              name={sel.name}
              serving={stepperOverride ? stepperOverride.serving : sel.serving}
              unit={sel.unit}
              grams={stepperOverride ? stepperOverride.grams : sel.grams}
              expectedServing={sel.expectedServing != null ? sel.expectedServing : sel.serving}
            />
          )}

          {warnMode ? (
            /* Mode B soft-warning banner thay nút Áp dụng */
            <SwapSuggestionBanner mode="warn" text={warnMode.text} />
          ) : (
            <React.Fragment>
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
                    Áp dụng & cân đối lại bữa
                  </React.Fragment>
                )}
              </button>
              {selectedIndex >= 0 && (
                <div style={{ fontSize: 11.5, color: DB.textMute, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
                  Giữ nguyên <b style={{ color: DB.textMid }}>{keepNames}</b>, hệ thống tự cân đối khẩu phần
                </div>
              )}
            </React.Fragment>
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
  SearchBar, PinnedStrip, ServingStepper, fmtServing,
  SWAP_ALTERNATES, SEARCH_COM, SEARCH_CA,
  NutritionWithDrawerDesktop, NutritionWithDrawerMobile,
});
