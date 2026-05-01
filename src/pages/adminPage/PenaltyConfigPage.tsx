import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import FormSection from '../../components/admin/FormSection';
import NumericInput from '../../components/admin/NumericInput';
import { toast } from '../../components/admin/Toast';
import {
  getPenaltyConfig,
  updatePenaltyConfig,
  type PenaltyConfigResponse,
  type PenaltyConfigUpdateRequest,
} from '../../services/admin/penaltyConfig.admin.service';

const PenaltyConfigPage: React.FC = () => {
  const [data, setData] = useState<PenaltyConfigResponse | null>(null);
  const [draft, setDraft] = useState<PenaltyConfigUpdateRequest | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPenaltyConfig();
      setData(res);
      initDraft(res);
    } catch {
      toast.error('Không thể tải cấu hình penalty');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const initDraft = (res: PenaltyConfigResponse) => {
    const { updatedAt, updatedBy, ...rest } = res;
    void updatedAt; void updatedBy;
    setDraft(JSON.parse(JSON.stringify(rest)));
    setIsDirty(false);
  };

  const set = <K extends keyof PenaltyConfigUpdateRequest>(
    section: K,
    field: string,
    value: number
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: { ...(prev[section] as unknown as Record<string, number>), [field]: value },
      };
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await updatePenaltyConfig(draft);
      setData(saved);
      initDraft(saved);
      toast.success('Đã lưu cấu hình penalty');
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

  return (
    <div>
      <PageHeader
        title="Cấu hình Penalty"
        description="Tham số phạt khi đề xuất món trùng lặp với lịch sử bữa ăn"
      />

      <div className="space-y-4">
        <FormSection icon="🔁" title="Layer 1 — Trùng món chính xác"
          helperText="Phạt khi tổ hợp đề xuất chứa món có dish_id giống lịch sử gần đây">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Cùng ngày"     value={draft.layer1.sameDay}      onChange={(v) => set('layer1', 'sameDay', v)}      min={0} step={1} />
            <NumericInput label="1 ngày trước"  value={draft.layer1.oneDayBefore} onChange={(v) => set('layer1', 'oneDayBefore', v)} min={0} step={1} />
            <NumericInput label="2 ngày trước"  value={draft.layer1.twoDayBefore} onChange={(v) => set('layer1', 'twoDayBefore', v)} min={0} step={1} />
          </div>
        </FormSection>

        <FormSection icon="🍱" title="Layer 2 — Trùng nhóm thực phẩm"
          helperText="Phạt khi món khác nhau nhưng cùng food_group với lịch sử gần đây">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Cùng ngày"     value={draft.layer2.sameDay}      onChange={(v) => set('layer2', 'sameDay', v)}      min={0} step={1} />
            <NumericInput label="1 ngày trước"  value={draft.layer2.oneDayBefore} onChange={(v) => set('layer2', 'oneDayBefore', v)} min={0} step={1} />
            <NumericInput label="2 ngày trước"  value={draft.layer2.twoDayBefore} onChange={(v) => set('layer2', 'twoDayBefore', v)} min={0} step={1} />
          </div>
        </FormSection>

        <FormSection icon="📊" title="Hệ số theo slot"
          helperText="Nhân hệ số này vào penalty theo loại slot của món">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Món chính" value={draft.slotFactors.main}  onChange={(v) => set('slotFactors', 'main', v)}  min={0} max={1} step={0.1} />
            <NumericInput label="Rau phụ"   value={draft.slotFactors.veg}   onChange={(v) => set('slotFactors', 'veg', v)}   min={0} max={1} step={0.1} />
            <NumericInput label="Tinh bột"  value={draft.slotFactors.carb}  onChange={(v) => set('slotFactors', 'carb', v)}  min={0} max={1} step={0.1} />
            <NumericInput label="Combo"     value={draft.slotFactors.combo} onChange={(v) => set('slotFactors', 'combo', v)} min={0} max={1} step={0.1} />
          </div>
        </FormSection>

        <FormSection icon="⚙️" title="Tham số khác">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Penalty cap"           value={draft.others.penaltyCap}       onChange={(v) => set('others', 'penaltyCap', v)}       min={10} step={1}
              helperText="Giới hạn penalty tối đa cho 1 tổ hợp" />
            <NumericInput label="Hệ số món yêu thích"  value={draft.others.favoriteDiscount} onChange={(v) => set('others', 'favoriteDiscount', v)} min={0} max={1} step={0.1}
              helperText="0.5 = giảm 50% penalty cho món yêu thích" />
            <NumericInput label="Lookback ngày"         value={draft.others.lookbackDays}     onChange={(v) => set('others', 'lookbackDays', v)}     min={1} max={7} step={1}
              helperText="Số ngày lịch sử cần xét" />
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
          <button type="button" onClick={handleSave} disabled={!isDirty || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-green-700 disabled:opacity-40">
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyConfigPage;
