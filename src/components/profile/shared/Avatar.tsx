import React from 'react';

interface AvatarProps {
  name?: string | null;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ name = 'U', size = 80 }) => {
  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <div
      className="grid flex-shrink-0 select-none place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-green-medium font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        boxShadow: '0 8px 22px -8px rgba(5,150,105,.55), 0 2px 4px rgba(5,150,105,.18)',
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
};

export default Avatar;
