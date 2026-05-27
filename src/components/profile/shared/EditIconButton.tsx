import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface EditIconButtonProps {
  onClick: () => void;
  label?: string;
}

const EditIconButton: React.FC<EditIconButtonProps> = ({ onClick, label = 'Chỉnh sửa' }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-brand-green-dark"
  >
    <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
    {label}
  </button>
);

export default EditIconButton;
