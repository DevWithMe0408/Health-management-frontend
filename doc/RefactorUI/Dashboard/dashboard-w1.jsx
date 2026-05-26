// Widget 1 — Constitution card
// Variants: NORMAL (4 constitutions), INCOMPLETE (BMI only), EMPTY, LOADING, WARNING (model down)

const CONSTITUTION_META = {
  GAY: {
    label: 'GẦY',
    color: DB.amber500,
    bg: '#fffbeb',
    border: '#fde68a',
    glyph: 'thin',
    advice: 'Nên tăng cân lành mạnh, ưu tiên đạm + tinh bột tốt',
  },
  CAN_DOI: {
    label: 'CÂN ĐỐI',
    color: DB.green,
    bg: DB.green50,
    border: DB.green200,
    glyph: 'check',
    advice: 'Duy trì chế độ ăn cân bằng và vận động đều đặn',
  },
  THUA_CAN: {
    label: 'THỪA CÂN',
    color: DB.orange600,
    bg: DB.orange50,
    border: '#fed7aa',
    glyph: 'warn',
    advice: 'Cân nhắc giảm tinh bột tinh chế, tăng rau xanh + vận động',
  },
  BEO_PHI: {
    label: 'BÉO PHÌ',
    color: DB.red600,
    bg: DB.red50,
    border: '#fecaca',
    glyph: 'warn',
    advice: 'Cần giảm cân có kế hoạch, tham khảo bác sĩ dinh dưỡng',
  },
};

function ConstitutionGlyph({ type, color }) {
  if (type === 'check') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.75" />
        <path d="M7 12.5l3.5 3.5L17 9" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'warn') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 21h20L12 2z" stroke={color} strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M12 10v5M12 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // thin (GAY)
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.5" stroke={color} strokeWidth="1.75" />
      <path d="M10 9v6l-1.5 6M14 9v6l1.5 6M9 14h6" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

// BMI scale bar: 4 segments with marker
function BmiScaleBar({ bmi }) {
  // segments: <18.5 GAY, <23 CAN_DOI, <25 THUA_CAN, >=25 BEO_PHI
  // map bmi to 0-100% with anchor points 14 -> 0%, 30 -> 100%
  const MIN = 14, MAX = 30;
  const pct = Math.max(2, Math.min(98, ((bmi - MIN) / (MAX - MIN)) * 100));
  const segments = [
    { color: DB.amber500, w: ((18.5 - MIN) / (MAX - MIN)) * 100, label: '<18.5' },
    { color: DB.green, w: ((23 - 18.5) / (MAX - MIN)) * 100, label: '18.5-23' },
    { color: DB.orange600, w: ((25 - 23) / (MAX - MIN)) * 100, label: '23-25' },
    { color: DB.red600, w: ((MAX - 25) / (MAX - MIN)) * 100, label: '≥25' },
  ];
  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          gap: 2,
        }}
      >
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${s.w}%`, background: s.color, opacity: 0.85 }} />
        ))}
        <div
          style={{
            position: 'absolute',
            left: `${pct}%`,
            top: -4,
            transform: 'translateX(-50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            border: `3px solid ${DB.ink}`,
            boxShadow: '0 2px 4px rgba(0,0,0,.2)',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10.5,
          color: DB.textMute,
          marginTop: 8,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>14</span>
        <span>18.5</span>
        <span>23</span>
        <span>25</span>
        <span>30+</span>
      </div>
    </div>
  );
}

// Main widget
function W1Constitution({
  state = 'normal',
  constitution = 'CAN_DOI',
  bmi = 22.1,
  pbf = 15.4,
  updatedDaysAgo = 2,
  pbfSource = 'FORMULA',
  warning = null,
  modelDown = false,
}) {
  if (state === 'loading') return <W1Loading />;
  if (state === 'empty') return <W1Empty />;

  const meta = CONSTITUTION_META[constitution];

  return (
    <Card title="Thể trạng hiện tại" info="Phân loại theo BMI + PBF (worst case)">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: meta.color,
          }}
        >
          <ConstitutionGlyph type={meta.glyph} color={meta.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: meta.color,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            {meta.label}
            {state === 'incomplete' && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: DB.textMute,
                  marginLeft: 10,
                  letterSpacing: 0,
                  background: DB.borderSoft,
                  padding: '3px 8px',
                  borderRadius: 6,
                  verticalAlign: 'middle',
                  textTransform: 'none',
                }}
              >
                dựa trên BMI
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              color: DB.textMid,
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>
              <span style={{ color: DB.textFaint, marginRight: 4 }}>BMI</span>
              <b style={{ color: DB.ink }}>{bmi.toFixed(1)}</b>
            </span>
            {state !== 'incomplete' && pbf != null && (
              <>
                <span style={{ color: DB.borderSoft }}>·</span>
                <span>
                  <span style={{ color: DB.textFaint, marginRight: 4 }}>PBF</span>
                  <b style={{ color: DB.ink }}>{pbf.toFixed(1)}%</b>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: DB.textMute,
                      marginLeft: 5,
                      padding: '1px 6px',
                      background: DB.borderSoft,
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {pbfSource === 'FORMULA' ? 'Navy' : 'ML'}
                  </span>
                </span>
              </>
            )}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: DB.textMid,
              lineHeight: 1.5,
              textWrap: 'pretty',
            }}
          >
            {meta.advice}
          </div>
        </div>
      </div>

      <BmiScaleBar bmi={bmi} />

      {state === 'incomplete' && (
        <div
          style={{
            marginTop: 16,
            background: DB.blue50,
            border: `1px solid ${DB.blue300}`,
            borderRadius: 10,
            padding: '11px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: DB.blue700,
          }}
        >
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ flex: 1 }}>
            Bổ sung <b>vòng eo / cổ</b> để có kết quả chính xác hơn.
          </span>
          <button
            style={{
              background: DB.blue600,
              color: '#fff',
              border: 'none',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cập nhật →
          </button>
        </div>
      )}

      {modelDown && (
        <div
          style={{
            marginTop: 12,
            background: DB.amber50,
            border: `1px solid ${DB.amber300}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12.5,
            color: DB.amber700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ⚠ Model 1 đang bảo trì, đang hiển thị tạm theo công thức Navy
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${DB.borderSoft}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: DB.textMute,
        }}
      >
        <span>Cập nhật: {updatedDaysAgo} ngày trước</span>
        <a
          href="#"
          style={{
            color: DB.green,
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 12.5,
          }}
        >
          Xem chi tiết →
        </a>
      </div>
    </Card>
  );
}

function W1Empty() {
  return (
    <Card title="Thể trạng hiện tại">
      <div
        style={{
          padding: '20px 4px 8px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: DB.borderSoft,
            display: 'grid',
            placeItems: 'center',
            color: DB.textMute,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: DB.ink }}>Chưa có dữ liệu</div>
        <div style={{ fontSize: 13.5, color: DB.textMid, maxWidth: 280, lineHeight: 1.5 }}>
          Cập nhật cân nặng + chiều cao để xác định thể trạng của bạn
        </div>
        <button
          style={{
            marginTop: 6,
            background: DB.green,
            color: '#fff',
            border: 'none',
            padding: '11px 22px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 6px 14px -6px rgba(5,150,105,.55)',
          }}
        >
          Cập nhật ngay →
        </button>
      </div>
    </Card>
  );
}

function W1Loading() {
  return (
    <Card title="Thể trạng hiện tại">
      <div style={{ display: 'flex', gap: 18 }}>
        <Skel w={64} h={64} r={16} />
        <div style={{ flex: 1 }}>
          <Skel w={140} h={28} r={6} />
          <Skel w={200} h={16} r={4} style={{ marginTop: 10 }} />
          <Skel w="100%" h={14} r={4} style={{ marginTop: 10 }} />
        </div>
      </div>
      <Skel w="100%" h={8} r={999} style={{ marginTop: 22 }} />
    </Card>
  );
}

function Skel({ w, h, r = 6, style }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'dbShimmer 1.4s ease-in-out infinite',
        borderRadius: r,
        ...style,
      }}
    />
  );
}

Object.assign(window, { W1Constitution, CONSTITUTION_META });
