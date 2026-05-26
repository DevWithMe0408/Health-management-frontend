import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { ConstitutionResponse } from '../../services/constitution.service';
import type { MetricDataResponse } from '../../services/dashboard.service';
import type { ConstitutionCode } from '../../types/refactorUi.types';
import DashboardCard from './DashboardCard';

interface ConstitutionCardProps {
  constitution: ConstitutionResponse | null;
  bmiMetric?: MetricDataResponse;
  error?: string;
  onRetry: () => void;
}

const ConstitutionGlyph: React.FC<{ type: 'thin' | 'check' | 'warn'; color: string }> = ({ type, color }) => {
  if (type === 'check') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.75" />
        <path
          d="M7 12.5l3.5 3.5L17 9"
          stroke={color}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.5" stroke={color} strokeWidth="1.75" />
      <path
        d="M10 9v6l-1.5 6M14 9v6l1.5 6M9 14h6"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

const meta: Record<
  ConstitutionCode,
  {
    label: string;
    border: string;
    bg: string;
    text: string;
    iconHex: string;
    glyph: 'thin' | 'check' | 'warn';
    advice: string;
  }
> = {
  GAY: {
    label: 'GẦY',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    iconHex: '#f59e0b',
    glyph: 'thin',
    advice: 'Nên tăng cân lành mạnh, ưu tiên đạm và tinh bột tốt.',
  },
  CAN_DOI: {
    label: 'CÂN ĐỐI',
    border: 'border-emerald-200',
    bg: 'bg-brand-green-light',
    text: 'text-brand-green-darker',
    iconHex: '#059669',
    glyph: 'check',
    advice: 'Duy trì chế độ ăn cân bằng và vận động đều đặn.',
  },
  THUA_CAN: {
    label: 'THỪA CÂN',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    iconHex: '#ea580c',
    glyph: 'warn',
    advice: 'Cân nhắc giảm tinh bột tinh chế, tăng rau xanh và vận động.',
  },
  BEO_PHI: {
    label: 'BÉO PHÌ',
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
    iconHex: '#dc2626',
    glyph: 'warn',
    advice: 'Cần giảm cân có kế hoạch. Nên tham khảo bác sĩ dinh dưỡng.',
  },
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa có thời gian cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có thời gian cập nhật';
  return `Cập nhật ${date.toLocaleDateString('vi-VN')}`;
};

const BmiScale: React.FC<{ bmi: number | null }> = ({ bmi }) => {
  const MIN = 14;
  const MAX = 30;
  const marker = bmi == null ? null : Math.max(2, Math.min(98, ((bmi - MIN) / (MAX - MIN)) * 100));
  const segments = [
    { color: 'bg-amber-400', width: ((18.5 - MIN) / (MAX - MIN)) * 100 },
    { color: 'bg-emerald-500', width: ((23 - 18.5) / (MAX - MIN)) * 100 },
    { color: 'bg-orange-500', width: ((25 - 23) / (MAX - MIN)) * 100 },
    { color: 'bg-red-500', width: ((MAX - 25) / (MAX - MIN)) * 100 },
  ];

  return (
    <div className="mt-5">
      <div className="relative flex h-2 gap-0.5 overflow-visible">
        {segments.map((segment, index) => (
          <div
            key={segment.color}
            className={`${segment.color} ${index === 0 ? 'rounded-l-full' : ''} ${
              index === segments.length - 1 ? 'rounded-r-full' : ''
            }`}
            style={{ width: `${segment.width}%`, opacity: 0.85 }}
          />
        ))}
        {marker != null && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-900 bg-white"
            style={{ left: `${marker}%`, boxShadow: '0 2px 4px rgba(0,0,0,.2)' }}
          />
        )}
      </div>
      <div
        className="mt-2 flex justify-between text-[10.5px] font-medium text-gray-400"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <span>14</span>
        <span>18.5</span>
        <span>23</span>
        <span>25</span>
        <span>30+</span>
      </div>
    </div>
  );
};

const ConstitutionCard: React.FC<ConstitutionCardProps> = ({
  constitution,
  bmiMetric,
  error,
  onRetry,
}) => {
  if (error && !constitution) {
    return (
      <DashboardCard title="Thể trạng hiện tại">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <div className="text-sm font-semibold text-amber-900">Chưa đủ dữ liệu thể trạng</div>
              <p className="mt-1 text-sm leading-6 text-amber-800">{error}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/submit-data"
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Cập nhật chỉ số
                </Link>
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (!constitution) {
    return (
      <DashboardCard title="Thể trạng hiện tại">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-5 text-center">
          <InformationCircleIcon className="mx-auto h-8 w-8 text-gray-400" />
          <div className="mt-3 text-sm font-semibold text-gray-900">Chưa có dữ liệu</div>
          <p className="mt-1 text-sm text-gray-500">Cập nhật chiều cao và cân nặng để xem phân loại.</p>
          <Link
            to="/submit-data"
            className="mt-4 inline-flex rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            Cập nhật ngay
          </Link>
        </div>
      </DashboardCard>
    );
  }

  const currentMeta = meta[constitution.constitution];
  const updatedAt = constitution.computedAt || bmiMetric?.recordedAt || bmiMetric?.lastUpdatedAt;

  return (
    <DashboardCard title="Thể trạng hiện tại" info="Phân loại theo BMI + PBF (worst case principle)">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl border ${currentMeta.border} ${currentMeta.bg}`}
        >
          <ConstitutionGlyph type={currentMeta.glyph} color={currentMeta.iconHex} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-2xl font-extrabold tracking-tight ${currentMeta.text}`}>
            {currentMeta.label}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
            <span>
              <span className="mr-1 text-gray-400">BMI</span>
              <b className="text-gray-900">{constitution.bmi?.toFixed(1) ?? '--'}</b>
            </span>
            {constitution.pbf != null && (
              <>
                <span className="text-gray-200">·</span>
                <span>
                  <span className="mr-1 text-gray-400">PBF</span>
                  <b className="text-gray-900">{constitution.pbf.toFixed(1)}%</b>
                  <span className="ml-1.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10.5px] font-medium text-gray-500">
                    {constitution.pbfSource === 'FORMULA' ? 'Navy' : 'ML'}
                  </span>
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600">{currentMeta.advice}</p>
        </div>
      </div>

      <BmiScale bmi={constitution.bmi ?? null} />

      {constitution.warning && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-700">
          <span className="text-base">💡</span>
          <span className="flex-1">{constitution.warning}</span>
          <Link
            to="/submit-data"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Cập nhật →
          </Link>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span>{formatDateTime(updatedAt)}</span>
        <Link to="/stats" className="font-semibold text-brand-green hover:text-brand-green-dark">
          Xem chi tiết →
        </Link>
      </div>
    </DashboardCard>
  );
};

export default ConstitutionCard;
