import React from 'react';

const ProfileSkeleton: React.FC = () => (
  <>
    <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
  </>
);

export default ProfileSkeleton;
