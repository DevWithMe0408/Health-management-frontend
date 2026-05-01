import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import Toolbar, { type ToolbarFilter } from '../../components/admin/Toolbar';
import { toast } from '../../components/admin/Toast';
import { listUsers, type AdminUserSummary } from '../../services/admin/users.admin.service';
import { EyeIcon } from '@heroicons/react/24/outline';

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ROLE_USER', label: 'User' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
];

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({
        page,
        size: 10,
        search: search || undefined,
        role: role || undefined,
        sort: `${sortBy},${sortDir}`,
      });
      setUsers(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
    setPage(0);
  };

  const columns: Column<AdminUserSummary>[] = [
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (row) => <span className="font-medium text-gray-900">{row.username}</span>,
    },
    {
      key: 'name',
      header: 'Họ tên',
      render: (row) => row.name || <span className="text-gray-400 italic">Chưa cập nhật</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-gray-600">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.role === 'ROLE_ADMIN'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {row.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Tạo lúc',
      sortable: true,
      render: (row) => (
        <span className="text-gray-500 text-xs">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      width: '60px',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/users/${row.userId}`)}
          className="p-1.5 rounded-md text-gray-400 hover:text-brand-green hover:bg-green-50 transition-colors"
          title="Xem chi tiết"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const filters: ToolbarFilter[] = [
    {
      label: 'Role',
      value: role,
      options: ROLE_OPTIONS,
      onChange: (v) => { setRole(v); setPage(0); },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        description={`Tổng: ${totalElements} người dùng`}
      />

      <Toolbar
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Tìm theo username, email, tên..."
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Không tìm thấy người dùng nào"
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {totalElements > 0
            ? `Trang ${page + 1}/${totalPages} — ${totalElements} người dùng`
            : ''}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default UsersListPage;
