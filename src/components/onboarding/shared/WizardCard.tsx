import React from 'react';

interface WizardCardProps {
  children: React.ReactNode;
  className?: string;
}

const WizardCard: React.FC<WizardCardProps> = ({ children, className = '' }) => {
  return (
    <section
      className={`relative z-10 mx-auto w-full max-w-[720px] rounded-lg border border-gray-100 bg-white p-6 shadow-sm md:p-10 ${className}`}
      style={{ boxShadow: '0 18px 42px -18px rgba(15, 31, 26, 0.2)' }}
    >
      {children}
    </section>
  );
};

export default WizardCard;
