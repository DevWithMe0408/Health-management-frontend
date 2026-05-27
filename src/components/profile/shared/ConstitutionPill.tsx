import React from 'react';
import type { ConstitutionCode } from '../../../types/refactorUi.types';

const STYLE: Record<ConstitutionCode, { label: string; bg: string; text: string; border: string }> = {
  GAY: { label: 'GẦY', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  CAN_DOI: { label: 'CÂN ĐỐI', bg: 'bg-green-100', text: 'text-brand-green-dark', border: 'border-green-200' },
  THUA_CAN: { label: 'THỪA CÂN', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  BEO_PHI: { label: 'BÉO PHÌ', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

interface ConstitutionPillProps {
  value?: ConstitutionCode | null;
}

const ConstitutionPill: React.FC<ConstitutionPillProps> = ({ value }) => {
  const style = value ? STYLE[value] : STYLE.CAN_DOI;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.bg} ${style.text} ${style.border}`}
      style={{ letterSpacing: '0.06em' }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: 'currentColor', opacity: 0.85 }}
      />
      {style.label}
    </span>
  );
};

export default ConstitutionPill;
