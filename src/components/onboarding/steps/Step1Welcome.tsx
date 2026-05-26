import React from 'react';
import WizardCard from '../shared/WizardCard';

interface Step1WelcomeProps {
  onNext: () => void;
}

const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onNext }) => {
  return (
    <WizardCard className="text-center">
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-md bg-brand-green-light text-3xl">
        +
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-green-dark">
        Chào mừng bạn
      </p>
      <h1 className="mt-3 text-3xl font-bold text-gray-950 md:text-4xl">
        Thiết lập hồ sơ sức khỏe
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">
        Chúng tôi sẽ hỏi một vài thông tin cơ bản để tính chỉ số sức khỏe, gợi ý mục tiêu
        phù hợp và cá nhân hóa dashboard của bạn.
      </p>

      <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
        {[
          ['Mục tiêu', 'Chọn hướng giảm, duy trì hoặc tăng cân.'],
          ['Chỉ số', 'Nhập chiều cao, cân nặng và mức vận động.'],
          ['Số đo', 'Bổ sung số đo để phân loại thể trạng tốt hơn.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-md border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">{title}</div>
            <div className="mt-1 text-xs leading-5 text-gray-500">{description}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-gradient-to-br from-brand-green to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-brand-green-dark hover:to-emerald-600"
      >
        Bắt đầu
        <span className="ml-2" aria-hidden="true">
          →
        </span>
      </button>
    </WizardCard>
  );
};

export default Step1Welcome;
