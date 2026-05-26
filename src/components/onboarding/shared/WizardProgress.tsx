import React from 'react';

interface WizardProgressProps {
  current: number;
}

const labels = ['Mục tiêu', 'Cá nhân', 'Chỉ số', 'Số đo'];

const WizardProgress: React.FC<WizardProgressProps> = ({ current }) => {
  return (
    <div className="mb-7">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((step, index) => {
          const done = step < current;
          const active = step === current;

          return (
            <React.Fragment key={step}>
              <div
                className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  done
                    ? 'bg-brand-green text-white shadow-md shadow-brand-green/30'
                    : active
                      ? 'border-2 border-brand-green bg-white text-brand-green ring-4 ring-brand-green-light'
                      : 'border border-gray-200 bg-white text-gray-400'
                }`}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {index < 3 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded ${step < current ? 'bg-brand-green' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-3 text-sm font-medium text-gray-500">
        Bước {current}/4 · {labels[current - 1]}
      </p>
    </div>
  );
};

export default WizardProgress;
