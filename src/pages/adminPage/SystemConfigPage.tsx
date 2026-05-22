import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import FormSection from '../../components/admin/FormSection';
import NumericInput from '../../components/admin/NumericInput';
import { toast } from '../../components/admin/Toast';
import {
  getSystemConfig,
  updateSystemConfig,
  type SystemConfigResponse,
  type SystemConfigUpdateRequest,
  type ConstraintItem,
} from '../../services/admin/systemConfig.admin.service';

const SLOT_LABELS: Record<string, string> = {
  CHINH:    'Món chính',
  RAU:      'Rau phụ',
  TINH_BOT: 'Tinh bột',
  COMBO:    'Combo',
};

const parseSteps = (arr: number[]): string => arr.join(', ');

const tryParseSteps = (str: string): number[] | null => {
  try {
    const parts = str.split(',').map((s) => parseFloat(s.trim()));
    if (parts.some(isNaN)) return null;
    return parts;
  } catch {
    return null;
  }
};

const SystemConfigPage: React.FC = () => {
  const [data, setData] = useState<SystemConfigResponse | null>(null);
  const [draft, setDraft] = useState<SystemConfigUpdateRequest | null>(null);
  const [servingStepsText, setServingStepsText] = useState('');
  const [comboStepsText, setComboStepsText] = useState('');
  const [stepsError, setStepsError] = useState('');
  const [comboStepsError, setComboStepsError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSystemConfig();
      setData(res);
      initDraft(res);
    } catch {
      toast.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const initDraft = (res: SystemConfigResponse) => {
    const { updatedAt, updatedBy, ...rest } = res;
    void updatedAt; void updatedBy;
    setDraft(JSON.parse(JSON.stringify(rest)));
    setServingStepsText(parseSteps(res.filter.servingSteps));
    setComboStepsText(parseSteps(res.filter.comboServingSteps));
    setIsDirty(false);
    setStepsError('');
    setComboStepsError('');
  };

  const updateFilter = (field: string, value: number) => {
    setDraft((prev) => prev ? { ...prev, filter: { ...prev.filter, [field]: value } } : prev);
    setIsDirty(true);
  };

  const updateDisplay = (field: string, value: number) => {
    setDraft((prev) => prev ? { ...prev, display: { ...prev.display, [field]: value } } : prev);
    setIsDirty(true);
  };

  const updateConstraint = (slotCode: string, field: keyof ConstraintItem, value: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        constraints: prev.constraints.map((c) =>
          c.slotCode === slotCode ? { ...c, [field]: value } : c
        ),
      };
    });
    setIsDirty(true);
  };

  const handleStepsChange = (raw: string) => {
    setServingStepsText(raw);
    setIsDirty(true);
    const parsed = tryParseSteps(raw);
    if (!parsed) {
      setStepsError('Định dạng không hợp lệ (vd: 0.5, 0.75, 1.0)');
    } else {
      setStepsError('');
      setDraft((prev) => prev ? { ...prev, filter: { ...prev.filter, servingSteps: parsed } } : prev);
    }
  };

  const handleComboStepsChange = (raw: string) => {
    setComboStepsText(raw);
    setIsDirty(true);
    const parsed = tryParseSteps(raw);
    if (!parsed) {
      setComboStepsError('Định dạng không hợp lệ (vd: 0.75, 1.0, 1.25)');
    } else {
      setComboStepsError('');
      setDraft((prev) => prev ? { ...prev, filter: { ...prev.filter, comboServingSteps: parsed } } : prev);
    }
  };

  const handleSave = async () => {
    if (!draft || stepsError || comboStepsError) return;
    setSaving(true);
    try {
      const saved = await updateSystemConfig(draft);
      setData(saved);
      initDraft(saved);
      toast.success('Đã lưu cấu hình hệ thống');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { if (data) initDraft(data); };

  if (loading || !draft || !data) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green" /></div>;
  }

  const hasError = !!stepsError || !!comboStepsError;

  return (
    <div>
      <PageHeader
        title="Cấu hình hệ thống"
        description="Các tham số đơn lẻ điều khiển hành vi thuật toán đề xuất"
      />

      <div className="space-y-4">
        <FormSection icon="🔍" title="Filter ứng viên"
          helperText="Lọc món ăn đủ điều kiện trước khi chấm điểm">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Kcal tolerance" value={draft.filter.kcalTolerance}
              onChange={(v) => updateFilter('kcalTolerance', v)} min={0.05} max={0.3} step={0.01}
              helperText="Biên lọc kcal (0.15 = ±15%)" />
            <NumericInput label="Serving min" value={draft.filter.servingMin}
              onChange={(v) => updateFilter('servingMin', v)} min={0.25} max={1} step={0.05} />
            <NumericInput label="Serving max" value={draft.filter.servingMax}
              onChange={(v) => updateFilter('servingMax', v)} min={1} max={3} step={0.05} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serving steps (cách nhau bằng dấu phẩy)</label>
            <input type="text" value={servingStepsText} onChange={(e) => handleStepsChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green ${stepsError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {stepsError && <p className="mt-1 text-xs text-red-600">{stepsError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Combo serving steps</label>
            <input type="text" value={comboStepsText} onChange={(e) => handleComboStepsChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green ${comboStepsError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {comboStepsError && <p className="mt-1 text-xs text-red-600">{comboStepsError}</p>}
          </div>
        </FormSection>

        <FormSection icon="📦" title="Constraint khối lượng theo slot"
          helperText="Giới hạn gram tối thiểu và tối đa cho mỗi loại slot">
          <table className="text-sm w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2 font-semibold">Slot</th>
                <th className="pb-2 font-semibold">Min (g)</th>
                <th className="pb-2 font-semibold">Max (g)</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {draft.constraints.map((c) => (
                <tr key={c.slotCode} className="align-top">
                  <td className="pr-6 py-1 text-gray-700 font-medium">{SLOT_LABELS[c.slotCode] ?? c.slotCode}</td>
                  <td className="pr-4 py-1">
                    <input type="number" value={c.minG} min={1}
                      onChange={(e) => updateConstraint(c.slotCode, 'minG', parseInt(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
                  </td>
                  <td className="py-1">
                    <input type="number" value={c.maxG} min={1}
                      onChange={(e) => updateConstraint(c.slotCode, 'maxG', parseInt(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormSection>

        <FormSection icon="🖥" title="Display"
          helperText="Thiết lập hiển thị kết quả đề xuất">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Top K" value={draft.display.topK}
              onChange={(v) => updateDisplay('topK', v)} min={5} max={20} step={1}
              helperText="Số tổ hợp hiển thị" />
            <NumericInput label="Round step (g)" value={draft.display.roundStepG}
              onChange={(v) => updateDisplay('roundStepG', v)} min={5} max={50} step={5}
              helperText="Làm tròn khối lượng" />
          </div>
        </FormSection>
      </div>

      <div className="mt-6 flex items-center justify-between py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Cập nhật cuối: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('vi-VN') : '—'}
          {data.updatedBy ? ` bởi ${data.updatedBy}` : ''}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={handleCancel} disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-40">Hủy</button>
          <button type="button" onClick={handleSave} disabled={!isDirty || saving || hasError}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-brand-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;
