import React from 'react';

interface WizardNavRowProps {
  showBack?: boolean;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

const WizardNavRow: React.FC<WizardNavRowProps> = ({
  showBack = true,
  onBack,
  nextLabel = 'Tiếp theo',
  nextDisabled = false,
  loading = false,
}) => {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <span aria-hidden="true">←</span>
          Quay lại
        </button>
      ) : (
        <span />
      )}

      <button
        type="submit"
        disabled={nextDisabled || loading}
        className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-brand-green to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-brand-green-dark hover:to-emerald-600 disabled:cursor-not-allowed disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
      >
        {loading ? 'Đang xử lý...' : nextLabel}
        {!loading && <span aria-hidden="true">→</span>}
      </button>
    </div>
  );
};

export default WizardNavRow;
