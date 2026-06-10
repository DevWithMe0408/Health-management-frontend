# Nhật ký bữa ăn & Tuân thủ — `/nutrition-history`

Trang React + TypeScript + Tailwind v4, dùng Heroicons (outline). Đồng bộ phong cách
app (brand green `#059669`, card `rounded-2xl` viền `gray-200`, tiêu đề IN HOA `tracking-wider`).

## Cây file

```
NutritionHistoryPage.tsx          # trang chính (state + handlers, ráp mọi thứ)
nutritionHistory.types.ts         # MealLogRecord, MealLogStatus, RangeMode...
nutritionHistory.constants.ts     # STATUS_META (màu/nhãn), MEAL_LABEL, MEAL_ORDER
nutritionHistory.utils.ts         # date helpers + computeCompliance + logsForDate/Week/Month
nutritionHistory.mock.ts          # MOCK_LOGS (1 tháng), getSuggestedDishes()
components/
  RangeSegmentedControl.tsx       # [Ngày] · [Tuần] · [Tháng]
  ComplianceRing.tsx              # vòng tròn tiến độ nhiều phân đoạn (SVG)
  ComplianceSummaryCard.tsx       # thẻ tóm tắt tuân thủ + breakdown (luôn hiện)
  StatusBadge.tsx                 # StatusBadge + StatusLegend
  MealLogRow.tsx                  # 1 hàng bữa + 3 nút nhanh + ô input "Ăn khác"
  RangeCard.tsx                   # khung card có điều hướng prev/next
  NutritionHistoryEmptyState.tsx  # empty state
views/
  DayView.tsx                     # danh sách dọc các bữa
  WeekView.tsx                    # lưới 7 cột T2–CN
  MonthView.tsx                   # lịch tháng, chấm tóm tắt
```

## Mô hình dữ liệu

```ts
interface MealLogRecord {
  id: string;
  mealDate: string;        // 'YYYY-MM-DD'
  mealType: 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';
  status: 'SUGGESTED' | 'FOLLOWED' | 'CUSTOM' | 'SKIPPED';
  customNote: string | null;
  totalKcalActual: number;
  dishes: { dishName: string; dishKcal: number }[];
}
```

Tuân thủ: `% = FOLLOWED / (FOLLOWED + CUSTOM + SKIPPED)`. `SUGGESTED` đếm riêng là "chưa báo cáo".
Màu trạng thái: đúng = brand green, ăn khác = amber, bỏ bữa = xám, chưa báo cáo = viền đứt.

## Tích hợp (cắm API + handler thật)

1. **Dữ liệu**: thay `MOCK_LOGS` bằng kết quả từ `GET /api/meal-log/history` (hoặc endpoint range),
   truyền vào `<NutritionHistoryPage initialLogs={data} />`. Map response → `MealLogRecord[]`.
2. **Handler**: trong `NutritionHistoryPage.tsx`, đổi `handleSetStatus` / `handleSaveCustom`
   từ cập nhật state cục bộ sang gọi mutation (vd `POST /api/meal-log/{id}/status`),
   rồi optimistic-update hoặc invalidate query.
3. **Routing**: thêm vào `App.tsx`
   ```tsx
   <Route path="/nutrition-history" element={
     <ProtectedRoute><MainLayout><NutritionHistoryPage /></MainLayout></ProtectedRoute>
   } />
   ```
   và một `NavItem` trong `Sidebar.tsx` (icon `CalendarDaysIcon`, label "Nhật ký bữa ăn").
4. **today**: bỏ prop `today` để dùng `new Date()` thật (mặc định đang trỏ `MOCK_TODAY = 10/06/2026`
   để design render ổn định).

> `ComplianceRing` là SVG tự vẽ; nếu muốn có thể thay bằng Recharts `<PieChart>` mà không đổi API.
