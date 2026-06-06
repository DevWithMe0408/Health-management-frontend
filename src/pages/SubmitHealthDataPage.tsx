import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ACTIVITY_OPTIONS,
  ActionBar,
  AdvancedAccordion,
  BasicInfoCard,
  ConfirmModal,
  HeaderCard,
  MeasurementsCard,
  ResultPanel,
  SubmitSkeleton,
} from '../components/submitData/parts';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardMetrics } from '../services/dashboard.service';
import type { DashboardMetricsResponse } from '../services/dashboard.service';
import { getApiErrorMessage } from '../services/apiResponse';
import { getLatestHealthData, submitHealthData } from '../services/healthData.service';
import { SubmitHealthDataSchema } from '../types/healthData.schemas';
import type { SubmitHealthApiRequest, SubmitHealthDataFormData } from '../types/healthData.schemas';

const FORM_FIELDS: Array<keyof SubmitHealthDataFormData> = [
  'height',
  'weight',
  'abdomen',
  'hip',
  'neck',
  'bust',
  'thigh',
  'activityFactor',
  'BMINew',
  'BMRNew',
  'TDEENew',
  'PBFNew',
  'WHRNew',
];

type FieldChange = { label: string; from: string; to: string };

const FIELD_META: Record<keyof SubmitHealthDataFormData, { label: string; unit?: string }> = {
  height: { label: 'Chiều cao', unit: 'cm' },
  weight: { label: 'Cân nặng', unit: 'kg' },
  abdomen: { label: 'Vòng bụng', unit: 'cm' },
  hip: { label: 'Vòng hông', unit: 'cm' },
  neck: { label: 'Vòng cổ', unit: 'cm' },
  bust: { label: 'Vòng ngực', unit: 'cm' },
  thigh: { label: 'Vòng đùi', unit: 'cm' },
  activityFactor: { label: 'Mức vận động' },
  BMINew: { label: 'BMI' },
  BMRNew: { label: 'BMR', unit: 'kcal/ngày' },
  TDEENew: { label: 'TDEE', unit: 'kcal/ngày' },
  PBFNew: { label: 'PBF', unit: '%' },
  WHRNew: { label: 'WHR' },
};

const createEmptyFormValues = (): SubmitHealthDataFormData => ({
  height: null,
  weight: null,
  abdomen: null,
  hip: null,
  neck: null,
  bust: null,
  thigh: null,
  activityFactor: null,
  BMINew: null,
  BMRNew: null,
  TDEENew: null,
  PBFNew: null,
  WHRNew: null,
});

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const toFormValues = (baseMetrics?: Record<string, number | null>): SubmitHealthDataFormData => {
  const formValues = createEmptyFormValues();
  if (!baseMetrics) return formValues;

  formValues.height = baseMetrics.HEIGHT ?? null;
  formValues.weight = baseMetrics.WEIGHT ?? null;
  formValues.abdomen = baseMetrics.ABDOMEN ?? null;
  formValues.hip = baseMetrics.HIP ?? null;
  formValues.neck = baseMetrics.NECK ?? null;
  formValues.bust = baseMetrics.BUST ?? null;
  formValues.thigh = baseMetrics.THIGH ?? null;
  formValues.activityFactor = baseMetrics.ACTIVITY_FACTOR ?? null;

  return formValues;
};

const cleanFormData = (formData: SubmitHealthDataFormData): Partial<SubmitHealthDataFormData> => {
  const cleanedData: Partial<SubmitHealthDataFormData> = {};

  FORM_FIELDS.forEach((key) => {
    const value = formData[key];
    if (value != null) {
      cleanedData[key] = value;
    }
  });

  return cleanedData;
};

const formatFieldValue = (
  name: keyof SubmitHealthDataFormData,
  value: number | null | undefined
): string => {
  if (value == null) return '—';
  if (name === 'activityFactor') {
    const option = ACTIVITY_OPTIONS.find((item) => item.value === value);
    return option ? option.title : String(value);
  }

  const meta = FIELD_META[name];
  const formattedNumber = value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  return meta.unit ? `${formattedNumber} ${meta.unit}` : formattedNumber;
};

const buildChanges = (
  previous: SubmitHealthDataFormData,
  next: SubmitHealthDataFormData
): FieldChange[] => {
  const changes: FieldChange[] = [];

  FORM_FIELDS.forEach((name) => {
    const before = previous[name] ?? null;
    const after = next[name] ?? null;

    if (before !== after && after != null) {
      changes.push({
        label: FIELD_META[name].label,
        from: formatFieldValue(name, before),
        to: formatFieldValue(name, after),
      });
    }
  });

  return changes;
};

const SubmitHealthDataPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [autoMetrics, setAutoMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [result, setResult] = useState<DashboardMetricsResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingData, setPendingData] = useState<SubmitHealthDataFormData | null>(null);
  const [changes, setChanges] = useState<FieldChange[]>([]);
  const prefilledRef = useRef<SubmitHealthDataFormData>(createEmptyFormValues());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmitHealthDataFormData>({
    resolver: zodResolver(SubmitHealthDataSchema) as Resolver<SubmitHealthDataFormData>,
    defaultValues: createEmptyFormValues(),
  });

  useEffect(() => {
    let cancelled = false;

    const fetchInitialData = async () => {
      setIsFetching(true);
      try {
        const [latestData, dashboardMetrics] = await Promise.all([
          getLatestHealthData(),
          getDashboardMetrics().catch(() => null),
        ]);

        if (cancelled) return;

        const formValues = toFormValues(latestData.baseMetrics);
        prefilledRef.current = formValues;
        reset(formValues);
        setAutoMetrics(dashboardMetrics);
      } catch (error) {
        if (cancelled) return;
        toast.error(getApiErrorMessage(error, 'Không thể tải dữ liệu gần nhất.'));
        const emptyValues = createEmptyFormValues();
        prefilledRef.current = emptyValues;
        reset(emptyValues);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    void fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onValidSubmit: SubmitHandler<SubmitHealthDataFormData> = (formData) => {
    if (!user?.userId) {
      toast.error('Bạn cần đăng nhập để thực hiện hành động này.');
      return;
    }

    const diff = buildChanges(prefilledRef.current, formData);
    if (diff.length === 0) {
      toast.info('Không có thay đổi để lưu.');
      return;
    }

    setPendingData(formData);
    setChanges(diff);
    setConfirmOpen(true);
  };

  const performSubmit = async (formData: SubmitHealthDataFormData) => {
    if (!user?.userId) return;

    setSaving(true);
    try {
      const apiRequestData: SubmitHealthApiRequest = {
        ...cleanFormData(formData),
        userId: user.userId,
      };

      const response = await submitHealthData(apiRequestData);
      toast.success(response.message || 'Đã cập nhật chỉ số.');

      const dashboardMetrics = await getDashboardMetrics();
      setResult(dashboardMetrics);
      setAutoMetrics(dashboardMetrics);
      prefilledRef.current = formData;
      reset(formData);

      setConfirmOpen(false);
      setPendingData(null);
      setChanges([]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Gửi dữ liệu thất bại.'));
    } finally {
      setSaving(false);
    }
  };

  if (isFetching) return <SubmitSkeleton />;

  const lastUpdated = formatDate(
    autoMetrics?.weight?.lastUpdatedAt
      ?? autoMetrics?.height?.lastUpdatedAt
      ?? autoMetrics?.bmi?.lastUpdatedAt
  );

  return (
    <div className="space-y-5 pb-2">
      <HeaderCard lastUpdated={lastUpdated} />

      {result && (
        <ResultPanel
          metrics={result}
          onContinue={() => setResult(null)}
          onDashboard={() => navigate('/dashboard')}
        />
      )}

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5">
        <BasicInfoCard
          register={register}
          errors={errors}
          activityValue={watch('activityFactor') ?? undefined}
          onActivityChange={(value) => {
            setValue('activityFactor', value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />

        <MeasurementsCard register={register} errors={errors} />

        <AdvancedAccordion
          open={advancedOpen}
          onToggle={() => setAdvancedOpen((open) => !open)}
          register={register}
          errors={errors}
          autoMetrics={autoMetrics}
        />

        <ActionBar saving={saving} onReset={() => reset(prefilledRef.current)} />
      </form>
      <ConfirmModal
        open={confirmOpen}
        changes={changes}
        saving={saving}
        onConfirm={() => {
          if (pendingData) void performSubmit(pendingData);
        }}
        onCancel={() => {
          if (!saving) {
            setConfirmOpen(false);
            setPendingData(null);
          }
        }}
      />
    </div>
  );
};

export default SubmitHealthDataPage;
