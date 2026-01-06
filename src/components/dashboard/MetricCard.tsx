import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline'; // Icon chấm than
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/20/solid'; // Icons cho thay đổi

interface MetricCardProps {
  title: string;
  value?: number | null;
  unit?: string | null;
  lastUpdatedAt?: string | null;
  // Thêm các props cho ngưỡng và giải thích sau
  status?: 'good' | 'warning' | 'danger' | 'neutral'; // Để style màu sắc
  statusText?: string; // Ví dụ: "Bình thường", "Thừa cân"
  tooltipInfo?: string; // Thông tin cho tooltip
  previousValue?: number | null; // Để tính toán thay đổi
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  lastUpdatedAt,
  status = 'neutral',
  statusText,
  tooltipInfo,
  previousValue,
}) => {
  const formattedValue = value != null ? value.toFixed(1) : '--'; // Làm tròn 1 chữ số thập phân
  const formattedUnit = unit || '';

  let changeIndicator = null;
  let changeText = "";
  if (previousValue != null && value != null) {
    const diff = value - previousValue;
    if (diff > 0.05) { // Ngưỡng nhỏ để tránh hiển thị mũi tên cho thay đổi không đáng kể
      changeIndicator = <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      changeText = `+${diff.toFixed(1)}${formattedUnit}`;
    } else if (diff < -0.05) {
      changeIndicator = <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      changeText = `${diff.toFixed(1)}${formattedUnit}`;
    } else {
      changeIndicator = <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  }

  const getStatusColorClasses = () => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-300 text-green-700';
      case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      case 'danger': return 'bg-red-50 border-red-300 text-red-700';
      default: return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  return (
    <div className={`p-4 sm:p-6 bg-white rounded-xl shadow-lg border ${getStatusColorClasses()} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold ">{title}</h3>
        {tooltipInfo && (
          <div className="relative group">
            <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-brand-green cursor-pointer" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs 
                            bg-gray-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg">
              {tooltipInfo}
            </div>
          </div>
        )}
      </div>
      <p className={`text-3xl sm:text-4xl font-bold ${status === 'neutral' ? 'text-brand-gray-dark' : ''}`}>
        {formattedValue}
        <span className="text-lg font-normal ml-1">{formattedUnit}</span>
      </p>
      {changeIndicator && (
        <div className="flex items-center text-xs mt-1">
          {changeIndicator}
          <span className="ml-1">{changeText} so với lần trước</span>
        </div>
      )}
      {statusText && <p className="text-sm font-medium mt-1">{statusText}</p>}
      {lastUpdatedAt && (
        <p className="text-xs text-gray-500 mt-3">
          Cập nhật: {new Date(lastUpdatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      )}
    </div>
  );
};

export default MetricCard;