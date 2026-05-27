import { AnimatePresence, motion } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { DailyPlanWarningResponse } from '../../../types/meal.types';

interface WarningGoalModalProps {
  open: boolean;
  warning?: DailyPlanWarningResponse | string | null;
  currentBMI?: number | null;
  onChangeGoal: () => void;
  onContinue: () => void;
  mobile?: boolean;
}

const getWarningMessage = (warning: DailyPlanWarningResponse | string | null | undefined) => {
  if (!warning) return 'Mục tiêu hiện tại có thể chưa phù hợp với thể trạng của bạn.';
  return typeof warning === 'string' ? warning : warning.message;
};

const WarningGoalModal = ({
  open,
  warning,
  currentBMI = null,
  onChangeGoal,
  onContinue,
  mobile = false,
}: WarningGoalModalProps) => {
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
            aria-label="Cảnh báo mục tiêu"
            className={`relative w-full max-w-lg rounded-3xl bg-white shadow-2xl ${
              mobile ? 'p-5' : 'p-8'
            }`}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Đóng cảnh báo"
              onClick={onContinue}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex justify-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-700 ring-4 ring-amber-200">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </span>
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-gray-900">
              Cảnh báo về mục tiêu
            </h2>
            <p className="mt-3 text-center text-sm leading-6 text-gray-600">
              {getWarningMessage(warning)}
            </p>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Khuyến nghị kiểm tra lại mục tiêu để thực đơn phù hợp và an toàn hơn.
            </p>

            {currentBMI !== null && (
              <div className="mt-5 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <b>BMI hiện tại:</b>{' '}
                <span className="font-semibold tabular-nums">{currentBMI.toFixed(1)}</span>
              </div>
            )}

            <div className={`mt-6 flex gap-3 ${mobile ? 'flex-col' : 'flex-row-reverse'}`}>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
                onClick={onChangeGoal}
              >
                Đổi mục tiêu
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                onClick={onContinue}
              >
                Tôi hiểu, tiếp tục
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarningGoalModal;

