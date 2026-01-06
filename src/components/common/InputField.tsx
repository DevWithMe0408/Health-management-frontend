import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string; // name là bắt buộc để react-hook-form hoạt động đúng
  error?: string;
  // Bổ sung ref từ react-hook-form nếu cần (thường không cần nếu dùng spread operator)
  className?: string; // Thêm prop className
}

const InputField: React.FC<InputFieldProps> = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, name, error, type = "text", className = "", ...rest }, ref) => { // Gán giá trị mặc định cho className
    const defaultInputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green-medium focus:ring focus:ring-brand-green-light focus:ring-opacity-50";
    return (
      <div className="mb-4"> {/* Tailwind class cho khoảng cách dưới */}
        <label htmlFor={name} className="block text-sm font-medium text-brand-gray-dark mb-1">
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          ref={ref}
          {...rest}
          className={`${defaultInputClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`} // Kết hợp class mặc định, class lỗi và class truyền vào
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField'; // Tốt cho debugging

export default InputField;