import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
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

const meta: Record<
  ConstitutionCode,
  { label: string; border: string; bg: string; text: string; Icon: typeof CheckCircleIcon }
> = {
  GAY: {
    label: 'Gầy',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    Icon: InformationCircleIcon,
  },
  CAN_DOI: {
    label: 'Cân đối',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    Icon: CheckCircleIcon,
  },
  THUA_CAN: {
    label: 'Thừa cân',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    Icon: ExclamationTriangleIcon,
  },
  BEO_PHI: {
    label: 'Béo phì',
    border: 'border-red-300',
    bg: 'bg-red-50',
    text: 'text-red-700',
    Icon: ExclamationTriangleIcon,
  },
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa có thời gian cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có thời gian cập nhật';
  return `Cập nhật ${date.toLocaleDateString('vi-VN')}`;
};

const BmiScale: React.FC<{ bmi: number | null }> = ({ bmi }) => {
  const marker = bmi == null ? null : Math.max(2, Math.min(98, ((bmi - 14) / 18) * 100));

  return (
    <div className="mt-5">
      <div className="relative flex h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="w-[25%] bg-amber-400" />
        <div className="w-[25%] bg-emerald-500" />
        <div className="w-[25%] bg-orange-500" />
        <div className="w-[25%] bg-red-500" />
        {marker != null && (
          <span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-900 shadow"
            style={{ left: `${marker}%` }}
          />
        )}
      </div>
      <div className="mt-2 grid grid-cols-4 text-[11px] font-medium text-gray-500">
        <span>Gầy</span>
        <span className="text-center">Cân đối</span>
        <span className="text-center">Thừa cân</span>
        <span className="text-right">Béo phì</span>
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
  const Icon = currentMeta.Icon;
  const updatedAt = constitution.computedAt || bmiMetric?.recordedAt || bmiMetric?.lastUpdatedAt;

  return (
    <DashboardCard
      title="Thể trạng hiện tại"
      rightAction={
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
          <InformationCircleIcon className="h-4 w-4" />
          BMI + PBF
        </span>
      }
    >
      <div className={`rounded-lg border ${currentMeta.border} ${currentMeta.bg} p-5`}>
        <div className="flex items-start gap-4">
          <div className={`rounded-md bg-white p-3 ${currentMeta.text}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-2xl font-bold ${currentMeta.text}`}>{currentMeta.label}</div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
              <span>
                BMI <b>{constitution.bmi?.toFixed(1) ?? '--'}</b>
              </span>
              <span>
                PBF <b>{constitution.pbf != null ? `${constitution.pbf.toFixed(1)}%` : '--'}</b>
              </span>
              <span>
                Nguồn PBF <b>{constitution.pbfSource === 'FORMULA' ? 'Navy' : 'Model 1'}</b>
              </span>
            </div>
            {constitution.warning && (
              <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                {constitution.warning}
              </div>
            )}
          </div>
        </div>
        <BmiScale bmi={constitution.bmi} />
      </div>
      <p className="mt-3 text-xs text-gray-500">{formatDateTime(updatedAt)}</p>
    </DashboardCard>
  );
};

export default ConstitutionCard;
