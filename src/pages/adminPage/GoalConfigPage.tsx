import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import FormSection from '../../components/admin/FormSection';
import NumericInput from '../../components/admin/NumericInput';
import SumIndicator from '../../components/admin/SumIndicator';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from '../../components/admin/Toast';
import {
  getAllGoalConfigs,
  updateGoalConfig,
  type GoalConfig,
  type GoalConfigUpdateRequest,
} from '../../services/admin/goalConfig.admin.service';

type GoalCode = 'GIAM' | 'DUY_TRI' | 'TANG';

const TABS: { key: GoalCode; label: string }[] = [
  { key: 'GIAM',    label: 'Giảm cân' },
  { key: 'DUY_TRI', label: 'Duy trì' },
  { key: 'TANG',    label: 'Tăng cân' },
];

type ConfigMap = Record<GoalCode, GoalConfig>;

const GoalConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigMap | null>(null);
  const [activeTab, setActiveTab] = useState<GoalCode>('GIAM');
  const [draft, setDraft] = useState<GoalConfigUpdateRequest | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingTab, setPendingTab] = useState<GoalCode | null>(null);
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllGoalConfigs();
      const map = Object.fromEntries(data.map((c) => [c.goalCode, c])) as ConfigMap;
      setConfigs(map);
      initDraft(map[activeTab]);
    } catch {
      toast.error('Không thể tải cấu hình mục tiêu');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const initDraft = (cfg: GoalConfig) => {
    const { goalCode, description, updatedAt, updatedBy, ...rest } = cfg;
    void goalCode; void description; void updatedAt; void updatedBy;
    setDraft(rest);
    setIsDirty(false);
  };

  const handleTabClick = (key: GoalCode) => {
    if (isDirty) {
      setPendingTab(key);
      setShowDirtyConfirm(true);
    } else {
      switchTab(key);
    }
  };

  const switchTab = (key: GoalCode) => {
    setActiveTab(key);
    if (configs) initDraft(configs[key]);
  };

  const update = (field: keyof GoalConfigUpdateRequest, value: number) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : prev);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await updateGoalConfig(activeTab, draft);
      setConfigs((prev) => prev ? { ...prev, [activeTab]: saved } : prev);
      setIsDirty(false);
      toast.success('Đã lưu cấu hình');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Lỗi khi lưu';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (configs) initDraft(configs[activeTab]);
  };

  if (loading || !configs || !draft) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green" />
      </div>
    );
  }

  const current = configs[activeTab];

  return (
    <div>
      <PageHeader
        title="Cấu hình theo mục tiêu"
        description="Tham số dùng cho thuật toán đề xuất thực đơn theo từng mục tiêu"
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleTabClick(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Section 1 */}
        <FormSection
          icon="🔥"
          title="Hệ số deficit/surplus"
          helperText={[
            'Calo mục tiêu/ngày = TDEE × hệ số này',
            '• 0.80 = deficit 20% (giảm cân an toàn ~0.5kg/tuần)',
            '• Khuyến nghị: 0.75 – 0.85 cho giảm cân | 1.10 – 1.20 cho tăng cân',
          ]}
        >
          <NumericInput
            label="Hệ số nhân TDEE"
            value={draft.calMultiplier}
            onChange={(v) => update('calMultiplier', v)}
            min={0.5}
            max={1.5}
            step={0.05}
          />
        </FormSection>

        {/* Section 2 */}
        <FormSection
          icon="🥩"
          title="Tỷ lệ Macro"
          helperText="Phân bổ % calo mục tiêu cho 3 nhóm dinh dưỡng (tổng phải = 1.00)"
        >
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Protein" value={draft.proteinRatio} onChange={(v) => update('proteinRatio', v)} min={0} max={1} step={0.05} unit="%" />
            <NumericInput label="Fat"     value={draft.fatRatio}     onChange={(v) => update('fatRatio', v)}     min={0} max={1} step={0.05} unit="%" />
            <NumericInput label="Carb"    value={draft.carbRatio}    onChange={(v) => update('carbRatio', v)}    min={0} max={1} step={0.05} unit="%" />
          </div>
          <SumIndicator values={[draft.proteinRatio, draft.fatRatio, draft.carbRatio]} expected={1} label="Tổng macro" />
        </FormSection>

        {/* Section 3 */}
        <FormSection
          icon="🍽"
          title="Phân bổ slot"
          helperText="Tỷ lệ khối lượng cho từng loại slot trong bữa ăn (tổng phải = 1.00)"
        >
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Món chính" value={draft.slotMainRatio} onChange={(v) => update('slotMainRatio', v)} min={0} max={1} step={0.05} />
            <NumericInput label="Rau phụ"   value={draft.slotVegRatio}  onChange={(v) => update('slotVegRatio', v)}  min={0} max={1} step={0.05} />
            <NumericInput label="Tinh bột"  value={draft.slotCarbRatio} onChange={(v) => update('slotCarbRatio', v)} min={0} max={1} step={0.05} />
          </div>
          <SumIndicator values={[draft.slotMainRatio, draft.slotVegRatio, draft.slotCarbRatio]} expected={1} label="Tổng slot" />
        </FormSection>

        {/* Section 4 */}
        <FormSection
          icon="⚖️"
          title="Trọng số scoring"
          helperText="Tầm quan trọng của từng yếu tố khi chấm điểm tổ hợp món (tổng phải = 1.00)"
        >
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Weight P"    value={draft.weightP}    onChange={(v) => update('weightP', v)}    min={0} max={1} step={0.05} />
            <NumericInput label="Weight F"    value={draft.weightF}    onChange={(v) => update('weightF', v)}    min={0} max={1} step={0.05} />
            <NumericInput label="Weight C"    value={draft.weightC}    onChange={(v) => update('weightC', v)}    min={0} max={1} step={0.05} />
            <NumericInput label="Weight Kcal" value={draft.weightKcal} onChange={(v) => update('weightKcal', v)} min={0} max={1} step={0.05} />
          </div>
          <SumIndicator values={[draft.weightP, draft.weightF, draft.weightC, draft.weightKcal]} expected={1} label="Tổng trọng số" />
        </FormSection>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Cập nhật cuối: {current.updatedAt ? new Date(current.updatedAt).toLocaleString('vi-VN') : '—'}
          {current.updatedBy ? ` bởi ${current.updatedBy}` : ''}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-green-700 disabled:opacity-40"
          >
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Dirty tab switch confirm */}
      <ConfirmDialog
        open={showDirtyConfirm}
        title="Bạn có thay đổi chưa lưu"
        message="Chuyển tab sẽ mất các thay đổi chưa lưu. Tiếp tục?"
        confirmText="Tiếp tục"
        onConfirm={() => { if (pendingTab) switchTab(pendingTab); setPendingTab(null); }}
        onClose={() => { setShowDirtyConfirm(false); setPendingTab(null); }}
      />
    </div>
  );
};

export default GoalConfigPage;
