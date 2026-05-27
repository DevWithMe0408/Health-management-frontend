import Spinner from '../common/Spinner';

interface MealPlanLoadingSkeletonProps {
  mobile?: boolean;
  variant?: 'skeleton' | 'spinner';
}

interface SkeletonBlockProps {
  className?: string;
}

const SkeletonBlock = ({ className = '' }: SkeletonBlockProps) => (
  <div
    className={`animate-db-shimmer rounded-md bg-[linear-gradient(90deg,#e5e7eb_0%,#f3f4f6_50%,#e5e7eb_100%)] bg-[length:200%_100%] ${className}`}
  />
);

const MealCardSkeleton = ({ mobile = false }: { mobile?: boolean }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white ${mobile ? 'p-4' : 'p-5'}`}>
    <div className="flex items-center gap-3">
      <SkeletonBlock className="h-11 w-11 rounded-xl" />
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-2 h-3 w-24" />
      </div>
      <SkeletonBlock className="hidden h-7 w-24 rounded-full sm:block" />
      <SkeletonBlock className="h-8 w-28 rounded-full" />
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
    </div>

    <div className="mt-5 flex flex-col gap-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <SkeletonBlock className="h-14 w-14 rounded-lg sm:h-16 sm:w-16" />
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-2/5" />
            <div className="mt-2 flex gap-2">
              <SkeletonBlock className="h-5 w-16 rounded-md" />
              <SkeletonBlock className="h-5 w-20 rounded-md" />
            </div>
            <SkeletonBlock className="mt-2 h-3 w-2/3" />
          </div>
          <SkeletonBlock className="hidden h-9 w-24 rounded-lg sm:block" />
        </div>
      ))}
    </div>

    <SkeletonBlock className="mt-5 h-24 w-full rounded-xl" />
  </div>
);

const MealPlanLoadingSkeleton = ({
  mobile = false,
  variant = 'skeleton',
}: MealPlanLoadingSkeletonProps) => {
  if (variant === 'spinner') {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="max-w-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-green text-white">
            <Spinner size={34} />
          </div>
          <h3 className="mt-5 text-lg font-bold text-gray-900">
            Đang tính toán thực đơn tốt nhất cho bạn
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Hệ thống đang chấm điểm các tổ hợp món để chọn phương án phù hợp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-5">
        <SkeletonBlock className="h-14 w-full rounded-r-xl" />
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <MealCardSkeleton mobile={mobile} />
        <MealCardSkeleton mobile={mobile} />
        <MealCardSkeleton mobile={mobile} />
      </div>

      <SkeletonBlock className="h-64 w-full rounded-2xl" />

      <div className="fixed bottom-5 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-lg">
        <span className="text-brand-green">
          <Spinner size={14} thin />
        </span>
        Đang gen thực đơn...
      </div>
    </div>
  );
};

export default MealPlanLoadingSkeleton;

