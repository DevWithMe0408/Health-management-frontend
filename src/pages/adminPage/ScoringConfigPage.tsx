import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import FormSection from '../../components/admin/FormSection';
import NumericInput from '../../components/admin/NumericInput';
import { toast } from '../../components/admin/Toast';
import {
  getScoringConfig,
  updateScoringConfig,
  type ScoringConfigResponse,
  type ScoringConfigUpdateRequest,
} from '../../services/admin/scoringConfig.admin.service';

const ScoringConfigPage: React.FC = () => {
  const [data, setData] = useState<ScoringConfigResponse | null>(null);
  const [draft, setDraft] = useState<ScoringConfigUpdateRequest | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getScoringConfig();
      setData(res);
      initDraft(res);
    } catch {
      toast.error('Không thể tải cấu hình scoring');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const initDraft = (res: ScoringConfigResponse) => {
    const { updatedAt, updatedBy, ...rest } = res;
    void updatedAt; void updatedBy;
    setDraft(JSON.parse(JSON.stringify(rest)));
    setIsDirty(false);
  };

  const updateField = (path: string, value: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const parts = path.split('.');
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      const section = parts[0] as keyof ScoringConfigUpdateRequest;
      return {
        ...prev,
        [section]: { ...(prev[section] as unknown as Record<string, number>), [parts[1]]: value },
      };
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await updateScoringConfig(draft);
      setData(saved);
      initDraft(saved);
      toast.success('Đã lưu cấu hình scoring');
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
        title="Cấu hình Scoring"
        description="Tham số chấm điểm tổ hợp món ăn theo độ lệch macro/kcal"
      />

      <div className="space-y-4">
        <FormSection icon="📐" title="Threshold deviation"
          helperText={[
            'Ngưỡng cho phép lệch so với mục tiêu macro/kcal',
            '• Giá trị 0.20 = cho phép lệch ±20%',
            '• Nhỏ hơn → chặt chẽ hơn, ít món hơn được đề xuất',
          ]}>
          <NumericInput label="Threshold" value={draft.threshold}
            onChange={(v) => updateField('threshold', v)} min={0.05} max={0.5} step={0.01} />
        </FormSection>

        <FormSection icon="⚠️" title="Hệ số phạt khi DƯ macro/kcal"
          helperText="Hệ số nhân vào điểm phạt khi tổ hợp vượt mức mục tiêu (0 = không phạt, 1 = phạt tối đa)">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Protein" value={draft.surplusFactors.protein} onChange={(v) => updateField('surplusFactors.protein', v)} min={0} max={1} step={0.1} />
            <NumericInput label="Fat"     value={draft.surplusFactors.fat}     onChange={(v) => updateField('surplusFactors.fat', v)}     min={0} max={1} step={0.1} />
            <NumericInput label="Carb"    value={draft.surplusFactors.carb}    onChange={(v) => updateField('surplusFactors.carb', v)}    min={0} max={1} step={0.1} />
            <NumericInput label="Kcal"    value={draft.surplusFactors.kcal}    onChange={(v) => updateField('surplusFactors.kcal', v)}    min={0} max={1} step={0.1} />
          </div>
        </FormSection>

        <FormSection icon="🎯" title="Re-optimize gợi ý"
          helperText="Hệ thống gợi ý re-optimize khi điểm tổ hợp quá thấp hoặc giảm đột ngột">
          <div className="flex flex-wrap gap-6">
            <NumericInput label="Score threshold" value={draft.reoptimize.scoreThreshold}
              onChange={(v) => updateField('reoptimize.scoreThreshold', v)} min={0} max={100} step={5}
              helperText="Gợi ý khi final score < ngưỡng này" />
            <NumericInput label="Score drop"      value={draft.reoptimize.scoreDrop}
              onChange={(v) => updateField('reoptimize.scoreDrop', v)} min={0} max={100} step={5}
              helperText="Gợi ý khi score giảm > số điểm này" />
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
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-brand-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringConfigPage;
