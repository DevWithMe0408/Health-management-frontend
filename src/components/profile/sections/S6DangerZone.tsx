import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import SectionCard from '../shared/SectionCard';

const S6DangerZone: React.FC = () => {
  const handleDelete = () => {
    toast.info('Tính năng đang phát triển. Vui lòng liên hệ admin để xóa tài khoản.');
  };

  return (
    <SectionCard variant="danger">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-red-100 text-red-700">
            <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-red-700">
              Vùng nguy hiểm
            </h3>
            <p className="mt-1 max-w-md text-sm text-gray-600">
              Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ dữ liệu sức khỏe, lịch sử mục tiêu và thực đơn của bạn.
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="w-full rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 md:w-auto"
        >
          Xóa tài khoản
        </button>
      </div>
    </SectionCard>
  );
};

export default S6DangerZone;
