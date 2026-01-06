import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  // AreaChart, Area, // Nếu muốn biểu đồ vùng
  // BarChart, Bar, // Nếu muốn biểu đồ cột
} from 'recharts';
import type { HistoricalDataPoint } from '../../services/healthData.service'; // Import kiểu dữ liệu

interface TrendChartProps {
  data: HistoricalDataPoint[];
  title: string;
  dataKey: string; // key của giá trị trong object data, ví dụ "value"
  xAxisDataKey: string; // key của trục X, ví dụ "timestamp"
  unit?: string; // Đơn vị để hiển thị trên tooltip và trục Y
  lineColor?: string; // Màu cho đường line
  isLoading?: boolean;
  onChartClick?: () => void; // Xử lý khi click vào biểu đồ để mở modal
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  dataKey = "value",
  xAxisDataKey = "timestamp",
  unit = '',
  lineColor = "#34D399", // Màu brand-green mặc định
  isLoading,
  onChartClick
}) => {
  const spinnerClass = "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green";

  // Định dạng lại timestamp cho trục X và tooltip
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      [xAxisDataKey]: new Date(item.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), // dd/mm
      // Hoặc: new Date(item.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' }) // ví dụ: 15 Thg 3
      // Hoặc chỉ lấy ngày nếu khoảng thời gian ngắn
      // Hoặc tính toán để hiển thị tháng/năm nếu khoảng thời gian dài
      fullTimestamp: new Date(item.timestamp) // Giữ lại timestamp đầy đủ để sắp xếp hoặc xử lý khác nếu cần
    })).sort((a, b) => a.fullTimestamp.getTime() - b.fullTimestamp.getTime()); // Sắp xếp dữ liệu theo thời gian
  }, [data, xAxisDataKey]);

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="text-sm text-gray-700">{`Ngày: ${label}`}</p>
          <p className="text-sm font-semibold" style={{ color: lineColor }}>
            {`${title}: ${payload[0].value?.toFixed(1)} ${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg h-64 flex flex-col items-center justify-center text-gray-500">
        <div className={spinnerClass}></div>
        <p className="mt-2">Đang tải dữ liệu biểu đồ...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg h-64 flex flex-col items-center justify-center text-gray-500"
           onClick={onChartClick}
           style={{ cursor: onChartClick ? 'pointer' : 'default' }}
      >
        <p className="text-lg">Chưa có dữ liệu cho</p>
        <p className="font-semibold text-brand-green-dark">{title}</p>
      </div>
    );
  }

  return (
    <div 
        className="bg-white p-2 sm:p-4 rounded-xl shadow-lg h-72 sm:h-80 cursor-pointer hover:shadow-2xl transition-shadow"
        onClick={onChartClick}
        title={`Nhấn để xem chi tiết biểu đồ ${title}`}
    >
      <h4 className="text-md font-semibold text-brand-gray-dark mb-2 text-center sm:text-left">{title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 20, // Tăng right margin để label trục Y không bị cắt
            left: -15,  // Giảm left margin để biểu đồ gần lề hơn
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fontSize: 10, fill: '#6b7280' }} 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            // interval="preserveStartEnd" // Giữ lại tick đầu và cuối
            // Hoặc tickFormatter để định dạng label trục X nếu cần
            // tickFormatter={(tick) => new Date(tick).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }} 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            // domain={['dataMin - 1', 'dataMax + 1']} // Tự động điều chỉnh domain
            // tickFormatter={(value) => `${value.toFixed(0)}${unit}`} // Thêm unit vào trục Y
            label={{ value: unit, angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#6b7280' }} // Label cho trục Y
          />
          <Tooltip content={<CustomTooltip />} />
          {/* <Legend /> Bỏ legend nếu chỉ có 1 line */}
          <Line
            type="monotone" // Làm mượt đường line
            dataKey={dataKey}
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 1, fill: lineColor }} // Style cho điểm dữ liệu
            activeDot={{ r: 6, strokeWidth: 2,  fill: 'white', stroke: lineColor }} // Style cho điểm active khi hover
          />
          {/* Nếu muốn kết hợp biểu đồ cột (ví dụ cho lượng nước uống)
          <Bar dataKey="waterIntake" fill="#8884d8" /> */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;