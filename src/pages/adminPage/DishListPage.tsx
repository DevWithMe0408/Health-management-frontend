import React, { useCallback, useEffect, useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../../components/admin/PageHeader';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import Toolbar, { type ToolbarFilter } from '../../components/admin/Toolbar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from '../../components/admin/Toast';
import { getApiErrorMessage } from '../../services/apiResponse';
import DishFormModal from './DishFormModal';
import {
  listDishes,
  setDishActive,
  slotLabel,
  foodGroupLabel,
  SLOT_OPTIONS,
  type DishAdmin,
} from '../../services/admin/dishes.admin.service';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã ẩn' },
];

const DishListPage: React.FC = () => {
  const [dishes, setDishes] = useState<DishAdmin[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [slot, setSlot] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DishAdmin | null>(null);
  const [toggleTarget, setToggleTarget] = useState<DishAdmin | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isActive = status === '' ? undefined : status === 'active';
      const res = await listDishes({
        page,
        size: 10,
        search: search || undefined,
        slotCode: slot || undefined,
        isActive,
        sort: `${sortBy},${sortDir}`,
      });

      setDishes(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  }, [page, search, slot, status, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (dish: DishAdmin) => {
    setEditing(dish);
    setModalOpen(true);
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;

    try {
      await setDishActive(toggleTarget.id, !toggleTarget.isActive);
      toast.success(toggleTarget.isActive ? 'Đã ẩn món ăn' : 'Đã hiện lại món ăn');
      await load();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    }
  };

  const columns: Column<DishAdmin>[] = [
    {
      key: 'name',
      header: 'Tên món',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'slotCode',
      header: 'Slot',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
          {slotLabel(row.slotCode)}
        </span>
      ),
    },
    {
      key: 'foodGroupCode',
      header: 'Nhóm TP',
      sortable: true,
      render: (row) => <span className="text-gray-600">{foodGroupLabel(row.foodGroupCode)}</span>,
    },
    {
      key: 'kcalPer100g',
      header: 'Kcal/100g',
      sortable: true,
      render: (row) => <span className="text-gray-700 tabular-nums">{row.kcalPer100g}</span>,
    },
    {
      key: 'macro',
      header: 'Macro P/F/C',
      render: (row) => (
        <span className="text-gray-500 font-mono text-xs tabular-nums">
          {row.proteinPer100g} / {row.fatPer100g} / {row.carbPer100g}
        </span>
      ),
    },
    {
      key: 'baseServingG',
      header: 'Khẩu phần',
      sortable: true,
      render: (row) => (
        <span className="text-gray-600 text-xs">
          {row.unit} · {row.baseServingG}g
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              row.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {row.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      width: '96px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-md text-gray-400 hover:text-brand-green hover:bg-green-50 transition-colors"
            title="Sửa"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setToggleTarget(row)}
            className={`p-1.5 rounded-md text-gray-400 transition-colors ${
              row.isActive
                ? 'hover:text-red-600 hover:bg-red-50'
                : 'hover:text-brand-green hover:bg-green-50'
            }`}
            title={row.isActive ? 'Ẩn món' : 'Hiện lại'}
          >
            {row.isActive ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const filters: ToolbarFilter[] = [
    {
      label: 'Slot',
      value: slot,
      options: [
        { value: '', label: 'Tất cả' },
        ...SLOT_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
      ],
      onChange: (value) => {
        setSlot(value);
        setPage(0);
      },
    },
    {
      label: 'Trạng thái',
      value: status,
      options: STATUS_OPTIONS,
      onChange: (value) => {
        setStatus(value);
        setPage(0);
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý món ăn"
        description={`Tổng: ${totalElements} món ăn`}
        rightAction={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-brand-green-dark transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Thêm món
          </button>
        }
      />

      <Toolbar
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Tìm theo tên món..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={dishes}
        loading={loading}
        emptyMessage="Không tìm thấy món ăn nào"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {totalElements > 0 ? `Trang ${page + 1}/${totalPages} - ${totalElements} món ăn` : ''}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <DishFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <ConfirmDialog
        open={toggleTarget != null}
        title={toggleTarget?.isActive ? 'Ẩn món ăn?' : 'Hiện lại món ăn?'}
        message={
          toggleTarget?.isActive
            ? `Món "${toggleTarget.name}" sẽ không xuất hiện trong đề xuất thực đơn.`
            : `Món "${toggleTarget?.name}" sẽ xuất hiện trở lại trong đề xuất thực đơn.`
        }
        variant={toggleTarget?.isActive ? 'danger' : 'default'}
        confirmText={toggleTarget?.isActive ? 'Ẩn món' : 'Hiện lại'}
        onConfirm={confirmToggle}
        onClose={() => setToggleTarget(null)}
      />
    </div>
  );
};

export default DishListPage;
