import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  value: string;
  onChange: (next: string) => void;
  mobile?: boolean;
}

/**
 * Controlled-ish search input. The parent owns debouncing; this component
 * keeps a local mirror so typing never feels janky when the parent re-renders.
 */
const SearchBar = ({ value, onChange, mobile = false }: SearchBarProps) => {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    onChange(next);
  };

  const wrapperClass = mobile ? 'px-[18px] py-[14px]' : 'px-[22px] py-[16px]';
  const inputClass = [
    'h-10 w-full rounded-[10px] border border-gray-200 bg-white px-[38px] text-sm text-gray-800 outline-none transition',
    local
      ? 'ring-2 ring-brand-green ring-offset-1'
      : 'focus:ring-2 focus:ring-brand-green focus:ring-offset-1',
  ].join(' ');

  return (
    <div className={wrapperClass}>
      <div className="relative flex items-center">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-gray-500" />
        <input
          type="text"
          value={local}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Tìm món... (vd: cơm trắng, cá kho)"
          aria-label="Tìm món"
          className={inputClass}
        />
        {local && (
          <button
            type="button"
            onClick={() => handleChange('')}
            aria-label="Xoá tìm kiếm"
            className="absolute right-2 p-0.5 text-gray-500 hover:text-gray-700"
          >
            <XCircleIcon className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
