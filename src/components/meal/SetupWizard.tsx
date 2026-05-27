import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BeakerIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Spinner from '../common/Spinner';
import { FIVE_MEAL_TYPES, MEAL_TYPE_ICON, MEAL_TYPE_LABEL, THREE_MEAL_TYPES } from '../../constants/mealType.constants';
import type { NutritionPreferences } from '../../hooks/useMealPreferences';
import type { MealKind, MealType, PerMealConfigMap, PerMealConfigRequest, PlanType } from '../../types/meal.types';

interface SetupWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (preferences: NutritionPreferences) => void | Promise<void>;
  mobile?: boolean;
}

interface MealConfigRowProps {
  mealType: MealType;
  config: PerMealConfigRequest;
  onChange: (mealType: MealType, config: PerMealConfigRequest) => void;
}

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (nextValue: number) => void;
}

const DEFAULT_CONFIG: Record<MealType, PerMealConfigRequest> = {
  SANG: { mealKind: 'COMBO' },
  PHU_SANG: { mealKind: 'COMBO' },
  TRUA: { mealKind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1 },
  PHU_CHIEU: { mealKind: 'COMBO' },
  TOI: { mealKind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1 },
};

const STEP_TITLES = ['Số bữa', 'Cấu hình', 'Xác nhận'];

const getMealTypes = (planType: PlanType) => (planType === '3_BUA' ? THREE_MEAL_TYPES : FIVE_MEAL_TYPES);

const normalizeConfig = (config: PerMealConfigRequest): PerMealConfigRequest => {
  if (config.mealKind === 'COMBO') return { mealKind: 'COMBO' };

  return {
    mealKind: 'NHIEU_MON',
    nMain: config.nMain ?? 1,
    nRau: config.nRau ?? 1,
    nCarb: config.nCarb ?? 1,
  };
};

const buildPreferences = (
  planType: PlanType,
  configs: Record<MealType, PerMealConfigRequest>
): NutritionPreferences => {
  const perMealConfig: PerMealConfigMap = {};
  getMealTypes(planType).forEach((mealType) => {
    perMealConfig[mealType] = normalizeConfig(configs[mealType]);
  });

  return { planType, perMealConfig };
};

const ProgressDots = ({ step }: { step: number }) => (
  <div className="mb-6 flex justify-center gap-2">
    {STEP_TITLES.map((title, index) => {
      const active = index === step;
      const done = index < step;
      return (
        <span
          key={title}
          aria-label={title}
          className={`h-2.5 rounded-full transition-all ${
            active ? 'w-7 bg-brand-green' : done ? 'w-2.5 bg-emerald-300' : 'w-2.5 bg-gray-200'
          }`}
        />
      );
    })}
  </div>
);

const PlanOption = ({
  value,
  selected,
  title,
  description,
  tag,
  icons,
  onSelect,
}: {
  value: PlanType;
  selected: boolean;
  title: string;
  description: string;
  tag: string;
  icons: string[];
  onSelect: (value: PlanType) => void;
}) => (
  <button
    type="button"
    className={`relative rounded-2xl p-5 text-center transition ${
      selected
        ? 'border-2 border-brand-green bg-brand-green-light shadow-sm shadow-emerald-700/10'
        : 'border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
    }`}
    onClick={() => onSelect(value)}
  >
    {selected && (
      <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-green text-white">
        <CheckIcon className="h-4 w-4" />
      </span>
    )}
    <span className="mb-3 flex justify-center gap-1 text-3xl" aria-hidden="true">
      {icons.map((icon, index) => (
        <span key={`${icon}-${index}`}>{icon}</span>
      ))}
    </span>
    <span className="block text-base font-bold text-gray-900">{title}</span>
    <span className="mt-1 block text-sm text-gray-500">{description}</span>
    <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-dark ring-1 ring-emerald-100">
      {tag}
    </span>
  </button>
);

const Stepper = ({ label, value, min, max, onChange }: StepperProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-3">
    <div className="text-[11px] font-semibold uppercase text-gray-500">{label}</div>
    <div className="mt-2 flex items-center justify-between">
      <button
        type="button"
        disabled={value <= min}
        className="grid h-7 w-7 place-items-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        -
      </button>
      <span className="min-w-8 text-center text-lg font-bold text-gray-900 tabular-nums">
        {value}
      </span>
      <button
        type="button"
        disabled={value >= max}
        className="grid h-7 w-7 place-items-center rounded-lg border border-gray-200 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
    <div className="mt-1 text-center text-[11px] text-gray-400">
      {min}-{max}
    </div>
  </div>
);

const MealConfigRow = ({ mealType, config, onChange }: MealConfigRowProps) => {
  const mealKind = config.mealKind;
  const updateKind = (nextKind: MealKind) => {
    onChange(
      mealType,
      nextKind === 'COMBO'
        ? { mealKind: 'COMBO' }
        : { mealKind: 'NHIEU_MON', nMain: 1, nRau: 1, nCarb: 1 }
    );
  };

  const updateCount = (key: 'nMain' | 'nRau' | 'nCarb', value: number) => {
    onChange(mealType, {
      mealKind: 'NHIEU_MON',
      nMain: config.nMain ?? 1,
      nRau: config.nRau ?? 1,
      nCarb: config.nCarb ?? 1,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-lg">
            {MEAL_TYPE_ICON[mealType]}
          </span>
          <span className="font-bold text-gray-900">{MEAL_TYPE_LABEL[mealType]}</span>
        </div>

        <select
          value={mealKind}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green-light"
          onChange={(event) => updateKind(event.target.value as MealKind)}
        >
          <option value="COMBO">1 món combo</option>
          <option value="NHIEU_MON">Nhiều món riêng</option>
        </select>
      </div>

      {mealKind === 'NHIEU_MON' && (
        <div className="mt-4 grid gap-3 border-t border-gray-200 pt-4 sm:grid-cols-3">
          <Stepper
            label="Món chính"
            min={1}
            max={3}
            value={config.nMain ?? 1}
            onChange={(value) => updateCount('nMain', value)}
          />
          <Stepper
            label="Món rau"
            min={0}
            max={2}
            value={config.nRau ?? 1}
            onChange={(value) => updateCount('nRau', value)}
          />
          <Stepper
            label="Tinh bột"
            min={0}
            max={1}
            value={config.nCarb ?? 1}
            onChange={(value) => updateCount('nCarb', value)}
          />
        </div>
      )}
    </div>
  );
};

const SummaryRow = ({
  mealType,
  config,
}: {
  mealType: MealType;
  config: PerMealConfigRequest;
}) => {
  const description =
    config.mealKind === 'COMBO'
      ? '1 món combo'
      : `${config.nMain ?? 1} món chính · ${config.nRau ?? 1} rau · ${config.nCarb ?? 1} tinh bột`;

  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-lg">
        {MEAL_TYPE_ICON[mealType]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase text-gray-500">
          {MEAL_TYPE_LABEL[mealType]}
        </span>
        <span className="mt-0.5 block font-bold text-gray-900">{description}</span>
      </span>
      <CheckIcon className="h-5 w-5 shrink-0 text-brand-green" />
    </div>
  );
};

const SetupWizard = ({ open, onClose, onComplete, mobile = false }: SetupWizardProps) => {
  const [step, setStep] = useState(0);
  const [planType, setPlanType] = useState<PlanType>('3_BUA');
  const [configs, setConfigs] = useState<Record<MealType, PerMealConfigRequest>>(DEFAULT_CONFIG);
  const [submitting, setSubmitting] = useState(false);
  const mealTypes = useMemo(() => getMealTypes(planType), [planType]);
  const preferences = useMemo(() => buildPreferences(planType, configs), [configs, planType]);

  const updateConfig = (mealType: MealType, config: PerMealConfigRequest) => {
    setConfigs((current) => ({ ...current, [mealType]: config }));
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await onComplete(preferences);
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass = mobile
    ? 'fixed inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl'
    : 'w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Thiết lập đề xuất thực đơn"
            className={cardClass}
            initial={mobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            animate={mobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={mobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {mobile && (
              <div className="mb-4 flex justify-center">
                <span className="h-1 w-10 rounded-full bg-gray-200" />
              </div>
            )}

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-green to-emerald-400 text-white">
                  <BeakerIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-brand-green-dark">HealthCare</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Bước {step + 1} / 3
                </span>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Đóng"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <ProgressDots step={step} />

            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chọn số bữa ăn trong ngày</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Lựa chọn này dùng để chia TDEE và sinh cấu hình bữa ăn phù hợp.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <PlanOption
                    value="3_BUA"
                    selected={planType === '3_BUA'}
                    title="3 bữa truyền thống"
                    description="Sáng · Trưa · Tối"
                    tag="Phổ biến nhất"
                    icons={['☀️', '🍽️', '🌙']}
                    onSelect={setPlanType}
                  />
                  <PlanOption
                    value="5_BUA"
                    selected={planType === '5_BUA'}
                    title="5 bữa phân bổ"
                    description="Sáng · Phụ · Trưa · Phụ · Tối"
                    tag="Chia nhỏ năng lượng"
                    icons={['☀️', '🥪', '🍽️', '☕', '🌙']}
                    onSelect={setPlanType}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cấu hình từng bữa</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Chọn 1 món combo hoặc nhiều món riêng cho từng bữa.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {mealTypes.map((mealType) => (
                    <MealConfigRow
                      key={mealType}
                      mealType={mealType}
                      config={configs[mealType]}
                      onChange={updateConfig}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Xác nhận lựa chọn</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Bạn có thể thay đổi cấu hình này sau trong trang thực đơn.
                </p>
                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
                    <span>
                      <span className="block text-xs font-semibold uppercase text-gray-500">
                        Kế hoạch
                      </span>
                      <span className="mt-0.5 block font-bold text-gray-900">
                        {planType === '3_BUA' ? '3 bữa truyền thống' : '5 bữa phân bổ'}
                      </span>
                    </span>
                    <CheckIcon className="h-5 w-5 text-brand-green" />
                  </div>
                  <div className="flex flex-col gap-4">
                    {mealTypes.map((mealType) => (
                      <SummaryRow key={mealType} mealType={mealType} config={configs[mealType]} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:invisible"
                disabled={step === 0 || submitting}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Quay lại
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
                  onClick={() => setStep((current) => Math.min(2, current + 1))}
                >
                  Tiếp tục
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleComplete}
                >
                  {submitting ? (
                    <>
                      <Spinner size={14} thin />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <BeakerIcon className="h-4 w-4" />
                      Bắt đầu đề xuất
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SetupWizard;

