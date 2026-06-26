import React from 'react';
import { ATMAvatar } from './ATMAvatar';
import { ATMTooltip } from './ATMTooltip';

interface AvatarItem {
  name: string;
  src?: string;
}

interface Props {
  avatars: AvatarItem[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const ATMAvatarGroup: React.FC<Props> = ({
  avatars,
  max = 3,
  size = 'sm',
  className = '',
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const namesTooltip = avatars.map(a => a.name).join(', ');

  return (
    <ATMTooltip content={namesTooltip}>
      <div className={`flex items-center -space-x-3 hover:space-x-1 transition-all duration-300 ${className}`}>
        {visibleAvatars.map((avatar, index) => (
          <ATMAvatar
            key={index}
            name={avatar.name}
            src={avatar.src}
            size={size}
            className="ring-2 ring-white hover:z-10 transition-transform hover:-translate-y-1"
          />
        ))}
        {remainingCount > 0 && (
          <div
            className={`
              flex items-center justify-center rounded-full bg-gray-100 border-2 border-white text-gray-600 font-bold tracking-tighter z-0
              ${size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-10 h-10 text-xs'}
            `}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </ATMTooltip>
  );
};
