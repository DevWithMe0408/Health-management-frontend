import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 relative">
    <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-brand-green">
      {icon}
    </div>
    <p className="text-sm text-gray-500 leading-snug min-h-[2.5rem] pr-10">{label}</p>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    <p className="mt-2 text-xs text-gray-400 leading-snug">{sub}</p>
  </div>
);

export default StatCard;
