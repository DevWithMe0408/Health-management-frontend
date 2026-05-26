import React from 'react';

const OnboardingWizardPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-brand-green-light px-4 py-10 text-gray-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-lg border border-green-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-green-dark">
            Onboarding
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Thiết lập hồ sơ sức khỏe
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Wizard onboarding sẽ được triển khai ở bước UI tiếp theo.
          </p>
        </section>
      </div>
    </main>
  );
};

export default OnboardingWizardPage;
