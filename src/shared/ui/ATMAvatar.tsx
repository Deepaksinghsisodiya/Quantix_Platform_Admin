import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  status?: 'online' | 'away' | 'offline';
  className?: string;
}

export const ATMAvatar: React.FC<Props> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const getInitials = (n: string) => {
    if (!n) return '';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];
      if (firstPart && lastPart) {
        const firstChar = firstPart[0] || '';
        const lastChar = lastPart[0] || '';
        return (firstChar + lastChar).toUpperCase();
      }
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getColorFromName = (n: string) => {
    const colors = [
      'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400',
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
      'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
      'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400',
      'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeMap: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const statusColorMap = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-400 dark:bg-gray-600',
  };

  const getProfilePictureUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5095';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiBaseUrl}${cleanUrl}`;
  };

  const resolvedSrc = getProfilePictureUrl(src);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`
          flex items-center justify-center rounded-full overflow-hidden font-bold select-none border-2 border-white dark:border-gray-800 shadow-sm
          ${sizeMap[size]}
          ${!resolvedSrc ? getColorFromName(name) : 'bg-gray-100 dark:bg-gray-800'}
        `}
      >
        {resolvedSrc ? (
          <img src={resolvedSrc} alt={name} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900
            ${statusColorMap[status]}
            ${size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'}
          `}
        />
      )}
    </div>
  );
};

export default ATMAvatar;
