import React from 'react';

const clampPct = (pct: number): number => Math.min(100, Math.max(0, pct));

interface QualityRowProps {
  label: string;
  done: number;
  total: number;
  note: string;
  linkText?: string;
}

const QualityRow: React.FC<QualityRowProps> = ({ label, done, total, note, linkText }) => {
  const safeDone = Math.max(0, done);
  const safeTotal = Math.max(0, total);
  const pct = safeTotal > 0 ? clampPct((safeDone / safeTotal) * 100) : 0;
  const pctText = `${pct.toFixed(1).replace('.', ',')}%`;

  return (
    <div>
      <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {safeDone}/{safeTotal}{' '}
          <span className="font-normal text-gray-400">({pctText})</span>
        </span>
      </div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-brand-green" style={{ width: `${pct}%` }} />
        <div className="h-full bg-orange-400" style={{ width: `${100 - pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-400">{note}</span>
        {linkText && (
          <span className="shrink-0 cursor-default text-xs font-medium text-brand-green">
            {linkText}
          </span>
        )}
      </div>
    </div>
  );
};

interface DataQualityPanelProps {
  ingredientTotal: number;
  ingredientWithMacro: number;
  dishTotal: number;
  dishActive: number;
}

const DataQualityPanel: React.FC<DataQualityPanelProps> = ({
  ingredientTotal,
  ingredientWithMacro,
  dishTotal,
  dishActive,
}) => {
  const ingredientMissing = Math.max(0, ingredientTotal - ingredientWithMacro);
  const dishHidden = Math.max(0, dishTotal - dishActive);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800">Chất lượng dữ liệu</h2>
        <p className="mt-1 text-xs text-gray-500">
          Mức độ đầy đủ của kho dữ liệu món ăn và nguyên liệu.
        </p>
      </div>
      <div className="space-y-5">
        <QualityRow
          label="Nguyên liệu có đủ dữ liệu dinh dưỡng"
          done={ingredientWithMacro}
          total={ingredientTotal}
          note={`${ingredientMissing} nguyên liệu còn thiếu macro`}
          linkText="Xem danh sách →"
        />
        <QualityRow
          label="Món ăn đang hoạt động"
          done={dishActive}
          total={dishTotal}
          note={`${dishHidden} món đang ẩn`}
        />
      </div>
    </div>
  );
};

export default DataQualityPanel;
