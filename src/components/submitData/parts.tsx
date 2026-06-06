import React, { forwardRef } from 'react';
import type { FieldErrors, FieldPath, UseFormRegister } from 'react-hook-form';
import type { DashboardMetricsResponse } from '../../services/dashboard.service';
import type { SubmitHealthDataFormData } from '../../types/healthData.schemas';

export const CARD_SHADOW = { boxShadow: '0 12px 32px -16px rgba(15,31,26,.18)' };

type FormFieldName = FieldPath<SubmitHealthDataFormData>;
type Reg = UseFormRegister<SubmitHealthDataFormData>;
type Errs = FieldErrors<SubmitHealthDataFormData>;

interface IconProps {
  d: string | string[];
  className?: string;
  sw?: number;
}

export function Ico({ d, className = 'h-5 w-5', sw = 1.7 }: IconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={sw} stroke="currentColor" className={className}>
      {Array.isArray(d) ? (
        d.map((p, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />)
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      )}
    </svg>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ icon, title, hint, children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-gray-100 bg-white p-6 lg:p-7 ${className}`} style={CARD_SHADOW}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-brand-green-light text-brand-green-darker">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold tracking-tight text-gray-900">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

interface NumberFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  optional?: boolean;
  error?: string;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, unit, optional, error, className = '', type = 'number', step = '0.1', ...rest }, ref) => {
    const base =
      'w-full rounded-xl border-2 bg-white px-3.5 py-3 text-base text-gray-900 ' +
      'outline-none transition-all duration-200 placeholder:text-gray-400 ' +
      'focus:border-brand-green focus:ring-4 focus:ring-brand-green-light';
    const state = error ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-200';

    return (
      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <label className="text-sm font-semibold text-gray-800">{label}</label>
          {optional && <span className="text-xs font-normal text-gray-400">(tùy chọn)</span>}
        </div>
        <div className="relative">
          <input
            ref={ref}
            type={type}
            step={step}
            inputMode="decimal"
            className={`${base} ${state} ${unit ? 'pr-12' : ''} ${className}`}
            {...rest}
          />
          {unit && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
              {unit}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
            <Ico d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" className="h-3.5 w-3.5" sw={2} />
            {error}
          </p>
        )}
      </div>
    );
  }
);
NumberField.displayName = 'NumberField';

export const ACTIVITY_OPTIONS = [
  {
    value: 1.2,
    title: 'Ít vận động',
    desc: 'Làm văn phòng cả ngày, hầu như không tập',
    icon: 'M6.75 7.5h10.5M6.75 7.5V18a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5V7.5M9 11.25h6',
  },
  {
    value: 1.375,
    title: 'Vận động nhẹ',
    desc: 'Đi bộ thường xuyên, tập 1-3 buổi/tuần',
    icon: 'M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6 21l3-6 3 1.5V21m3-9l-3-2.25L9 12l-3 3',
  },
  {
    value: 1.55,
    title: 'Vận động vừa',
    desc: 'Tập đều 3-5 buổi/tuần',
    icon: 'M13.5 6a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM5 20l4-7 4 2 3-4m0 0l3 3m-3-3v9',
  },
  {
    value: 1.725,
    title: 'Vận động nhiều',
    desc: 'Tập 6-7 buổi/tuần',
    icon: 'M7 14.25l2.5-2.5M3.75 11.25l2.5 2.5M16.5 9.75l3.75-3.75M14 12l-2 2m6.25-2.25l1.5 1.5M9.75 16.5L6 20.25',
  },
  {
    value: 1.9,
    title: 'Rất vận động',
    desc: 'Lao động chân tay nặng và tập gym',
    icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z',
  },
] as const;

interface ActivityRadioProps {
  selectedValue?: number;
  onChange: (value: number) => void;
}

export function ActivityRadio({ selectedValue, onChange }: ActivityRadioProps) {
  return (
    <div className="grid gap-2.5">
      {ACTIVITY_OPTIONS.map((opt) => {
        const selected = opt.value === selectedValue;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${
              selected ? 'border-brand-green bg-brand-green-light' : 'border-gray-100 bg-white hover:border-emerald-200'
            }`}
          >
            <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl ${selected ? 'bg-white text-brand-green-dark' : 'bg-gray-50 text-gray-500'}`}>
              <Ico d={opt.icon} className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className={`block text-sm font-semibold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>{opt.title}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{opt.desc}</span>
            </span>
            <span className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full transition ${
              selected ? 'bg-brand-green text-white shadow-md' : 'border-2 border-gray-200 bg-white'
            }`}>
              {selected && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface InfoStripProps {
  children: React.ReactNode;
}

export function InfoStrip({ children }: InfoStripProps) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-700">
      <Ico d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
      <span>{children}</span>
    </div>
  );
}

interface GenderWarningProps {
  onUpdateProfile?: () => void;
}

export function GenderWarning({ onUpdateProfile }: GenderWarningProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
      <Ico d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-800">Cần bổ sung giới tính trong hồ sơ để tính PBF.</p>
        <p className="mt-0.5 text-amber-700">Công thức Navy cần giới tính để ước lượng tỉ lệ mỡ cơ thể.</p>
      </div>
      <button
        type="button"
        onClick={onUpdateProfile}
        className="flex-shrink-0 self-center rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800"
      >
        Cập nhật hồ sơ
      </button>
    </div>
  );
}

interface HeaderCardProps {
  lastUpdated?: string | null;
}

export function HeaderCard({ lastUpdated }: HeaderCardProps) {
  return (
    <section
      className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-brand-green-light via-emerald-50 to-white p-6 lg:p-7"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cập nhật chỉ số sức khỏe</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Nhập số đo mới nhất để hệ thống tính lại BMI, BMR, TDEE và tỉ lệ mỡ cơ thể (PBF).
          </p>
        </div>
        {lastUpdated && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white/70 px-3 py-2 text-xs font-medium text-gray-600">
              <Ico d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" className="h-4 w-4 text-brand-green" />
              Cập nhật lần gần nhất: <b className="text-gray-900">{lastUpdated}</b>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

const getErrorMessage = (errors: Errs, name: FormFieldName) => {
  const error = errors[name as keyof SubmitHealthDataFormData];
  return typeof error?.message === 'string' ? error.message : undefined;
};

export const MEASUREMENTS = [
  { name: 'abdomen', label: 'Vòng bụng (đo ngang rốn)' },
  { name: 'hip', label: 'Vòng hông' },
  { name: 'neck', label: 'Vòng cổ' },
  { name: 'bust', label: 'Vòng ngực' },
  { name: 'thigh', label: 'Vòng đùi' },
] satisfies Array<{ name: FormFieldName; label: string }>;

export const ADVANCED = [
  { name: 'BMINew', metricKey: 'bmi', label: 'BMI', unit: '', desc: 'Chỉ số khối cơ thể (cân nặng / chiều cao bình phương)' },
  { name: 'BMRNew', metricKey: 'bmr', label: 'BMR', unit: 'kcal/ngày', desc: 'Năng lượng tiêu hao khi nghỉ hoàn toàn' },
  { name: 'TDEENew', metricKey: 'tdee', label: 'TDEE', unit: 'kcal/ngày', desc: 'Tổng năng lượng tiêu hao mỗi ngày' },
  { name: 'PBFNew', metricKey: 'pbf', label: 'PBF', unit: '%', desc: 'Tỉ lệ phần trăm mỡ cơ thể (công thức Navy)' },
  { name: 'WHRNew', metricKey: 'whr', label: 'WHR', unit: '', desc: 'Tỉ lệ vòng bụng / vòng hông' },
] satisfies Array<{
  name: FormFieldName;
  metricKey: keyof DashboardMetricsResponse;
  label: string;
  unit: string;
  desc: string;
}>;

interface BasicInfoCardProps {
  register: Reg;
  errors: Errs;
  activityValue?: number;
  onActivityChange: (value: number) => void;
}

export function BasicInfoCard({ register, errors, activityValue, onActivityChange }: BasicInfoCardProps) {
  return (
    <SectionCard
      title="Chỉ số cơ bản"
      hint="Chiều cao, cân nặng và mức vận động."
      icon={<Ico d="M3 13.125C3 12.504 3.504 12 4.125 12h3.75c.621 0 1.125.504 1.125 1.125v6.75C9 20.496 8.496 21 7.875 21h-3.75A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 01-1.125-1.125V4.125z" className="h-5 w-5" />}
    >
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
        <NumberField label="Chiều cao" unit="cm" error={getErrorMessage(errors, 'height')} {...register('height')} />
        <NumberField label="Cân nặng" unit="kg" error={getErrorMessage(errors, 'weight')} {...register('weight')} />
      </div>
      <div className="mt-6">
        <div className="mb-2.5 text-sm font-semibold text-gray-800">Mức vận động</div>
        <ActivityRadio selectedValue={activityValue} onChange={onActivityChange} />
      </div>
    </SectionCard>
  );
}

interface MeasurementsCardProps {
  register: Reg;
  errors: Errs;
}

export function MeasurementsCard({ register, errors }: MeasurementsCardProps) {
  return (
    <SectionCard
      title="Số đo vòng cơ thể"
      hint="Dùng để ước lượng tỉ lệ mỡ cơ thể (PBF)."
      icon={<Ico d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" className="h-5 w-5" />}
    >
      <InfoStrip>
        Các số đo này dùng để tính tỉ lệ mỡ cơ thể (PBF) theo công thức Navy. Nam cần vòng cổ và vòng bụng; nữ cần thêm vòng hông.
      </InfoStrip>
      <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
        {MEASUREMENTS.map((m) => (
          <NumberField key={m.name} label={m.label} unit="cm" optional error={getErrorMessage(errors, m.name)} {...register(m.name)} />
        ))}
      </div>
    </SectionCard>
  );
}

export const fmtAuto = (value: number | null | undefined, unit?: string) => {
  if (value == null) return undefined;
  const formatted = value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  return unit ? `${formatted} ${unit}` : formatted;
};

interface AdvancedItem {
  name: FormFieldName;
  metricKey: keyof DashboardMetricsResponse;
  label: string;
  unit: string;
  desc: string;
}

interface AdvancedFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  item: AdvancedItem;
  autoValue?: string;
  error?: string;
}

export const AdvancedField = forwardRef<HTMLInputElement, AdvancedFieldProps>(
  ({ item, autoValue, error, type = 'number', step = '0.01', ...rest }, ref) => (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-tight text-gray-900">{item.label}</span>
          <span className="text-xs font-normal text-gray-400">(tùy chọn)</span>
        </div>
        {item.unit && <span className="text-[11px] font-medium text-gray-400">{item.unit}</span>}
      </div>
      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.desc}</p>
      <div className="relative mt-2.5">
        <input
          ref={ref}
          type={type}
          step={step}
          inputMode="decimal"
          placeholder={autoValue ? `Tự tính: ${autoValue}` : 'Để trống nếu không có máy đo'}
          className={`w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-base text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-300 hover:border-gray-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-100'
          }`}
          {...rest}
        />
      </div>
      {autoValue && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
          <Ico d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" className="h-3 w-3" sw={2} />
          Để trống, hệ thống dùng <b className="font-semibold text-gray-500">{autoValue}</b>
        </p>
      )}
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  )
);
AdvancedField.displayName = 'AdvancedField';

interface AdvancedAccordionProps {
  open: boolean;
  onToggle: () => void;
  register: Reg;
  errors: Errs;
  autoMetrics: DashboardMetricsResponse | null;
}

export function AdvancedAccordion({ open, onToggle, register, errors, autoMetrics }: AdvancedAccordionProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white" style={CARD_SHADOW}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-6 py-5 text-left lg:px-7">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-500">
          <Ico d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281z" className="h-5 w-5" sw={1.5} />
        </span>
        <span className="flex-1">
          <span className="block text-base font-bold tracking-tight text-gray-900">
            Chỉ số tự đo <span className="font-medium text-gray-400">(nâng cao)</span>
          </span>
          <span className="mt-0.5 block text-xs text-gray-500">Để trống thì hệ thống tự tính từ số đo phía trên.</span>
        </span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition ${open ? 'rotate-180 bg-gray-50' : ''}`}>
          <Ico d="M19.5 8.25l-7.5 7.5-7.5-7.5" className="h-5 w-5" sw={2} />
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-6 py-6 lg:px-7">
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-700">
            <Ico d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <span>Chỉ điền nếu bạn có thiết bị đo chuyên dụng. Để trống thì hệ thống tự tính từ số đo phía trên.</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ADVANCED.map((a) => (
              <AdvancedField
                key={a.name}
                item={a}
                autoValue={fmtAuto(autoMetrics?.[a.metricKey]?.value, a.unit)}
                error={getErrorMessage(errors, a.name)}
                {...register(a.name)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface ActionBarProps {
  saving?: boolean;
  onReset: () => void;
}

export function ActionBar({ saving = false, onReset }: ActionBarProps) {
  return (
    <div className="mt-2 rounded-3xl border border-gray-200 bg-brand-gray-light/80 px-4 py-4 md:px-6">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
        >
          Đặt lại
        </button>
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md transition ${
            saving ? 'cursor-not-allowed bg-brand-green/70' : 'bg-brand-green hover:bg-brand-green-dark'
          }`}
        >
          {saving && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}

export const RESULT_TILES = [
  { metricKey: 'bmi', label: 'BMI', helper: 'Bình thường', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5' },
  { metricKey: 'bmr', label: 'BMR', helper: 'kcal/ngày', bg: 'bg-orange-50', text: 'text-orange-700', icon: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z' },
  { metricKey: 'tdee', label: 'TDEE', helper: 'kcal/ngày', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
  { metricKey: 'pbf', label: 'PBF', helper: '% mỡ cơ thể', bg: 'bg-violet-50', text: 'text-violet-700', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
] satisfies Array<{
  metricKey: keyof DashboardMetricsResponse;
  label: string;
  helper: string;
  bg: string;
  text: string;
  icon: string;
}>;

const formatMetricValue = (value: number | null | undefined) => {
  if (value == null) return '--';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

interface ResultPanelProps {
  metrics: DashboardMetricsResponse;
  onContinue: () => void;
  onDashboard?: () => void;
}

export function ResultPanel({ metrics, onContinue, onDashboard }: ResultPanelProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-6 lg:p-7" style={CARD_SHADOW}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-brand-green text-white shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">Đã cập nhật!</h2>
          <p className="text-sm text-gray-500">Chỉ số mới của bạn:</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RESULT_TILES.map((t) => (
          <div key={t.label} className="rounded-2xl border border-gray-200 bg-white p-4" style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <div className={`mb-3 inline-flex rounded-xl ${t.bg} p-2.5 ${t.text}`}>
              <Ico d={t.icon} className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMetricValue(metrics[t.metricKey]?.value)}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.label}</div>
            <div className="mt-0.5 text-[11px] text-gray-400">{t.helper}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button type="button" onClick={onContinue} className="text-sm font-semibold text-gray-500">
          Tiếp tục chỉnh sửa
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-green-dark"
        >
          Xem dashboard
          <Ico d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="h-4 w-4" sw={2} />
        </button>
      </div>
    </section>
  );
}

interface SkProps {
  className: string;
}

export function Sk({ className }: SkProps) {
  return <div className={`animate-pulse rounded-2xl bg-gray-200/70 ${className}`} />;
}

export function SubmitSkeleton() {
  return (
    <div className="space-y-5 pb-2">
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 lg:p-7" style={CARD_SHADOW}>
        <Sk className="h-7 w-64" />
        <Sk className="mt-3 h-4 w-full max-w-md" />
      </section>
      <section className="rounded-3xl border border-gray-100 bg-white p-6 lg:p-7" style={CARD_SHADOW}>
        <div className="flex items-center gap-3">
          <Sk className="h-10 w-10" />
          <div className="flex-1">
            <Sk className="h-5 w-40" />
            <Sk className="mt-2 h-3 w-56" />
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Sk className="h-20" />
          <Sk className="h-20" />
        </div>
        <div className="mt-6 grid gap-3">
          <Sk className="h-20" />
          <Sk className="h-20" />
          <Sk className="h-20" />
        </div>
      </section>
      <section className="rounded-3xl border border-gray-100 bg-white p-6 lg:p-7" style={CARD_SHADOW}>
        <Sk className="h-5 w-44" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Sk className="h-20" />
          <Sk className="h-20" />
          <Sk className="h-20" />
          <Sk className="h-20" />
        </div>
      </section>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  changes: Array<{ label: string; from: string; to: string }>;
  saving?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  changes,
  saving = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Đóng xác nhận lưu"
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={() => {
          if (!saving) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 lg:p-7"
        style={{ boxShadow: '0 24px 60px -12px rgba(15,31,26,.35)' }}
      >
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-brand-green-light text-brand-green-dark">
            <Ico
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              className="h-5 w-5"
            />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold tracking-tight text-gray-900">Lưu thay đổi chỉ số?</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Hệ thống sẽ tính lại BMI, BMR, TDEE và PBF dựa trên số đo mới. Dữ liệu trước đó vẫn được lưu trong lịch sử.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {changes.length} chỉ số thay đổi
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {changes.map((change) => (
              <div
                key={change.label}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-700">{change.label}</span>
                <span className="flex items-center gap-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <span className="text-gray-400 line-through">{change.from}</span>
                  <Ico d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="h-3.5 w-3.5 text-brand-green" sw={2.2} />
                  <span className="font-semibold text-brand-green-darker">{change.to}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition ${
              saving ? 'cursor-not-allowed bg-brand-green/70' : 'bg-brand-green hover:bg-brand-green-dark'
            }`}
          >
            {saving && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {saving ? 'Đang lưu...' : 'Xác nhận lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
