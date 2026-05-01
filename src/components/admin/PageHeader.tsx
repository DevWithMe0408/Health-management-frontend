import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, rightAction }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    {rightAction && <div className="ml-4 shrink-0">{rightAction}</div>}
  </div>
);

export default PageHeader;
