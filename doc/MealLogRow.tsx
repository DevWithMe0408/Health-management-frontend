import React, { useState } from 'react';
import {
  CheckCircleIcon,
  NoSymbolIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import type { DishLite, MealLogRecord, MealLogStatus } from '../nutritionHistory.types';
import { MEAL_LABEL, STATUS_META } from '../nutritionHistory.constants';
import { StatusBadge } from './StatusBadge';

const DishList: React.FC<{ dishes: DishLite[]; muted?: boolean }> = ({ dishes, muted }) => (
  <ul className={`flex flex-wrap gap-x-4 gap-y-1 ${muted ? 'opacity-50' : ''}`}>
    {dishes.map((d, i) => (
      <li key={i} className="flex items-baseline gap-1.5 text-sm text-gray-700">
        <span className="font-medium">{d.dishName}</span>
        <span className="text-xs text-gray-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {d.dishKcal} kcal
        </span>
      </li>
    ))}
  </ul>
);

type Tone = 'green' | 'amber' | 'gray';
const QuickAction: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: Tone;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, tone, active, onClick }) => {
  const tones: Record<Tone, string> = {
    green: active
      ? 'bg-brand-green text-white border-brand-green'
      : 'bg-white text-brand-green-darker border-emerald-200 hover:bg-brand-green-light',
    amber: active
      ? 'bg-amber-500 text-white border-amber-500'
      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50',
    gray: active
      ? 'bg-gray-500 text-white border-gray-400'
      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export interface MealLogRowProps {
  log: MealLogRecord;
  /** Đề xuất hiển thị mờ khi chưa báo cáo. */
  suggestedDishes?: DishLite[];
  onSetStatus: (log: MealLogRecord, status: MealLogStatus) => void;
  onSaveCustom: (log: MealLogRecord, note: string) => void;
}

/** Một hàng bữa ăn trong chế độ Ngày. */
export const MealLogRow: React.FC<MealLogRowProps> = ({
  log,
  suggestedDishes,
  onSetStatus,
  onSaveCustom,
}) => {
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState(log.customNote ?? '');
  const s = STATUS_META[log.status];
  const planDishes = log.dishes.length > 0 ? log.dishes : suggestedDishes ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2.5">
            <span
              className="inline-block h-7 w-1 rounded-full"
              style={{ backgroundColor: log.status === 'SUGGESTED' ? '#e2e8f0' : s.color }}
            />
            <span className="text-sm font-bold text-gray-900">{MEAL_LABEL[log.mealType]}</span>
            <StatusBadge status={log.status} />
          </div>

          <div className="pl-3.5">
            {log.status === 'FOLLOWED' && (
              <div className="flex flex-wrap items-center gap-x-3">
                <DishList dishes={log.dishes} />
                <span className="text-xs font-semibold text-brand-green" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  · {log.totalKcalActual} kcal
                </span>
              </div>
            )}
            {log.status === 'CUSTOM' && (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-amber-700">Đã ăn: </span>
                {log.customNote}
                {log.totalKcalActual > 0 && (
                  <span className="ml-1 text-xs text-gray-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    (~{log.totalKcalActual} kcal)
                  </span>
                )}
              </p>
            )}
            {log.status === 'SKIPPED' && (
              <p className="text-sm italic text-gray-400">Đã bỏ bữa này.</p>
            )}
            {log.status === 'SUGGESTED' && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-400">Đề xuất (chưa báo cáo):</p>
                <DishList dishes={planDishes} muted />
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <QuickAction
            icon={CheckCircleIcon}
            label="Đã ăn đúng"
            tone="green"
            active={log.status === 'FOLLOWED'}
            onClick={() => {
              setNoteOpen(false);
              onSetStatus(log, 'FOLLOWED');
            }}
          />
          <QuickAction
            icon={PencilSquareIcon}
            label="Ăn khác"
            tone="amber"
            active={log.status === 'CUSTOM'}
            onClick={() => setNoteOpen((v) => !v)}
          />
          <QuickAction
            icon={NoSymbolIcon}
            label="Bỏ bữa"
            tone="gray"
            active={log.status === 'SKIPPED'}
            onClick={() => {
              setNoteOpen(false);
              onSetStatus(log, 'SKIPPED');
            }}
          />
        </div>
      </div>

      {noteOpen && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 pl-3.5">
          <PencilSquareIcon className="h-4 w-4 shrink-0 text-amber-500" />
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Bạn đã ăn gì? (vd: bún bò Huế)"
            className="min-w-0 flex-1 rounded-md border border-amber-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveCustom(log, draft);
                setNoteOpen(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              onSaveCustom(log, draft);
              setNoteOpen(false);
            }}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setNoteOpen(false)}
            className="rounded-md px-2 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};
