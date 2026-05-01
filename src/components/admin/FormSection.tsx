import React from 'react';

interface FormSectionProps {
  icon?: string;
  title: string;
  helperText?: string | string[];
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ icon, title, helperText, children }) => {
  const helpers = helperText
    ? Array.isArray(helperText) ? helperText : [helperText]
    : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        {helpers.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {helpers.map((line, i) => (
              <p key={i} className="text-xs text-gray-500">{line}</p>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;
