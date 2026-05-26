import React from 'react';

interface WizardCardProps {
  children: React.ReactNode;
  className?: string;
}

const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <section
      className={`relative z-10 mx-auto w-full max-w-[720px] rounded-3xl border border-gray-100 bg-white p-6 md:px-12 md:py-10 ${className}`}
      style={{
        boxShadow:
          '0 1px 2px rgba(15, 31, 26, 0.04), 0 12px 32px -12px rgba(15, 31, 26, 0.12), 0 0 0 1px rgba(15, 31, 26, 0.02)',
      }}
    >
      {children}
    </section>
  );
};

export default WizardCard;
