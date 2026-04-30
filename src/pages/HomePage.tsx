// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardMetrics, getHistoricalHealthData } from '../services/healthData.service';
import type { DashboardMetricsApiResponse, HistoricalDataPoint } from '../services/healthData.service';
import MetricCard from '../components/dashboard/MetricCard';
import TrendChart from '../components/dashboard/TrendChart';
import { INDICATOR_TYPES, getIndicatorInfo, IndicatorCategory, getAllIndicatorInfos } from '../model/IndicatorType';
import type {IndicatorTypeName} from '../model/IndicatorType';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import XMarkIcon

// Tailwind classes cho loading state
const spinnerClass = "animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-green";

// Định nghĩa các loại biểu đồ có sẵn và thông tin của chúng
// Sử dụng IndicatorTypeName từ model
const ALL_AVAILABLE_CHART_TYPES = getAllIndicatorInfos()
  .filter(info => info.category === IndicatorCategory.CALCULATED || info.name === "WEIGHT" || info.name === "WAIST") // Ví dụ: chỉ lấy calculated và một số base
  .map(info => ({
    typeName: info.name as IndicatorTypeName, // Ép kiểu nếu cần, hoặc đảm bảo name trong INDICATOR_TYPES là IndicatorTypeName
    label: info.label,
    unit: info.unit || '',
    color: info.defaultColor || '#34D399' // Lấy màu mặc định
  }));

type Granularity = "DAILY" | "WEEKLY" | "MONTHLY" | "NONE";

const HomePage: React.FC = () => {
  const { user, accessToken } = useAuth();

  // State cho dữ liệu dashboard (các thẻ chỉ số)
  const [dashboardData, setDashboardData] = useState<DashboardMetricsApiResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // State cho filter biểu đồ
  const [selectedChartTypeNames, setSelectedChartTypeNames] = useState<IndicatorTypeName[]>([
    "WEIGHT", "BMI" // Mặc định
  ]);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; })(),
    to: new Date(),
  });
  const [selectedGranularity, setSelectedGranularity] = useState<Granularity>("DAILY");

  // State cho dữ liệu của các biểu đồ (dùng Record)
  const [chartsData, setChartsData] = useState<Record<IndicatorTypeName, HistoricalDataPoint[]>>({} as Record<IndicatorTypeName, HistoricalDataPoint[]>);
  const [isChartsLoading, setIsChartsLoading] = useState<boolean>(false);
  const [chartsError, setChartsError] = useState<string | null>(null);


  // State cho Modal chi tiết biểu đồ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChartData, setModalChartData] = useState<HistoricalDataPoint[] | null>(null);
  const [modalChartTitle, setModalChartTitle] = useState<string>('');
  const [modalChartUnit, setModalChartUnit] = useState<string>('');

  // Fetch dữ liệu cho Dashboard Cards
  useEffect(() => {
    const fetchDashboard = async () => {
      if (user && accessToken) {
        setIsLoadingDashboard(true);
        setDashboardError(null);
        try {
          const data = await getDashboardMetrics(accessToken);
          setDashboardData(data);
        } catch (err: any) {
          setDashboardError(err.message || "Không thể tải dữ liệu dashboard.");
        } finally {
          setIsLoadingDashboard(false);
        }
      } else {
        setIsLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, [user, accessToken]);


  const fetchChartDataForType = useCallback(async (
    indicatorName: IndicatorTypeName,
    currentGranularity: Granularity,
    currentDateRange: { from: Date | null; to: Date | null }
  ) => {
    if (accessToken && currentDateRange.from && currentDateRange.to) {
      try {
        const data = await getHistoricalHealthData(
          accessToken,
          indicatorName,
          currentDateRange.from.toISOString().split('T')[0],
          currentDateRange.to.toISOString().split('T')[0]
        );
        setChartsData(prevData => ({ ...prevData, [indicatorName]: data }));
      } catch (err: any) {
        console.error(`Error fetching ${indicatorName} history:`, err);
        setChartsData(prevData => ({ ...prevData, [indicatorName]: [] }));
        setChartsError(`Lỗi tải dữ liệu biểu đồ cho ${indicatorName}.`);
      }
    }
  }, [accessToken]); // KHÔNG đưa chartsError vào deps — gây vòng lặp vô hạn


  // useEffect để fetch dữ liệu cho các biểu đồ được chọn khi filter thay đổi
  useEffect(() => {
    if (user && accessToken) {
      setIsChartsLoading(true);
      setChartsError(null); // Reset lỗi trước khi fetch mới
      const promises = selectedChartTypeNames.map(typeName =>
        fetchChartDataForType(typeName, selectedGranularity, dateRange)
      );
      Promise.all(promises).finally(() => setIsChartsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken, selectedChartTypeNames, dateRange, selectedGranularity, fetchChartDataForType]);


  // --- Các hàm helper ---
  const openChartModal = (data: HistoricalDataPoint[], title: string, unit: string) => {
    setModalChartData(data);
    setModalChartTitle(title);
    setModalChartUnit(unit);
    setIsModalOpen(true);
  };

  const closeChartModal = () => setIsModalOpen(false);

  const setQuickDateRange = (period: '7D' | '1M' | '3M' | '6M' | '1Y') => {
    const to = new Date();
    let from = new Date();
    switch (period) {
      case '7D': from.setDate(to.getDate() - 7); break;
      case '1M': from.setMonth(to.getMonth() - 1); break;
       case '3M': from.setMonth(to.getMonth() - 3); break;
    case '6M': from.setMonth(to.getMonth() - 6); break;
      case '1Y': from.setFullYear(to.getFullYear() - 1); break;
    }
    setDateRange({ from, to });
  };

  const getBmiDetails = (bmiValue?: number | null): { status: 'good' | 'warning' | 'danger' | 'neutral', statusText: string, tooltip: string } => {
    // ... (code đã có)
    if (bmiValue == null) return { status: 'neutral', statusText: 'N/A', tooltip: 'Chỉ số BMI (Body Mass Index) đánh giá tình trạng dinh dưỡng.' };
    if (bmiValue < 18.5) return { status: 'warning', statusText: 'Thiếu cân', tooltip: 'BMI < 18.5: Thiếu cân. Cần tư vấn dinh dưỡng để tăng cân khỏe mạnh.' };
    if (bmiValue < 24.9) return { status: 'good', statusText: 'Bình thường', tooltip: '18.5 ≤ BMI < 24.9: Cân nặng bình thường. Duy trì lối sống lành mạnh.' };
    if (bmiValue < 29.9) return { status: 'warning', statusText: 'Thừa cân', tooltip: '25 ≤ BMI < 29.9: Thừa cân. Nên điều chỉnh chế độ ăn và tăng cường vận động.' };
    return { status: 'danger', statusText: 'Béo phì', tooltip: 'BMI ≥ 30: Béo phì. Nguy cơ cao mắc các bệnh lý. Cần gặp chuyên gia tư vấn.' };
  };

  // --- Phần Render ---
  if (isLoadingDashboard) { // Chỉ check loading ban đầu cho dashboard cards
    return (
      <div className="flex items-center justify-center h-screen -mt-16">
        <div className={spinnerClass}></div>
        <p className="ml-4 text-lg text-gray-600">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
    return <div className="p-6 text-red-600 bg-red-100 border border-red-400 rounded-md">{dashboardError}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Xin chào, {user?.username || 'User'}!
        </h1>
        <p className="text-gray-600">Đây là tổng quan về các chỉ số sức khỏe của bạn.</p>
      </div>

      {/* Phần 1: Các chỉ số sức khỏe hiện tại */}
  <section>
    <h2 className="text-xl font-semibold text-brand-green-dark mb-4">Các chỉ số sức khỏe hiện tại</h2>
    {dashboardData ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Cân nặng" 
          value={dashboardData.weight?.value} 
          unit={dashboardData.weight?.unit || 'kg'} 
          lastUpdatedAt={dashboardData.weight?.lastUpdatedAt}
          tooltipInfo="Cân nặng hiện tại của bạn."
          // previousValue={...} // Cần lấy từ API nếu muốn so sánh
        />
        <MetricCard 
          title="Chiều cao" 
          value={dashboardData.height?.value} 
          unit={dashboardData.height?.unit || 'cm'} 
          lastUpdatedAt={dashboardData.height?.lastUpdatedAt}
          tooltipInfo="Chiều cao được ghi nhận gần nhất."
        />
        {(() => { // Sử dụng IIFE để chứa logic cho BMI
          const bmiDetails = getBmiDetails(dashboardData.bmi?.value);
          return (
            <MetricCard 
              title="BMI" 
              value={dashboardData.bmi?.value} 
              unit={dashboardData.bmi?.unit || 'kg/m²'} 
              lastUpdatedAt={dashboardData.bmi?.lastUpdatedAt}
              status={bmiDetails.status}
              statusText={bmiDetails.statusText}
              tooltipInfo={bmiDetails.tooltip}
            />
          );
        })()}
        <MetricCard 
          title="BMR" 
          value={dashboardData.bmr?.value} 
          unit={dashboardData.bmr?.unit || 'kcal/ngày'} 
          lastUpdatedAt={dashboardData.bmr?.lastUpdatedAt}
          tooltipInfo="Tỷ lệ trao đổi chất cơ bản - năng lượng cơ thể bạn cần khi nghỉ ngơi hoàn toàn."
        />
        <MetricCard 
          title="TDEE" 
          value={dashboardData.tdee?.value} 
          unit={dashboardData.tdee?.unit || 'kcal/ngày'} 
          lastUpdatedAt={dashboardData.tdee?.lastUpdatedAt}
          tooltipInfo="Tổng năng lượng tiêu thụ hàng ngày, bao gồm cả vận động."
        />
        <MetricCard 
          title="Mỡ cơ thể (PBF)" 
          value={dashboardData.pbf?.value} 
          unit={dashboardData.pbf?.unit || '%'} 
          lastUpdatedAt={dashboardData.pbf?.lastUpdatedAt}
          tooltipInfo="Tỷ lệ phần trăm mỡ trong cơ thể."
        />
        <MetricCard 
          title="Tỷ lệ Eo/Hông (WHR)" 
          value={dashboardData.whr?.value} 
          unit={dashboardData.whr?.unit || ''} 
          lastUpdatedAt={dashboardData.whr?.lastUpdatedAt}
          tooltipInfo="Tỷ lệ giữa chu vi vòng eo và vòng hông, đánh giá sự phân bổ mỡ."
        />
      </div>
    ) : (
      <p className="text-gray-500">Chưa có dữ liệu để hiển thị.</p>
    )}
  </section>

      {/* Phần Filter cho Biểu đồ */}
      <section className="my-8 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-brand-gray-dark mb-3">Tùy chỉnh Biểu đồ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Chọn chỉ số:</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border rounded-md">
              {ALL_AVAILABLE_CHART_TYPES.map(({ typeName, label }) => (
                <label key={typeName} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-brand-green rounded border-gray-300 focus:ring-brand-green-light"
                    checked={selectedChartTypeNames.includes(typeName)}
                    onChange={() => {
                      setSelectedChartTypeNames(prev =>
                        prev.includes(typeName)
                          ? prev.filter(t => t !== typeName)
                          : [...prev, typeName]
                      );
                    }}
                  />
                  <span className="text-brand-gray-dark">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-gray-dark mb-1">Khoảng thời gian:</label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-medium focus:ring focus:ring-brand-green-light focus:ring-opacity-50 p-2 text-sm"
                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : null }))}
              />
              <span className="text-gray-500 text-sm">đến</span>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-medium focus:ring focus:ring-brand-green-light focus:ring-opacity-50 p-2 text-sm"
                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : null }))}
              />
            </div>
            <div className="mt-2 space-x-1 sm:space-x-2">
              {(['7D', '1M', '3M', '6M', '1Y'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setQuickDateRange(period)}
                  className="px-2 sm:px-3 py-1 text-xs font-medium text-brand-green-dark bg-brand-green-light rounded-full hover:bg-brand-green hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-green-medium transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="granularity" className="block text-sm font-medium text-brand-gray-dark mb-1">Xem theo:</label>
            <select
              id="granularity"
              name="granularity"
              value={selectedGranularity}
              onChange={(e) => setSelectedGranularity(e.target.value as Granularity)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-medium focus:ring focus:ring-brand-green-light focus:ring-opacity-50 p-2 text-sm"
            >
              <option value="DAILY">Hàng Ngày</option>
              <option value="WEEKLY">Hàng Tuần</option>
              <option value="MONTHLY">Hàng Tháng</option>
              <option value="NONE">Tất cả điểm</option>
            </select>
          </div>
        </div>
      </section>

      {/* Phần 2: Biểu đồ theo dõi sự thay đổi */}
      <section>
        {/* <h2 className="text-xl font-semibold text-brand-green-dark mb-4">Biểu đồ theo dõi sự thay đổi</h2> */}
        {isChartsLoading && (
            <div className="flex items-center justify-center h-64">
                <div className={spinnerClass}></div> <p className="ml-3">Đang tải dữ liệu biểu đồ...</p>
            </div>
        )}
        {!isChartsLoading && chartsError && (
             <p className="text-center text-red-500 py-8">{chartsError}</p>
        )}
        {!isChartsLoading && !chartsError && selectedChartTypeNames.length > 0 ? (
          <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6 custom-scrollbar">
            {ALL_AVAILABLE_CHART_TYPES
              .filter(chartInfo => selectedChartTypeNames.includes(chartInfo.typeName))
              .map(chartInfo => (
                <div key={chartInfo.typeName} className="min-w-[280px] sm:min-w-[320px] md:min-w-[400px] lg:min-w-[450px] flex-shrink-0">
                  <TrendChart
                    title={chartInfo.label}
                    data={chartsData[chartInfo.typeName] || []}
                    unit={chartInfo.unit}
                    lineColor={chartInfo.color}
                    dataKey="value"
                    xAxisDataKey="date"
                    // isLoading đã được xử lý ở trên
                    onChartClick={() => openChartModal(chartsData[chartInfo.typeName] || [], chartInfo.label, chartInfo.unit)}
                  />
                </div>
              ))}
          </div>
        ) : (
          !isChartsLoading && !chartsError && <p className="text-center text-gray-500 py-8">Vui lòng chọn ít nhất một chỉ số để hiển thị biểu đồ.</p>
        )}
      </section>

      {/* Modal hiển thị chi tiết biểu đồ */}
      {isModalOpen && modalChartData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] p-4 sm:p-6 flex flex-col transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modalOpen">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-gray-dark">{modalChartTitle}</h3>
              <button
                onClick={closeChartModal}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-grow h-0"> {/* h-0 và flex-grow để Recharts chiếm đúng không gian */}
              <TrendChart
                  data={modalChartData}
                  title="" // Không cần title phụ nữa
                  unit={modalChartUnit}
                  lineColor={ALL_AVAILABLE_CHART_TYPES.find(c => c.label === modalChartTitle)?.color || '#34D399'} // Lấy lại màu
                  dataKey="value"
                  xAxisDataKey="date"
              />
            </div>
          </div>
        </div>
      )}
      {/* Keyframe cho animation modal (thêm vào src/index.css) */}
      {/*
        @keyframes modalOpen {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-modalOpen {
          animation: modalOpen 0.3s ease-out forwards;
        }
      */}

      {/* Phần 3: Bảng lịch sử chi tiết */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-brand-green-dark mb-4">Bảng lịch sử chi tiết</h2>
        <div className="bg-white p-4 rounded-xl shadow-lg min-h-[200px] flex items-center justify-center text-gray-400">
          Bảng Lịch sử (Sắp có)
        </div>
      </section>
    </div>
  );
};

export default HomePage;