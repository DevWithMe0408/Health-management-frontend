export const inputClassName = (hasError?: boolean) =>
  `w-full rounded-xl border-2 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition-all duration-200 ease-out placeholder:text-gray-400 ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white'
      : 'border-gray-100 hover:border-gray-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
