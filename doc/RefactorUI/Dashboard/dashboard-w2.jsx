// Widget 2A — Weight chart 30 days
// Widget 2B — Compliance 7 days
// Widget 2C — 3 metric cards

// =========================================================================
// 2A — Weight chart (custom SVG line chart, no Recharts in mockup)
// =========================================================================
const SAMPLE_WEIGHT = [
  ['2026-04-25', 64.8], ['2026-04-27', 64.7], ['2026-04-29', 64.5],
  ['2026-05-01', 64.5], ['2026-05-03', 64.3], ['2026-05-05', 64.4],
  ['2026-05-07', 64.2], ['2026-05-09', 64.0], ['2026-05-11', 63.9],
  ['2026-05-13', 64.0], ['2026-05-15', 63.7], ['2026-05-17', 63.6],
  ['2026-05-19', 63.5], ['2026-05-21', 63.6], ['2026-05-23', 63.4],
  ['2026-05-25', 63.3],
];

function W2WeightChart({ data = SAMPLE_WEIGHT, empty = false, height = 220 }) {
  if (empty) {
    return (
      <Card
        title="Cân nặng · 30 ngày"
        action={
          <span
            style={{
              fontSize: 12,
              color: DB.textMute,
              background: DB.borderSoft,
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Chưa đủ dữ liệu
          </span>
        }
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px 12px 24px',
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
              borderRadius: 14,
              background: DB.borderSoft,
              display: 'grid',
              placeItems: 'center',
              color: DB.textMute,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 20h18M5 17l4-6 4 3 6-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: DB.ink }}>
            Cần ít nhất 2 lần cân
          </div>
          <div style={{ fontSize: 13.5, color: DB.textMid, maxWidth: 320, lineHeight: 1.5 }}>
            Cập nhật cân nặng hằng tuần để bắt đầu theo dõi tiến độ
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
            Cập nhật cân nặng →
          </button>
        </div>
      </Card>
    );
  }

  // Chart geometry
  const W = 800, H = height, padL = 44, padR = 16, padT = 18, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const values = data.map(([, v]) => v);
  const minV = Math.min(...values) - 0.4;
  const maxV = Math.max(...values) + 0.4;
  const span = maxV - minV;

  const xAt = (i) => padL + (i / (data.length - 1)) * innerW;
  const yAt = (v) => padT + ((maxV - v) / span) * innerH;

  // Y ticks
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => minV + (span * i) / ticks);

  // Build smooth path with simple Catmull-Rom -> Bezier
  const pts = data.map(([, v], i) => [xAt(i), yAt(v)]);
  let path = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const cx = (x1 + x2) / 2;
    path += ` C ${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  }
  const areaPath = path + ` L ${pts[pts.length - 1][0]},${padT + innerH} L ${pts[0][0]},${padT + innerH} Z`;

  // X labels (every 5th point)
  const xLabels = data
    .map(([d], i) => ({ i, d }))
    .filter((p, i) => i === 0 || i === data.length - 1 || p.i % 5 === 0);

  const latest = values[values.length - 1];
  const earliest = values[0];
  const delta = latest - earliest;

  return (
    <Card
      title="Cân nặng · 30 ngày"
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: DB.ink,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
              }}
            >
              {latest.toFixed(1)} kg
            </div>
            <div
              style={{
                fontSize: 12,
                color: delta < 0 ? DB.green : delta > 0 ? DB.orange600 : DB.textMute,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {Math.abs(delta).toFixed(1)} kg
            </div>
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={DB.green} stopOpacity="0.18" />
            <stop offset="100%" stopColor={DB.green} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {tickVals.map((v, i) => {
          const y = yAt(v);
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={DB.borderSoft} strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill={DB.textMute} fontFamily="inherit" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Area + Line */}
        <path d={areaPath} fill="url(#wArea)" />
        <path d={path} fill="none" stroke={DB.green} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 2.5} fill="#fff" stroke={DB.green} strokeWidth={i === pts.length - 1 ? 2.5 : 1.75} />
        ))}

        {/* X labels */}
        {xLabels.map(({ i, d }) => {
          const [, m, day] = d.split('-');
          return (
            <text
              key={i}
              x={xAt(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill={DB.textMute}
              fontFamily="inherit"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {parseInt(day, 10)}/{parseInt(m, 10)}
            </text>
          );
        })}
      </svg>
    </Card>
  );
}

// =========================================================================
// 2B — Compliance (7 days × N meals)
// =========================================================================
function W2Compliance({
  empty = false,
  planType = '3_BUA', // or '5_BUA'
  // For each day: array of bool (length = expectedMeals)
  data = [
    [true, true, true],
    [true, true, true],
    [true, true, false],
    [true, true, true],
    [true, true, true],
    [true, false, false],
    [true, true, true],
  ],
}) {
  if (empty) {
    return (
      <Card title="Đã có thực đơn · 7 ngày">
        <div
          style={{
            textAlign: 'center',
            padding: '24px 8px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 32 }}>🍽️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: DB.ink }}>
            Chưa có thực đơn nào
          </div>
          <div style={{ fontSize: 13, color: DB.textMid, maxWidth: 240, lineHeight: 1.5 }}>
            Tạo thực đơn đầu tiên để bắt đầu theo dõi
          </div>
          <button
            style={{
              marginTop: 6,
              background: DB.green,
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Tạo thực đơn →
          </button>
        </div>
      </Card>
    );
  }

  const expected = planType === '3_BUA' ? 3 : 5;
  const totalExpected = 7 * expected;
  const totalLogged = data.flat().filter(Boolean).length;
  const pct = Math.round((totalLogged / totalExpected) * 100);
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <Card
      title="Đã có thực đơn · 7 ngày"
      action={
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: DB.ink,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {totalLogged}/{totalExpected}
            <span style={{ fontSize: 12, color: DB.textMute, marginLeft: 6, fontWeight: 500 }}>
              bữa
            </span>
          </div>
          <div style={{ fontSize: 12, color: DB.green, fontWeight: 600 }}>{pct}%</div>
        </div>
      }
    >
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: DB.borderSoft,
          borderRadius: 999,
          overflow: 'hidden',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${DB.green}, #10b981)`,
            borderRadius: 999,
          }}
        />
      </div>

      {/* Day grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 8,
        }}
      >
        {data.map((day, i) => {
          const dayCount = day.filter(Boolean).length;
          const dayFull = dayCount === expected;
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: dayFull ? DB.greenDark : DB.textMute,
                  marginBottom: 8,
                  letterSpacing: '0.02em',
                }}
              >
                {dayLabels[i]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                {day.map((logged, j) => (
                  <div
                    key={j}
                    title={
                      logged
                        ? `Bữa ${j + 1} ${dayLabels[i]}: đã có thực đơn`
                        : `Bữa ${j + 1} ${dayLabels[i]}: chưa có`
                    }
                    style={{
                      width: '100%',
                      maxWidth: 28,
                      height: 14,
                      borderRadius: 4,
                      background: logged ? DB.green : DB.borderSoft,
                      border: logged ? 'none' : `1px dashed ${DB.border}`,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 11.5,
          color: DB.textFaint,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: DB.green }} />
          Có thực đơn
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: DB.borderSoft,
              border: `1px dashed ${DB.border}`,
            }}
          />
          Chưa có
        </span>
      </div>
    </Card>
  );
}

// =========================================================================
// 2C — 3 metric cards
// =========================================================================
function W2Metrics({
  weightDelta = -0.5,
  mealsThisWeek = 17,
  favoriteCount = 3,
}) {
  const items = [
    {
      icon: '📉',
      iconBg: weightDelta < 0 ? DB.green50 : weightDelta > 0 ? DB.orange50 : DB.borderSoft,
      iconColor: weightDelta < 0 ? DB.green : weightDelta > 0 ? DB.orange600 : DB.textMute,
      value:
        weightDelta == null
          ? '—'
          : `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`,
      label: 'Cân tuần này',
    },
    {
      icon: '🍽️',
      iconBg: DB.green50,
      iconColor: DB.green,
      value: `${mealsThisWeek} bữa`,
      label: 'Đã đề xuất',
    },
    {
      icon: '⭐',
      iconBg: '#fffbeb',
      iconColor: DB.amber500,
      value: `${favoriteCount} món`,
      label: 'Yêu thích',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            border: `1px solid ${DB.border}`,
            borderRadius: 14,
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15,23,42,.04)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: it.iconBg,
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
            }}
          >
            {it.icon}
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: DB.ink,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              {it.value}
            </div>
            <div style={{ fontSize: 12, color: DB.textMute, marginTop: 4 }}>{it.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { W2WeightChart, W2Compliance, W2Metrics });
