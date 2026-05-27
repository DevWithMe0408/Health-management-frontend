import React from 'react';
import type { UserProfileData } from '../../../services/auth.service';
import type { ConstitutionCode } from '../../../types/refactorUi.types';
import Avatar from '../shared/Avatar';
import ConstitutionPill from '../shared/ConstitutionPill';
import SectionCard from '../shared/SectionCard';

interface S1ProfileHeaderProps {
  user: UserProfileData | null;
  constitution?: ConstitutionCode | null;
}

function formatJoinedDate(iso?: string | null): string {
  if (!iso) return 'Không xác định';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Không xác định';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `Tham gia từ ${month}/${date.getFullYear()}`;
}

const S1ProfileHeader: React.FC<S1ProfileHeaderProps> = ({ user, constitution }) => {
  const displayName = user?.name || user?.username || 'Người dùng';

  return (
    <SectionCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <Avatar name={displayName} size={80} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-gray-900 lg:text-[22px]">
              {displayName}
            </h2>
            <ConstitutionPill value={constitution} />
          </div>

          {user?.email && (
            <div className="mb-0.5 flex items-center gap-1.5 text-sm text-gray-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M4 8l8 5 8-5" />
              </svg>
              <span className="truncate">{user.email}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
            {formatJoinedDate(user?.createdAt)}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default S1ProfileHeader;
