interface SpinnerProps {
  size?: number;
  thin?: boolean;
  className?: string;
}

const Spinner = ({ size = 20, thin = false, className = '' }: SpinnerProps) => {
  const borderWidth = thin ? 2 : 3;

  return (
    <span
      aria-label="Đang tải"
      className={`inline-block animate-spin rounded-full border-white/35 border-t-current ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth,
      }}
    />
  );
};

export default Spinner;

