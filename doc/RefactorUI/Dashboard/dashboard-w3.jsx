// Widget 3 — Notifications + Medical details section

// =========================================================================
// Notification list
// =========================================================================
const PRIORITY_STYLE = {
  HIGH: {
    bg: DB.amber50,
    border: DB.amber300,
    iconBg: '#fde68a',
    iconColor: DB.amber700,
    badge: 'Quan trọng',
    badgeBg: DB.amber500,
  },
  MEDIUM: {
    bg: DB.blue50,
    border: DB.blue300,
    iconBg: DB.blue100,
    iconColor: DB.blue700,
    badge: 'Thông tin',
    badgeBg: DB.blue600,
  },
  LOW: {
    bg: '#fafafa',
    border: DB.border,
    iconBg: DB.borderSoft,
    iconColor: DB.textMute,
    badge: 'Gợi ý',
    badgeBg: DB.textMute,
  },
};

function NotifItem({ priority, icon, title, message, ctaText }) {
  const s = PRIORITY_STYLE[priority];
  return (
    <div
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 12,
        padding: '14px 14px 14px 16px',
        display: 'flex',
        gap: 12,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: s.iconBg,
          color: s.iconColor,
          display: 'grid',
          placeItems: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: DB.ink,
              lineHeight: 1.3,
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ fontSize: 13, color: DB.textMid, lineHeight: 1.5, marginBottom: 10 }}>
          {message}
        </div>
        <button
          style={{
            background: '#fff',
            border: `1px solid ${s.border}`,
            color: s.iconColor,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {ctaText}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <button
        title="Ẩn nhắc nhở này trong 24h"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none',
          color: DB.textFaint,
          cursor: 'pointer',
          padding: 4,
          borderRadius: 6,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function W3Notifications({ state = 'normal' }) {
  // 3 example notifs (1 HIGH, 1 HIGH, 1 LOW) — matches spec sort
  const DEFAULT_NOTIFS = [
    {
      priority: 'HIGH',
      icon: '⚖️',
      title: 'Đã 9 ngày chưa cân',
      message: 'Cập nhật cân nặng để hệ thống đề xuất chính xác hơn.',
      ctaText: 'Cập nhật cân nặng',
    },
    {
      priority: 'HIGH',
      icon: '🍽️',
      title: 'Chưa có thực đơn hôm nay',
      message: 'Tạo thực đơn để bắt đầu ngày mới đúng kế hoạch.',
      ctaText: 'Tạo thực đơn',
    },
    {
      priority: 'LOW',
      icon: '💡',
      title: 'Đánh dấu món yêu thích',
      message: 'Hệ thống sẽ ưu tiên các món bạn thích trong đề xuất.',
      ctaText: 'Xem món đã ăn',
    },
  ];

  const MEDIUM_NOTIFS = [
    {
      priority: 'MEDIUM',
      icon: '📉',
      title: 'Cân đang giảm nhanh hơn dự kiến',
      message: 'Đã giảm 0.9kg/tuần trong khi mục tiêu là 0.5kg. Xem lại chế độ?',
      ctaText: 'Xem chi tiết',
    },
    {
      priority: 'MEDIUM',
      icon: '🎉',
      title: 'Đã đạt 80% mục tiêu cân nặng',
      message: 'Còn 0.8kg nữa để đạt 62kg. Tiếp tục duy trì.',
      ctaText: 'Xem mục tiêu',
    },
  ];

  const list =
    state === 'medium' ? MEDIUM_NOTIFS : state === 'empty' ? [] : DEFAULT_NOTIFS;

  return (
    <Card
      title="Nhắc nhở"
      subtitle={
        state === 'empty'
          ? null
          : `${list.length} việc cần làm`
      }
      action={
        list.length > 0 && (
          <a
            href="#"
            style={{
              fontSize: 12.5,
              color: DB.textMute,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Xem tất cả →
          </a>
        )
      }
    >
      {state === 'empty' ? (
        <div
          style={{
            padding: '24px 4px 4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: DB.green50,
              border: `1px solid ${DB.green200}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
            }}
          >
            ✨
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: DB.ink }}>
            Tuyệt vời! Mọi thứ đều ổn.
          </div>
          <div style={{ fontSize: 13, color: DB.textMid, maxWidth: 260, lineHeight: 1.5 }}>
            Bạn đang theo dõi đầy đủ. Tiếp tục duy trì để đạt mục tiêu nhé!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((n, i) => (
            <NotifItem key={i} {...n} />
          ))}
        </div>
      )}
    </Card>
  );
}

// =========================================================================
// Medical detail section (collapsible) — 7 indicators
// =========================================================================
function MedicalDetailSection({ open = false }) {
  const metrics = [
    { label: 'BMR', value: '1,597', unit: 'kcal', tip: 'Tỉ lệ chuyển hóa cơ bản (Mifflin-St Jeor)' },
    { label: 'TDEE', value: '1,917', unit: 'kcal', tip: 'Tổng năng lượng tiêu thụ ngày' },
    { label: 'PBF', value: '15.4', unit: '%', tip: 'Tỉ lệ mỡ cơ thể (Navy formula)' },
    { label: 'WHR', value: '0.78', unit: '', tip: 'Tỉ lệ eo/hông' },
    { label: 'Cân nặng', value: '58.5', unit: 'kg' },
    { label: 'Chiều cao', value: '168', unit: 'cm' },
    { label: 'BMI', value: '20.7', unit: '', tip: 'Chỉ số khối cơ thể (WHO Asian)' },
  ];
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${DB.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: open ? '#fff' : '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', color: DB.textMute, transition: 'transform .2s' }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: DB.text }}>
            Chi tiết chỉ số y khoa
          </span>
          {!open && (
            <span style={{ fontSize: 12, color: DB.textMute }}>
              · BMR 1,597 · TDEE 1,917 · PBF 15.4% · WHR 0.78
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: DB.textMute }}>{open ? 'Thu gọn' : 'Mở rộng'}</span>
      </div>
      {open && (
        <div
          style={{
            padding: '16px 20px 20px',
            borderTop: `1px solid ${DB.borderSoft}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                background: '#fafafa',
                border: `1px solid ${DB.borderSoft}`,
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: DB.textMute,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {m.label}
                {m.tip && <InfoIcon tip={m.tip} />}
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 17,
                  fontWeight: 700,
                  color: DB.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m.value}
                {m.unit && <span style={{ fontSize: 12, color: DB.textMute, marginLeft: 4, fontWeight: 500 }}>{m.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { W3Notifications, MedicalDetailSection });
