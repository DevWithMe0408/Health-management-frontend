export const inputClassName = (hasError?: boolean) =>
  `w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-200 focus:border-brand-green focus:ring-brand-green-light'
  }`;
