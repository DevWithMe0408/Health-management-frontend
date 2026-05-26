import React, { useState } from 'react';
import { toast } from 'sonner';
import { updateCurrentGoal } from '../../services/userGoals.service';
import type { ConstitutionCode, GoalCode } from '../../types/refactorUi.types';

interface GoalRecommendationModalProps {
  constitution: ConstitutionCode;
  userGoal: GoalCode;
  suggestedGoal: GoalCode;
  onComplete: () => void;
}

const constitutionLabels: Record<ConstitutionCode, string> = {
  GAY: 'Gầy',
  CAN_DOI: 'Cân đối',
  THUA_CAN: 'Thừa cân',
  BEO_PHI: 'Béo phì',
};

const goalLabels: Record<GoalCode, string> = {
  GIAM: 'Giảm cân',
  DUY_TRI: 'Duy trì',
  TANG: 'Tăng cân',
};

const GoalRecommendationModal: React.FC<GoalRecommendationModalProps> = ({
  constitution,
  userGoal,
  suggestedGoal,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAcceptSuggestion = async () => {
    setLoading(true);
    try {
      await updateCurrentGoal({
        goalCode: suggestedGoal,
        targetDurationMonths: 6,
        note: 'Onboarding suggested goal',
      });
      toast.success(`Đã đổi mục tiêu sang ${goalLabels[suggestedGoal]}.`);
      onComplete();
    } catch {
      toast.error('Không đổi được mục tiêu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl md:p-8">
        <div className="mb-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
          Khuyến nghị mục tiêu
        </div>
        <h2 className="text-xl font-bold text-gray-950">Mục tiêu phù hợp hơn với thể trạng</h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Dựa trên phân loại <b>{constitutionLabels[constitution]}</b>, hệ thống khuyến nghị mục
          tiêu <b>{goalLabels[suggestedGoal]}</b>. Bạn hiện đang chọn{' '}
          <b>{goalLabels[userGoal]}</b>.
        </p>

        <div className="mt-5 rounded-md border border-brand-green bg-brand-green-light p-4 text-center">
          <div className="text-sm text-brand-green-dark">Khuyến nghị</div>
          <div className="mt-1 text-2xl font-bold text-brand-green-darker">
            {goalLabels[suggestedGoal]}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={handleAcceptSuggestion}
            disabled={loading}
            className="rounded-md bg-brand-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang cập nhật...' : `Đổi sang ${goalLabels[suggestedGoal]}`}
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={loading}
            className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Giữ mục tiêu {goalLabels[userGoal]}
          </button>
        </div>
      </section>
    </div>
  );
};

export default GoalRecommendationModal;
