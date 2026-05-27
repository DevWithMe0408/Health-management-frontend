import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface MealPlanEmptyStateProps {
  mobile?: boolean;
}

const SaladBowlIllustration = ({ size = 180 }: { size?: number }) => (
  <svg
    width={size}
    height={size * 0.75}
    viewBox="0 0 240 180"
    fill="none"
    stroke="#059669"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M90 30 Q95 22 90 14" opacity="0.4" />
    <path d="M120 26 Q126 16 120 6" opacity="0.4" />
    <path d="M150 30 Q156 22 150 14" opacity="0.4" />
    <path d="M40 90 Q120 105 200 90 L185 150 Q120 170 55 150 Z" fill="#ecfdf5" />
    <path d="M40 90 Q120 75 200 90" fill="#fff" />
    <ellipse cx="80" cy="85" rx="22" ry="12" fill="#bbf7d0" stroke="#10b981" />
    <ellipse cx="160" cy="85" rx="22" ry="12" fill="#bbf7d0" stroke="#10b981" />
    <ellipse cx="120" cy="78" rx="28" ry="14" fill="#86efac" stroke="#059669" />
    <circle cx="98" cy="80" r="6" fill="#fca5a5" stroke="#dc2626" />
    <circle cx="135" cy="82" r="5" fill="#fca5a5" stroke="#dc2626" />
    <circle cx="148" cy="76" r="4.5" fill="#fca5a5" stroke="#dc2626" />
    <circle cx="76" cy="78" r="4" fill="#fdba74" stroke="#ea580c" />
    <circle cx="112" cy="82" r="3.5" fill="#fdba74" stroke="#ea580c" />
    <ellipse cx="120" cy="160" rx="55" ry="6" fill="#e5e7eb" stroke="none" opacity="0.6" />
    <path d="M210 120 L210 165" stroke="#6b7280" strokeWidth="2.5" />
    <path d="M205 100 L205 122 M210 96 L210 122 M215 100 L215 122" stroke="#6b7280" strokeWidth="2" />
  </svg>
);

const ChecklistItem = ({ label, optional = false }: { label: string; optional?: boolean }) => (
  <div className="flex items-center gap-2.5 text-sm text-gray-600">
    <CheckCircleIcon className="h-5 w-5 shrink-0 text-brand-green" />
    <span>{label}</span>
    {optional && <span className="text-xs text-gray-400">(khuyến nghị)</span>}
  </div>
);

const MealPlanEmptyState = ({ mobile = false }: MealPlanEmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Chưa có dữ liệu sức khỏe"
      className={`flex flex-col items-center rounded-2xl border border-gray-200 bg-white text-center shadow-sm ${
        mobile ? 'px-5 py-10' : 'px-8 py-14'
      }`}
    >
      <SaladBowlIllustration size={mobile ? 140 : 180} />

      <h2 className="mt-6 text-xl font-bold text-gray-900">
        Bạn chưa có thông tin sức khỏe
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
        Cần cập nhật cân nặng, chiều cao và một vài chỉ số cơ bản trước khi hệ thống
        có thể đề xuất thực đơn phù hợp với bạn.
      </p>

      <button
        type="button"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
        onClick={() => navigate('/submit-data')}
      >
        <PencilSquareIcon className="h-5 w-5" />
        Vào trang cập nhật chỉ số
      </button>

      <div className="mt-8 w-full max-w-md border-t border-gray-100 pt-6 text-left">
        <div className="mb-4 text-center text-xs font-semibold uppercase text-gray-500">
          Cần ít nhất các thông tin
        </div>
        <div className="flex flex-col gap-3">
          <ChecklistItem label="Cân nặng (kg)" />
          <ChecklistItem label="Chiều cao (cm)" />
          <ChecklistItem label="Vòng eo (cm)" optional />
        </div>
      </div>
    </section>
  );
};

export default MealPlanEmptyState;

