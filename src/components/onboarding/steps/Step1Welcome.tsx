import React from 'react';

interface Step1WelcomeProps {
  onNext: () => void;
}

const valueProps = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Cá nhân hóa theo thể trạng',
    description: 'Phân tích BMI + PBF để gợi ý thực đơn phù hợp.',
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
      </svg>
    ),
    title: 'Toàn bộ là món Việt',
    description: 'Cơm tấm, bún bò, phở... những món bạn ăn hằng ngày.',
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Đề xuất thông minh hằng ngày',
    description: 'Mỗi ngày một bộ thực đơn cân bằng, có thể đổi món tùy ý.',
  },
];

const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onNext }) => {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-8 text-center md:py-12">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-brand-green-dark backdrop-blur">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green" />
        Mất khoảng 2 phút
      </div>

      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
        Chào mừng bạn đến với{' '}
        <span className="bg-gradient-to-br from-brand-green to-emerald-500 bg-clip-text text-transparent">
          HealthCare
        </span>
      </h1>

      <p className="mb-10 max-w-md text-base leading-7 text-gray-600 md:text-lg">
        Trợ lý dinh dưỡng cá nhân của bạn. Mỗi ngày một thực đơn phù hợp, chỉ với vài thông tin cơ bản.
      </p>

      <div className="mb-10 grid w-full gap-3 md:grid-cols-3 md:gap-4">
        {valueProps.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 text-left transition hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-brand-green-light text-brand-green-dark">
              {item.icon}
            </div>
            <div className="text-sm font-semibold text-gray-900">{item.title}</div>
            <p className="mt-1 text-xs leading-5 text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-500 px-8 py-3.5 text-base font-semibold text-white transition hover:from-brand-green-dark hover:to-emerald-600"
        style={{ boxShadow: '0 8px 20px -6px rgba(5, 150, 105, 0.5)' }}
      >
        Bắt đầu
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <p className="mt-8 max-w-sm text-xs leading-5 text-gray-400">
        🔒 Thông tin của bạn được bảo mật và chỉ dùng để cá nhân hóa thực đơn. Bạn có thể chỉnh sửa bất kỳ
        lúc nào trong Hồ sơ.
      </p>
    </div>
  );
};

export default Step1Welcome;
