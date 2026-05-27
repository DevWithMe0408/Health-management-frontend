// Nutrition Plan — Special States
// 1. Loading skeleton  2. Empty (no health data)  3. Warning goal modal
// 4. Score-drop banner  5. Suggestion banner

// =========================================================================
// 1) LOADING STATE — skeleton placeholders for 3 meal cards + spinner option
// =========================================================================
function LoadingState({ mobile = false, variant = 'skeleton' }) {
  if (variant === 'spinner') {
    return (
      <NutritionPageFrame mobile={mobile}>
        <div style={{ display: 'grid', placeItems: 'center', minHeight: mobile ? 520 : 640 }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <Spinner size={mobile ? 56 : 68} />
            <h3 style={{
              margin: '22px 0 6px', fontSize: mobile ? 17 : 19, fontWeight: 700, color: DB.ink,
              letterSpacing: '-0.01em',
            }}>
              Đang tính toán thực đơn tốt nhất cho bạn
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: DB.textMid, lineHeight: 1.55 }}>
              Hệ thống đang chấm điểm hàng ngàn tổ hợp món để chọn ra phương án tối ưu (~2–3 giây).
            </p>
          </div>
        </div>
      </NutritionPageFrame>
    );
  }

  // skeleton variant
  return (
    <NutritionPageFrame mobile={mobile}>
      <PageHeader mobile={mobile} />

      {/* Info strip skeleton */}
      <SkelLine width="100%" height={52} radius={12} style={{ marginBottom: mobile ? 16 : 20 }} />

      {/* 3 meal-card skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 14 : 18, marginBottom: 22 }}>
        <MealCardSkeleton mobile={mobile} />
        <MealCardSkeleton mobile={mobile} />
        <MealCardSkeleton mobile={mobile} />
      </div>

      {/* Footer skeleton */}
      <SkelLine width="100%" height={mobile ? 280 : 240} radius={16} />

      {/* tiny status pill at bottom */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: '#fff', boxShadow: '0 4px 14px -4px rgba(0,0,0,.15)',
        borderRadius: 999, padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12.5, color: DB.textMid, fontWeight: 500,
      }}>
        <Spinner size={14} thin />
        Đang gen thực đơn… (~2 giây)
      </div>
    </NutritionPageFrame>
  );
}

function MealCardSkeleton({ mobile = false }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${DB.border}`, borderRadius: 16,
      padding: mobile ? '16px' : '20px 24px',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkelLine width={mobile ? 38 : 44} height={mobile ? 38 : 44} radius={12} />
        <div style={{ flex: 1 }}>
          <SkelLine width={120} height={18} />
          <SkelLine width={80} height={12} style={{ marginTop: 6 }} />
        </div>
        <SkelLine width={70} height={24} radius={999} />
        <SkelLine width={110} height={28} radius={999} />
        <SkelLine width={32} height={32} radius={8} />
      </div>

      {/* Food rows */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SkelLine width={mobile ? 56 : 64} height={mobile ? 56 : 64} radius={10} />
            <div style={{ flex: 1 }}>
              <SkelLine width="40%" height={15} />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <SkelLine width={60} height={16} radius={6} />
                <SkelLine width={70} height={16} radius={6} />
              </div>
              <SkelLine width="65%" height={12} style={{ marginTop: 7 }} />
            </div>
            <SkelLine width={86} height={28} radius={10} />
          </div>
        ))}
      </div>

      {/* Macro bar */}
      <SkelLine width="100%" height={82} radius={12} style={{ marginTop: 16 }} />
    </div>
  );
}

function SkelLine({ width, height = 14, radius = 6, style }) {
  return (
    <div
      style={{
        width, height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        backgroundSize: '200% 100%',
        animation: 'dbShimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

function Spinner({ size = 24, thin = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'npSpin 0.9s linear infinite' }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth={thin ? 3 : 5} />
      <circle cx="25" cy="25" r="20" fill="none" stroke={DB.green} strokeWidth={thin ? 3 : 5}
        strokeLinecap="round" strokeDasharray="80 200" />
    </svg>
  );
}

// =========================================================================
// 2) EMPTY STATE — user chưa có health data
// =========================================================================
function EmptyState({ mobile = false }) {
  return (
    <NutritionPageFrame mobile={mobile}>
      <PageHeader mobile={mobile} />

      <div style={{
        background: '#fff',
        border: `1px solid ${DB.border}`,
        borderRadius: 16,
        padding: mobile ? '40px 22px' : '60px 32px',
        boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <SaladBowlIllustration size={mobile ? 140 : 180} />

        <h2 style={{
          margin: '24px 0 8px',
          fontSize: mobile ? 19 : 22,
          fontWeight: 700, color: DB.ink,
          letterSpacing: '-0.015em',
        }}>
          Bạn chưa có thông tin sức khỏe
        </h2>
        <p style={{
          margin: '0 0 24px',
          fontSize: 14, color: DB.textMid,
          maxWidth: 420, lineHeight: 1.6,
        }}>
          Cần cập nhật <b>cân nặng</b>, <b>chiều cao</b> và 1 vài chỉ số cơ bản trước khi hệ thống có thể đề xuất thực đơn phù hợp với bạn.
        </p>

        <BtnPrimary style={{ padding: '12px 22px', fontSize: 14.5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4v16h16v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Vào trang Cập nhật chỉ số →
        </BtnPrimary>

        {/* Helper checklist */}
        <div style={{
          marginTop: 28, paddingTop: 22,
          borderTop: `1px solid ${DB.borderSoft}`,
          width: '100%', maxWidth: 380,
        }}>
          <div style={{ fontSize: 11.5, color: DB.textMute, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Cần ít nhất 3 thông tin
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ChecklistItem label="Cân nặng (kg)" />
            <ChecklistItem label="Chiều cao (cm)" />
            <ChecklistItem label="Vòng eo (cm)" optional />
          </div>
        </div>
      </div>
    </NutritionPageFrame>
  );
}

function ChecklistItem({ label, optional }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: DB.textMid }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5,
        border: `1.5px solid ${DB.border}`, background: '#fff', flexShrink: 0,
        display: 'grid', placeItems: 'center',
      }}>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: DB.border }} />
      </span>
      {label}
      {optional && (
        <span style={{ fontSize: 11, color: DB.textFaint, fontWeight: 500 }}>
          (khuyến nghị)
        </span>
      )}
    </div>
  );
}

// Salad bowl — simple line-art SVG
function SaladBowlIllustration({ size = 180 }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 240 180" fill="none" stroke={DB.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* steam wisps */}
      <path d="M90 30 Q95 22 90 14" opacity="0.4" />
      <path d="M120 26 Q126 16 120 6"  opacity="0.4" />
      <path d="M150 30 Q156 22 150 14" opacity="0.4" />

      {/* Bowl outline */}
      <path d="M40 90 Q120 105 200 90 L185 150 Q120 170 55 150 Z" fill="#ecfdf5" />
      <path d="M40 90 Q120 75 200 90" fill="#fff" />

      {/* Lettuce / leaves on top */}
      <ellipse cx="80" cy="85" rx="22" ry="12" fill="#bbf7d0" stroke="#10b981" />
      <ellipse cx="160" cy="85" rx="22" ry="12" fill="#bbf7d0" stroke="#10b981" />
      <ellipse cx="120" cy="78" rx="28" ry="14" fill="#86efac" stroke="#059669" />

      {/* Cherry tomatoes */}
      <circle cx="98" cy="80" r="6" fill="#fca5a5" stroke="#dc2626" />
      <circle cx="135" cy="82" r="5" fill="#fca5a5" stroke="#dc2626" />
      <circle cx="148" cy="76" r="4.5" fill="#fca5a5" stroke="#dc2626" />

      {/* Carrot slice */}
      <circle cx="76" cy="78" r="4" fill="#fdba74" stroke="#ea580c" />
      <circle cx="112" cy="82" r="3.5" fill="#fdba74" stroke="#ea580c" />

      {/* bowl base shadow */}
      <ellipse cx="120" cy="160" rx="55" ry="6" fill={DB.borderSoft} stroke="none" opacity="0.6" />

      {/* fork on the side */}
      <path d="M210 120 L210 165" stroke={DB.textMute} strokeWidth="2.5" />
      <path d="M205 100 L205 122 M210 96 L210 122 M215 100 L215 122" stroke={DB.textMute} strokeWidth="2" />
    </svg>
  );
}

// =========================================================================
// 3) WARNING GOAL MODAL — thể trạng không phù hợp mục tiêu
// =========================================================================
function WarningGoalModal({ mobile = false, background = 'plan' }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...dbFont }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(1.5px) saturate(.85)', opacity: 0.45 }}>
        {background === 'plan'
          ? (mobile ? <NutritionPlanMobile /> : <NutritionPlanDesktop collapsedSang />)
          : <div style={{ background: DB.bg, width: '100%', height: '100%' }} />}
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15,23,42,.55)', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: mobile ? 20 : 40,
      }}>
        <div style={{
          width: '100%', maxWidth: 480,
          background: '#fff',
          borderRadius: 18,
          padding: mobile ? '24px 22px' : '30px 32px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,.4)',
        }}>
          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#fef3c7',
              display: 'grid', placeItems: 'center',
              boxShadow: 'inset 0 0 0 4px #fde68a',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9"  x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>

          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 700, color: DB.ink,
            letterSpacing: '-0.01em', textAlign: 'center',
          }}>
            Cảnh báo về mục tiêu
          </h2>
          <p style={{
            margin: '12px 0 6px', fontSize: 14, color: DB.textMid,
            lineHeight: 1.6, textAlign: 'center',
          }}>
            Bạn đang <b style={{ color: '#b45309' }}>thừa cân</b> nhưng chọn mục tiêu <b style={{ color: '#b45309' }}>Tăng cân</b>.
          </p>
          <p style={{
            margin: '0 0 20px', fontSize: 13.5, color: DB.textMute,
            lineHeight: 1.6, textAlign: 'center',
          }}>
            Khuyến nghị đổi sang mục tiêu <b>Giảm cân</b> hoặc <b>Duy trì</b> để bảo vệ sức khỏe.
          </p>

          {/* Risk indicator */}
          <div style={{
            background: '#fef3c7', borderLeft: '4px solid #f59e0b',
            borderRadius: '0 8px 8px 0',
            padding: '10px 12px', marginBottom: 22,
            fontSize: 12.5, color: '#78350f', lineHeight: 1.5,
          }}>
            <b>BMI hiện tại:</b> 27.8 (Thừa cân, ngưỡng béo phì WHO Asia: 25)
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row-reverse',
            gap: 10,
          }}>
            <BtnPrimary style={{ flex: 1, justifyContent: 'center', padding: '11px 18px' }}>
              Đổi mục tiêu
            </BtnPrimary>
            <BtnOutline style={{ flex: 1, justifyContent: 'center', padding: '11px 18px' }}>
              Tôi hiểu, tiếp tục
            </BtnOutline>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4) SCORE-DROP WARNING BANNER — sau khi swap mà score sụt mạnh
// =========================================================================
function ScoreDropBanner({ from = 87.5, to = 62.3, mobile = false }) {
  return (
    <div style={{
      background: '#fed7aa',
      borderLeft: '4px solid #f97316',
      borderRadius: '0 12px 12px 0',
      padding: '14px 16px',
      display: 'flex',
      alignItems: mobile ? 'flex-start' : 'center',
      flexDirection: mobile ? 'column' : 'row',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(249,115,22,.18)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a3412" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9"  x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#7c2d12', letterSpacing: '-0.005em' }}>
            Điểm bữa này giảm mạnh sau khi đổi món
          </div>
          <div style={{ fontSize: 13, color: '#9a3412', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontVariantNumeric: 'tabular-nums' }}>
            Từ <ScoreInlinePill score={from} tier="good" /> xuống <ScoreInlinePill score={to} tier="bad" />
            <span style={{
              padding: '2px 7px', borderRadius: 6,
              background: 'rgba(120,53,15,.12)', color: '#7c2d12',
              fontSize: 11.5, fontWeight: 700,
            }}>
              −{(from - to).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0, width: mobile ? '100%' : 'auto' }}>
        <button style={{
          background: '#fff', color: '#9a3412',
          border: '1px solid #fdba74', padding: '7px 12px', borderRadius: 8,
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          flex: mobile ? 1 : 'initial',
        }}>
          Giữ thay đổi
        </button>
        <button style={{
          background: '#9a3412', color: '#fff',
          border: 'none', padding: '7px 12px', borderRadius: 8,
          fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          flex: mobile ? 1 : 'initial',
        }}>
          ↶ Quay lại trạng thái cũ
        </button>
      </div>
    </div>
  );
}

function ScoreInlinePill({ score, tier = 'good' }) {
  const m = tier === 'good'
    ? { bg: '#d1fae5', fg: '#065f46' }
    : tier === 'mid'
    ? { bg: '#fef3c7', fg: '#92400e' }
    : { bg: '#fed7aa', fg: '#7c2d12' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 999,
      background: m.bg, color: m.fg, fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ fontSize: 8 }}>★</span>
      {score.toFixed(1)}
    </span>
  );
}

// =========================================================================
// 5) SUGGESTION BANNER — BE gợi ý đổi để tăng score (dismissible)
// =========================================================================
function SuggestionBanner({
  from = 'Rau muống xào',
  to = 'Salad gà nướng',
  newScore = 82.5,
  mobile = false,
}) {
  return (
    <div style={{
      background: '#fef3c7',
      borderLeft: '4px solid #f59e0b',
      borderRadius: '0 12px 12px 0',
      padding: '12px 14px',
      display: 'flex',
      alignItems: mobile ? 'flex-start' : 'center',
      flexDirection: mobile ? 'column' : 'row',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(245,158,11,.18)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
          fontSize: 16,
        }}>💡</div>
        <div style={{ minWidth: 0, flex: 1, fontSize: 13, color: '#78350f', lineHeight: 1.55 }}>
          <b>Gợi ý:</b> Đổi <b>{from}</b> sang <b>{to}</b> sẽ tăng điểm bữa lên{' '}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '1px 7px', borderRadius: 999, marginLeft: 2,
            background: '#d1fae5', color: '#065f46',
            fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{ fontSize: 8 }}>★</span>{newScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, width: mobile ? '100%' : 'auto' }}>
        <button style={{
          background: '#f59e0b', color: '#fff',
          border: 'none', padding: '7px 14px', borderRadius: 8,
          fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          flex: mobile ? 1 : 'initial',
        }}>
          Áp dụng
        </button>
        <button style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'transparent', border: 'none',
          color: '#92400e', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }} title="Bỏ qua">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// SCENE WRAPPERS — banners shown above meal cards on the real page
// =========================================================================
function PlanWithScoreDropBanner({ mobile = false }) {
  return (
    <NutritionPageFrame mobile={mobile}>
      <PageHeader mobile={mobile} />
      <InfoStrip goal="Giảm cân" tdee={2100} constitution="Cân đối" mobile={mobile} />
      <div style={{ marginBottom: mobile ? 14 : 18 }}>
        <ScoreDropBanner mobile={mobile} />
      </div>
      <MealCard
        meal={{ ...MEAL_DATA.trua, score: 62.3, totals: { kcal: 980, p: 26, f: 38, c: 110 } }}
        mobile={mobile}
      />
    </NutritionPageFrame>
  );
}

function PlanWithSuggestionBanner({ mobile = false }) {
  return (
    <NutritionPageFrame mobile={mobile}>
      <PageHeader mobile={mobile} />
      <InfoStrip goal="Giảm cân" tdee={2100} constitution="Cân đối" mobile={mobile} />
      <div style={{ marginBottom: mobile ? 14 : 18 }}>
        <SuggestionBanner mobile={mobile} />
      </div>
      <MealCard meal={MEAL_DATA.toi} mobile={mobile} />
    </NutritionPageFrame>
  );
}

// =========================================================================
// Inject shimmer + spin keyframes (one-time)
// =========================================================================
if (typeof document !== 'undefined' && !document.getElementById('np-states-keyframes')) {
  const s = document.createElement('style');
  s.id = 'np-states-keyframes';
  s.textContent = [
    '@keyframes dbShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }',
    '@keyframes npSpin { to { transform: rotate(360deg) } }',
  ].join('\n');
  document.head.appendChild(s);
}

Object.assign(window, {
  LoadingState, EmptyState, WarningGoalModal,
  ScoreDropBanner, SuggestionBanner,
  PlanWithScoreDropBanner, PlanWithSuggestionBanner,
  Spinner, SkelLine, SaladBowlIllustration, MealCardSkeleton,
});
