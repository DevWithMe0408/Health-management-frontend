import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import FormSection from '../../components/admin/FormSection';
import NumericInput from '../../components/admin/NumericInput';
import SumIndicator from '../../components/admin/SumIndicator';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { toast } from '../../components/admin/Toast';
import {
  getMealConfigs,
  updateMealConfig,
  type MealRatio,
  type MealConfigResponse,
} from '../../services/admin/mealConfig.admin.service';

type PlanType = '3_BUA' | '5_BUA';

const MEAL_LABELS: Record<string, string> = {
  SANG:      '🌅 Sáng',
  PHU_SANG:  '🍎 Phụ sáng',
  TRUA:      '🌞 Trưa',
  PHU_CHIEU: '🍪 Phụ chiều',
  TOI:       '🌙 Tối',
};

const MealConfigPage: React.FC = () => {
  const [data, setData] = useState<MealConfigResponse | null>(null);
  const [activeTab, setActiveTab] = useState<PlanType>('3_BUA');
  const [draft3, setDraft3] = useState<MealRatio[]>([]);
  const [draft5, setDraft5] = useState<MealRatio[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingTab, setPendingTab] = useState<PlanType | null>(null);
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMealConfigs();
      setData(res);
      setDraft3(res.plan3Meals.map((m) => ({ ...m })));
      setDraft5(res.plan5Meals.map((m) => ({ ...m })));
    } catch {
      toast.error('Không thể tải cấu hình bữa ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeDraft = activeTab === '3_BUA' ? draft3 : draft5;
  const setActiveDraft = activeTab === '3_BUA' ? setDraft3 : setDraft5;

  const updateRatio = (mealCode: string, value: number) => {
    setActiveDraft((prev) =>
      prev.map((m) => m.mealCode === mealCode ? { ...m, ratio: value } : m)
    );
    setIsDirty(true);
  };

  const handleTabClick = (tab: PlanType) => {
    if (isDirty) { setPendingTab(tab); setShowDirtyConfirm(true); }
    else switchTab(tab);
  };

  const switchTab = (tab: PlanType) => {
    setActiveTab(tab);
    setIsDirty(false);
    if (data) {
      if (tab === '3_BUA') setDraft3(data.plan3Meals.map((m) => ({ ...m })));
      else setDraft5(data.plan5Meals.map((m) => ({ ...m })));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const meals = activeDraft.map(({ mealCode, ratio }) => ({
        mealCode,
        ratio: parseFloat(ratio.toFixed(4)),
      }));
      await updateMealConfig(activeTab, { meals });
      setIsDirty(false);
      toast.success('Đã lưu cấu hình bữa ăn');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!data) return;
    if (activeTab === '3_BUA') setDraft3(data.plan3Meals.map((m) => ({ ...m })));
    else setDraft5(data.plan5Meals.map((m) => ({ ...m })));
    setIsDirty(false);
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tỷ lệ phân bổ kcal theo bữa"
        description="Phần trăm tổng calo mục tiêu cho mỗi bữa trong ngày"
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['3_BUA', '5_BUA'] as PlanType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === '3_BUA' ? '3 bữa' : '5 bữa'}
          </button>
        ))}
      </div>

      <FormSection
        icon="🍱"
        title={`Kế hoạch ${activeTab === '3_BUA' ? '3 bữa' : '5 bữa'}/ngày`}
        helperText="Tổng tỷ lệ phải = 100% (nhập số thập phân, vd 0.25 = 25%)"
      >
        <div className="space-y-3">
          {activeDraft.map((m) => (
            <div key={m.mealCode} className="flex items-center gap-4">
              <span className="w-32 text-sm text-gray-700">{MEAL_LABELS[m.mealCode] ?? m.mealCode}</span>
              <NumericInput
                label=""
                value={m.ratio}
                onChange={(v) => updateRatio(m.mealCode, v)}
                min={0.05}
                max={0.6}
                step={0.05}
                unit={`= ${(m.ratio * 100).toFixed(0)}%`}
              />
            </div>
          ))}
        </div>
        <SumIndicator
          values={activeDraft.map((m) => m.ratio)}
          expected={1}
          label="Tổng"
        />
      </FormSection>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Cập nhật cuối: {data.updatedAt ? new Date(data.updatedAt).toLocaleString('vi-VN') : '—'}
          {data.updatedBy ? ` bởi ${data.updatedBy}` : ''}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={handleCancel} disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-40">
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={!isDirty || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-green-700 disabled:opacity-40">
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

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

export default MealConfigPage;
