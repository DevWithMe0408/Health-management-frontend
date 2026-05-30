// Nutrition Plan — MealCard (default + alt variation) + MealCollapsed

// =========================================================================
// FOOD ROW — one item inside the topCombination
// =========================================================================
function FoodRow({ food, last = false, dense = false, pinned = false }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: dense ? '12px 0' : '14px 0',
        paddingLeft: pinned ? 12 : 0,
        borderLeft: pinned ? `4px solid ${DB.green}` : 'none',
        borderBottom: last ? 'none' : `1px solid ${DB.borderSoft}`,
      }}
    >
      <FoodThumb name={food.name} group={food.group} size={dense ? 56 : 64} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: DB.ink, letterSpacing: '-0.005em' }}>
            {food.name}
          </span>
          {pinned && (
            <span
              title="Đã ghim - bấm để bỏ ghim"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 22, height: 22, display: 'grid', placeItems: 'center',
                background: DB.green50, border: `1px solid ${DB.green}`, borderRadius: 6,
                cursor: 'pointer', fontSize: 13, lineHeight: 1, flexShrink: 0,
              }}
            >
              📌
            </span>
          )}
          <button
            style={{
              background: 'transparent',
              border: 'none',
              padding: 2,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title={food.favorite ? 'Đã yêu thích' : 'Đánh dấu yêu thích'}
          >
            <HeartIcon filled={!!food.favorite} size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
          <SlotChip>{food.slot}</SlotChip>
          <FoodGroupChip>{food.groupLabel}</FoodGroupChip>
        </div>

        <div style={{ fontSize: 12.5, color: DB.textMid, marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>
          {food.serving != null ? (
            <b style={{ color: DB.text }}>{fmtServing(food.serving)} {food.unit} ({food.grams}g)</b>
          ) : (
            <b style={{ color: DB.text }}>{food.grams}g</b>
          )}
          <Sep />
          <b style={{ color: DB.text }}>{food.kcal} kcal</b>
          <Sep />
          P {food.p}g
          <Sep />
          F {food.f}g
          <Sep />
          C {food.c}g
        </div>
      </div>

      <BtnOutline size="sm" style={{ flexShrink: 0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5" />
        </svg>
        Đổi món
      </BtnOutline>
    </div>
  );
}

function Sep() {
  return <span style={{ color: DB.textFaint, margin: '0 7px' }}>·</span>;
}

// =========================================================================
// MEAL CARD — main component
// Props:
//   meal      — { id, name, icon, target, status, score, foods, totals }
//   variant   — 'default' | 'ring'
//   collapsed — boolean
// =========================================================================
function MealCard({ meal, variant = 'default', collapsed = false, mobile = false, confirmLoading = false, suggestion = null }) {
  const isOpen = !collapsed;
  const pinnedCount = (meal.foods || []).filter((f) => f.pinned).length;

  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${DB.border}`,
        borderRadius: 16,
        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)',
        overflow: 'hidden',
      }}
    >
      {/* ───── Header ───── */}
      <div
        style={{
          padding: mobile ? '16px 16px' : '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: isOpen ? `1px solid ${DB.borderSoft}` : 'none',
          flexWrap: 'wrap',
          rowGap: 10,
        }}
      >
        {/* meal name + target */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 }}>
          <div
            style={{
              width: mobile ? 38 : 44,
              height: mobile ? 38 : 44,
              borderRadius: 12,
              background: meal.iconBg || '#fef3c7',
              display: 'grid',
              placeItems: 'center',
              fontSize: mobile ? 20 : 22,
              flexShrink: 0,
            }}
          >
            {meal.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: mobile ? 17 : 19, fontWeight: 700, color: DB.ink, letterSpacing: '-0.01em' }}>
              {meal.name}
            </div>
            <div style={{ fontSize: 12.5, color: DB.textMute, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              Target: <b style={{ color: DB.textMid }}>{meal.target} kcal</b>
            </div>
          </div>
        </div>

        {/* Status pill */}
        <StatusPill status={meal.status} />

        {/* Pinned-count chip */}
        {pinnedCount > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 11px', borderRadius: 999,
            background: DB.green50, color: DB.greenDark,
            fontSize: 12.5, fontWeight: 600,
            boxShadow: 'inset 0 0 0 1px #bbf7d0', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 12, lineHeight: 1 }}>📌</span>
            {pinnedCount} món đã ghim
          </span>
        )}

        {/* Score + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScoreBadge score={meal.score} />
          <button
            style={{
              background: 'transparent',
              border: `1px solid ${DB.border}`,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: DB.textMid,
            }}
            title={isOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            <Chevron open={isOpen} />
          </button>
        </div>
      </div>

      {/* ───── Collapsed body ───── */}
      {!isOpen && (
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa' }}>
          <span style={{ fontSize: 13.5, color: DB.textMid, lineHeight: 1.5 }}>
            {meal.foods.map((f) => f.name).join(' · ')}
            <span style={{ color: DB.textFaint, margin: '0 8px' }}>—</span>
            <b style={{ color: DB.text, fontVariantNumeric: 'tabular-nums' }}>{meal.totals.kcal} kcal</b>
          </span>
        </div>
      )}

      {/* ───── Expanded body ───── */}
      {isOpen && (
        <div style={{ padding: mobile ? '4px 16px 16px' : '8px 24px 22px' }}>
          {/* A5 — suggestion banner (sau apply, điểm thấp) */}
          {suggestion && (
            <div style={{
              background: '#fef3c7', borderLeft: '4px solid #f59e0b',
              borderRadius: '0 10px 10px 0', padding: '12px 14px',
              margin: '4px 0 16px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#78350f', lineHeight: 1.5 }}>
                {suggestion.text}
              </div>
              <button style={{
                background: '#f59e0b', color: '#fff', border: 'none',
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
              }}>
                Áp dụng gợi ý
              </button>
              <button
                title="Bỏ qua gợi ý"
                style={{
                  background: 'transparent', border: 'none', padding: 2, cursor: 'pointer',
                  color: '#78350f', opacity: 0.5, display: 'flex', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Food list */}
          <div>
            {meal.foods.map((f, i) => (
              <FoodRow key={i} food={f} last={i === meal.foods.length - 1} pinned={!!f.pinned} />
            ))}
          </div>

          {/* Macro block — default bars OR ring variation */}
          <div style={{ marginTop: 16 }}>
            {variant === 'ring' ? (
              <MacroRingRow
                kcal={meal.totals.kcal} kcalTarget={meal.target}
                p={meal.totals.p}        pTarget={meal.targets?.p ?? Math.round(meal.target * 0.2 / 4)}
                f={meal.totals.f}        fTarget={meal.targets?.f ?? Math.round(meal.target * 0.27 / 9)}
                c={meal.totals.c}        cTarget={meal.targets?.c ?? Math.round(meal.target * 0.53 / 4)}
              />
            ) : (
              <MacroBar
                kcal={meal.totals.kcal} kcalTarget={meal.target}
                p={meal.totals.p}        pTarget={meal.targets?.p ?? Math.round(meal.target * 0.2 / 4)}
                f={meal.totals.f}        fTarget={meal.targets?.f ?? Math.round(meal.target * 0.27 / 9)}
                c={meal.totals.c}        cTarget={meal.targets?.c ?? Math.round(meal.target * 0.53 / 4)}
              />
            )}
          </div>

          {/* Action buttons */}
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <BtnGhost>Bỏ qua</BtnGhost>
            <BtnPrimary
              size="sm"
              disabled={confirmLoading}
              style={confirmLoading ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
            >
              {confirmLoading ? (
                <React.Fragment>
                  <Spinner size={14} thin />
                  Đang lưu...
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Đánh dấu đã ăn
                </React.Fragment>
              )}
            </BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MealCard, FoodRow });
