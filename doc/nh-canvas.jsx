// Nhật ký bữa ăn — DesignCanvas layout (Figma-style)
const IsoFrame = ({ children, pad = 24, bg = DB.bg }) => (
  <div style={{ ...dbFont, background: bg, width: '100%', height: '100%', padding: pad, boxSizing: 'border-box' }}>{children}</div>
);

// sample logs cho artboard cô lập
const sampleRow = (mealType, status, extra = {}) => ({
  id: `iso-${mealType}`, mealDate: nhFmtKey(NH_TODAY), mealType, status,
  customNote: null, totalKcalActual: 0, dishes: [], ...extra,
});
const ROW_FOLLOWED  = sampleRow('TRUA', 'FOLLOWED', { dishes: nhGetSuggested('TRUA'), totalKcalActual: 560 });
const ROW_CUSTOM    = sampleRow('PHU_SANG', 'CUSTOM', { customNote: 'Bún bò Huế gần nhà', totalKcalActual: 540 });
const ROW_SKIPPED   = sampleRow('PHU_CHIEU', 'SKIPPED');
const ROW_SUGGESTED = sampleRow('TOI', 'SUGGESTED', { dishes: nhGetSuggested('TOI') });

function App() {
  return (
    <DesignCanvas
      title="HealthCare — /nutrition-history · Nhật ký bữa ăn & Tuân thủ"
      subtitle="Trang đầy đủ (Desktop + Mobile) cho 3 chế độ Ngày/Tuần/Tháng · zoom hàng bữa ăn theo trạng thái · thành phần · empty state · ghi chú"
    >
      {/* ── Trang đầy đủ — Desktop ───────────────────────────── */}
      <DCSection id="nh-desktop" title="Trang đầy đủ — Desktop 1280px" subtitle="3 chế độ chuyển bằng segmented control [Ngày · Tuần · Tháng]. Thẻ tóm tắt tuân thủ luôn hiện.">
        <DCArtboard id="d-day" label="Ngày — danh sách dọc các bữa (Sáng đúng · Phụ sáng ăn khác · 2 bữa chưa báo cáo)" width={1280} height={1080}>
          <NutritionHistoryDesktop range="day" />
        </DCArtboard>
        <DCArtboard id="d-day-note" label="Ngày — mở ô nhập ‘Ăn khác’ (bữa Phụ chiều)" width={1280} height={1160}>
          <NutritionHistoryDesktop range="day" openNoteFor="PHU_CHIEU" />
        </DCArtboard>
        <DCArtboard id="d-week" label="Tuần — lưới 7 cột T2–CN, mỗi ô 1 bữa tô màu theo trạng thái" width={1280} height={760}>
          <NutritionHistoryDesktop range="week" />
        </DCArtboard>
        <DCArtboard id="d-month" label="Tháng — lịch, mỗi ngày chấm màu + % tuân thủ" width={1280} height={1270}>
          <NutritionHistoryDesktop range="month" />
        </DCArtboard>
      </DCSection>

      {/* ── Trang đầy đủ — Mobile ────────────────────────────── */}
      <DCSection id="nh-mobile" title="Trang đầy đủ — Mobile 375px" subtitle="Cùng nội dung, xếp dọc. Segmented control nằm dưới header; breakdown 2 cột.">
        <DCArtboard id="m-day" label="Ngày" width={375} height={1810}>
          <NutritionHistoryMobile range="day" />
        </DCArtboard>
        <DCArtboard id="m-week" label="Tuần" width={375} height={1100}>
          <NutritionHistoryMobile range="week" />
        </DCArtboard>
        <DCArtboard id="m-month" label="Tháng" width={375} height={1230}>
          <NutritionHistoryMobile range="month" />
        </DCArtboard>
      </DCSection>

      {/* ── Hàng bữa ăn — trạng thái ─────────────────────────── */}
      <DCSection id="nh-rows" title="Hàng bữa ăn — 4 trạng thái + nút nhanh" subtitle="SUGGESTED · FOLLOWED · CUSTOM · SKIPPED. Mỗi hàng có 3 nút: Đã ăn đúng / Ăn khác / Bỏ bữa (nút đang chọn tô màu).">
        <DCArtboard id="row-followed" label="FOLLOWED — ăn đúng đề xuất (liệt kê món + kcal)" width={900} height={132}>
          <IsoFrame><MealLogRow log={ROW_FOLLOWED} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="row-custom" label="CUSTOM — ăn khác (ghi chú tự do)" width={900} height={132}>
          <IsoFrame><MealLogRow log={ROW_CUSTOM} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="row-skipped" label="SKIPPED — bỏ bữa" width={900} height={120}>
          <IsoFrame><MealLogRow log={ROW_SKIPPED} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="row-suggested" label="SUGGESTED — chưa báo cáo (đề xuất hiển thị mờ)" width={900} height={140}>
          <IsoFrame><MealLogRow log={ROW_SUGGESTED} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="row-note" label="SUGGESTED + ô nhập ‘Ăn khác’ mở" width={900} height={210}>
          <IsoFrame><MealLogRow log={ROW_SUGGESTED} noteOpen /></IsoFrame>
        </DCArtboard>
      </DCSection>

      {/* ── Thành phần ───────────────────────────────────────── */}
      <DCSection id="nh-parts" title="Thành phần dùng lại" subtitle="Thẻ tóm tắt tuân thủ (vòng tròn nhiều phân đoạn + breakdown) · segmented control · chú thích màu.">
        <DCArtboard id="part-summary-week" label="ComplianceSummaryCard · khoảng Tuần" width={620} height={300}>
          <IsoFrame><ComplianceSummaryCard rangeLabel="Tuần" logs={NH_MOCK_LOGS.filter((l) => { const mon = nhStartOfWeek(NH_TODAY); const keys = new Set(Array.from({ length: 7 }, (_, i) => nhFmtKey(nhAddDays(mon, i)))); return keys.has(l.mealDate); })} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="part-summary-day" label="ComplianceSummaryCard · khoảng Ngày" width={620} height={300}>
          <IsoFrame><ComplianceSummaryCard rangeLabel="Ngày" logs={NH_MOCK_LOGS.filter((l) => l.mealDate === nhFmtKey(NH_TODAY))} /></IsoFrame>
        </DCArtboard>
        <DCArtboard id="part-controls" label="Segmented control (3 trạng thái) + Legend" width={460} height={260}>
          <IsoFrame>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <RangeSegmented value="day" />
              <RangeSegmented value="week" />
              <RangeSegmented value="month" />
              <div style={{ borderTop: `1px solid ${DB.border}`, paddingTop: 16 }}>
                <StatusLegend />
              </div>
            </div>
          </IsoFrame>
        </DCArtboard>
      </DCSection>

      {/* ── Empty state ──────────────────────────────────────── */}
      <DCSection id="nh-empty" title="Empty state" subtitle="Khi chưa có bữa ăn nào được ghi nhận.">
        <DCArtboard id="empty-d" label="Desktop" width={1280} height={620}>
          <NutritionHistoryEmptyDesktop />
        </DCArtboard>
        <DCArtboard id="empty-iso" label="Card cô lập" width={620} height={360}>
          <IsoFrame><NhEmptyState /></IsoFrame>
        </DCArtboard>
      </DCSection>

      {/* ── Ghi chú thiết kế ─────────────────────────────────── */}
      <DCSection id="nh-notes" title="Ghi chú thiết kế" subtitle="Quyết định & cách map sang codebase.">
        <DCArtboard id="notes-content" label="Decisions & mapping" width={760} height={920}>
          <DesignNotes />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function DesignNotes() {
  const items = [
    { h: 'Trạng thái: 4 giá trị theo spec', b: 'SUGGESTED (chưa báo cáo) · FOLLOWED (ăn đúng) · CUSTOM (ăn khác) · SKIPPED (bỏ bữa). Codebase hiện có thêm MODIFIED trong BackendMealStatus — khi map response nên gộp MODIFIED → CUSTOM.' },
    { h: 'Công thức tuân thủ', b: '% = FOLLOWED / (FOLLOWED + CUSTOM + SKIPPED). SUGGESTED KHÔNG vào mẫu số, đếm riêng là "chưa báo cáo". Vòng tròn hiển thị 3 phân đoạn reported, số ở giữa là %.' },
    { h: 'Màu trạng thái', b: 'Đúng = brand green #059669 · Ăn khác = amber #f59e0b · Bỏ bữa = xám #9ca3af · Chưa báo cáo = viền đứt (không tô). Dùng nhất quán ở badge, ô tuần, chấm tháng, legend.' },
    { h: 'Tái sử dụng shell + Card', b: 'Dùng lại Sidebar / TopHeader / Card từ dashboard-shared.jsx. Sidebar thêm 1 mục mới "Nhật ký bữa ăn" (icon calendar) — khi code thật, thêm NavItem vào src/components/layout/Sidebar.tsx + route /nutrition-history trong App.tsx.' },
    { h: 'Ngày: nút nhanh + ô "Ăn khác"', b: '3 nút mỗi hàng; nút trùng trạng thái hiện tại được tô màu (active). Bấm "Ăn khác" mở ô input nhỏ để nhập đã ăn gì → lưu thành CUSTOM + customNote.' },
    { h: 'Tuần / Tháng → bấm mở chi tiết ngày', b: 'Mỗi ô ngày (tuần) hoặc ô lịch (tháng) bấm vào sẽ setRange("day") + setDayKey(ngày đó). Ô chưa báo cáo dùng viền đứt; tháng hiển thị chấm màu trội + % tuân thủ của ngày.' },
    { h: 'Vòng tròn = SVG thuần', b: 'ComplianceRing vẽ bằng stroke-dasharray, không cần thư viện. Có thể thay bằng Recharts <PieChart> mà không đổi API (counts, percent).' },
    { h: 'Dữ liệu mock', b: 'nh-data.jsx sinh đủ 1 tháng (10/06/2026 là "hôm nay"). Khi tích hợp: thay NH_MOCK_LOGS bằng GET /api/meal-log/history; mỗi record đúng shape { id, mealDate, mealType, status, customNote, totalKcalActual, dishes[] }.' },
    { h: 'Bản .tsx kèm theo', b: 'Code production tách component (map 1:1 với các artboard này) nằm ở nutrition-history/handoff/ — gồm types, constants, utils, mock, components/, views/ và NutritionHistoryPage.tsx + README.' },
  ];
  return (
    <div style={{ ...dbFont, background: '#fff', height: '100%', padding: '24px 28px', overflowY: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: DB.ink, letterSpacing: '-0.01em' }}>Ghi chú thiết kế →</h2>
      <p style={{ margin: '4px 0 18px', fontSize: 12.5, color: DB.textMute }}>Các quyết định chính & cách cắm vào codebase.</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, background: DB.green50, color: DB.greenDark, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i + 1}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: DB.ink }}>{it.h}</div>
              <div style={{ fontSize: 12.5, color: DB.textMid, marginTop: 3, lineHeight: 1.55 }}>{it.b}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
