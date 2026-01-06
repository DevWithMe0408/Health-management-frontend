// src/model/IndicatorType.ts

/**
 * Phân loại các chỉ số để dễ dàng xử lý logic riêng biệt.
 */
export const IndicatorCategory = {
  BASE: "BASE",                             // Chỉ số cơ bản, người dùng nhập trực tiếp hoặc từ thiết bị đo
  CALCULATED: "CALCULATED",                 // Chỉ số được hệ thống tính toán từ các chỉ số cơ bản
  USER_PROVIDED_CALCULATED: "USER_PROVIDED_CALCULATED" // Chỉ số có thể tính toán, nhưng người dùng cung cấp giá trị đo được (ví dụ: BMI từ máy InBody)
} as const;

export type IndicatorCategory = typeof IndicatorCategory[keyof typeof IndicatorCategory];

/**
 * Định nghĩa cấu trúc cho thông tin meta của mỗi loại chỉ số.
 */
export interface IndicatorMeta {
  name: string;                     // Tên kỹ thuật (thường là key của ENUM/object, dùng để gửi lên API)
  label: string;                    // Tên hiển thị cho người dùng (ví dụ: "Cân nặng", "Chỉ số khối cơ thể")
  category: IndicatorCategory;      // Phân loại chỉ số
  unit?: string | null;             // Mã đơn vị mặc định (ví dụ: "kg", "cm", "kg/m²", "%", "kcal/ngày"). Null nếu không có đơn vị rõ ràng.
  defaultColor?: string;            // Màu sắc mặc định cho biểu đồ (hex code)
  decimalPlaces?: number;           // Số chữ số thập phân mặc định khi hiển thị (ví dụ: 1 cho cân nặng, 2 cho BMI)
  tooltipInfo?: string;             // Thông tin giải thích ngắn gọn cho tooltip
}

// Sử dụng một object với `as const` để TypeScript hiểu rõ các keys và values,
// mang lại type safety tốt hơn so với string enum đơn thuần khi cần truy cập metadata.
export const INDICATOR_TYPES = {
  // --- Chỉ số cơ bản (BASE) ---
  HEIGHT: {
    name: "HEIGHT",
    label: "Chiều cao",
    category: IndicatorCategory.BASE,
    unit: "cm",
    defaultColor: "#4CAF50", // Xanh lá cây
    decimalPlaces: 1,
    tooltipInfo: "Chiều cao của bạn, đo bằng centimet."
  },
  WEIGHT: {
    name: "WEIGHT",
    label: "Cân nặng",
    category: IndicatorCategory.BASE,
    unit: "kg",
    defaultColor: "#2196F3", // Xanh dương
    decimalPlaces: 1,
    tooltipInfo: "Cân nặng hiện tại của bạn, đo bằng kilogram."
  },
  WAIST: {
    name: "WAIST",
    label: "Vòng eo",
    category: IndicatorCategory.BASE,
    unit: "cm",
    defaultColor: "#FFC107", // Vàng
    decimalPlaces: 1,
    tooltipInfo: "Chu vi vòng eo, đo bằng centimet."
  },
  HIP: {
    name: "HIP",
    label: "Vòng hông",
    category: IndicatorCategory.BASE,
    unit: "cm",
    defaultColor: "#FF9800", // Cam
    decimalPlaces: 1,
    tooltipInfo: "Chu vi vòng hông, đo bằng centimet."
  },
  NECK: {
    name: "NECK",
    label: "Vòng cổ",
    category: IndicatorCategory.BASE,
    unit: "cm",
    defaultColor: "#E91E63", // Hồng
    decimalPlaces: 1,
    tooltipInfo: "Chu vi vòng cổ, đo bằng centimet."
  },
  BUST: { // Ví dụ thêm một chỉ số cơ bản khác
    name: "BUST",
    label: "Vòng ngực",
    category: IndicatorCategory.BASE,
    unit: "cm",
    defaultColor: "#9C27B0", // Tím
    decimalPlaces: 1,
    tooltipInfo: "Chu vi vòng ngực, đo bằng centimet."
  },
  ACTIVITY_FACTOR: {
    name: "ACTIVITY_FACTOR",
    label: "Hệ số vận động",
    category: IndicatorCategory.BASE,
    unit: null, // Không có đơn vị
    defaultColor: "#795548", // Nâu
    decimalPlaces: 2,
    tooltipInfo: "Mức độ hoạt động thể chất hàng ngày của bạn (ví dụ: 1.2 đến 1.9)."
  },

  // --- Chỉ số Tính toán/Đo bởi người dùng (CALCULATED hoặc USER_PROVIDED_CALCULATED) ---
  BMI: {
    name: "BMI",
    label: "BMI",
    category: IndicatorCategory.CALCULATED, // Mặc định là calculated, nhưng có thể được ghi đè bởi USER_PROVIDED_CALCULATED
    unit: "kg/m²",
    defaultColor: "#00BCD4", // Xanh lơ
    decimalPlaces: 1,
    tooltipInfo: "Chỉ số khối cơ thể (Body Mass Index), đánh giá tình trạng dinh dưỡng."
  },
  BMR: {
    name: "BMR",
    label: "BMR",
    category: IndicatorCategory.CALCULATED,
    unit: "kcal/ngày",
    defaultColor: "#FF5722", // Cam đậm
    decimalPlaces: 0,
    tooltipInfo: "Tỷ lệ trao đổi chất cơ bản (Basal Metabolic Rate) - năng lượng tối thiểu cơ thể cần khi nghỉ ngơi."
  },
  TDEE: {
    name: "TDEE",
    label: "TDEE",
    category: IndicatorCategory.CALCULATED,
    unit: "kcal/ngày",
    defaultColor: "#F44336", // Đỏ
    decimalPlaces: 0,
    tooltipInfo: "Tổng năng lượng tiêu thụ hàng ngày (Total Daily Energy Expenditure), bao gồm cả vận động."
  },
  PBF: {
    name: "PBF",
    label: "Mỡ cơ thể (PBF)",
    category: IndicatorCategory.CALCULATED,
    unit: "%",
    defaultColor: "#607D8B", // Xám xanh
    decimalPlaces: 1,
    tooltipInfo: "Tỷ lệ phần trăm mỡ trong cơ thể (Percent Body Fat)."
  },
  WHR: {
    name: "WHR",
    label: "Tỷ lệ Eo/Hông (WHR)",
    category: IndicatorCategory.CALCULATED,
    unit: null, // Tỷ lệ không có đơn vị
    defaultColor: "#3F51B5", // Chàm
    decimalPlaces: 2,
    tooltipInfo: "Tỷ lệ giữa chu vi vòng eo và vòng hông, đánh giá sự phân bổ mỡ và nguy cơ sức khỏe."
  }
} as const; // `as const` rất quan trọng để có type inference chính xác

/**
 * Tạo một union type gồm tất cả các tên (key) của chỉ số.
 * Ví dụ: "HEIGHT" | "WEIGHT" | "BMI" | ...
 */
export type IndicatorTypeName = keyof typeof INDICATOR_TYPES;

/**
 * Helper function để lấy thông tin meta của một IndicatorType dựa vào tên của nó.
 * @param typeName Tên của IndicatorType (ví dụ: "WEIGHT")
 * @returns Object IndicatorMeta hoặc undefined nếu không tìm thấy.
 */
export const getIndicatorInfo = (typeName: IndicatorTypeName): IndicatorMeta => {
  return INDICATOR_TYPES[typeName];
};

/**
 * Lấy danh sách tất cả các IndicatorMeta.
 * @returns Mảng các IndicatorMeta.
 */
export const getAllIndicatorInfos = (): IndicatorMeta[] => {
  return Object.values(INDICATOR_TYPES);
};

/**
 * Lấy danh sách IndicatorMeta dựa trên category.
 * @param category Loại IndicatorCategory muốn lấy.
 * @returns Mảng các IndicatorMeta thuộc category đó.
 */
export const getIndicatorInfosByCategory = (category: IndicatorCategory): IndicatorMeta[] => {
  return Object.values(INDICATOR_TYPES).filter(indicator => indicator.category === category);
};