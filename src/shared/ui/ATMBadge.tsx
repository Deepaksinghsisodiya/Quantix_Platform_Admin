import { CheckCircle2, XCircle, Clock, AlertCircle, HelpCircle } from 'lucide-react';

export type BadgeColor = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'purple' | 'gray';
type BadgeVariant = 'solid' | 'soft' | 'outline' | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'enterprise' | 'standalone';
type BadgeSize = 'sm' | 'md';

export interface ATMBadgeProps {
  label?: string;
  variant?: BadgeVariant;
  color?: BadgeColor | string;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const ATMBadge: React.FC<ATMBadgeProps> = ({
  label,
  variant: passedVariant = 'soft',
  color: passedColor = 'primary',
  size = 'sm',
  dot = false,
  icon,
  className = '',
  children,
}) => {
  let variant: 'solid' | 'soft' | 'outline' = 'soft';
  let color = passedColor;

  const legacyColors = ['success', 'warning', 'danger', 'info', 'enterprise', 'standalone', 'default'];
  if (legacyColors.includes(passedVariant)) {
    variant = 'soft';
    if (passedVariant === 'default') {
      color = 'muted';
    } else if (passedVariant === 'info') {
      color = 'primary';
    } else if (passedVariant === 'enterprise' || passedVariant === 'standalone') {
      color = 'purple';
    } else {
      color = passedVariant;
    }
  } else {
    variant = passedVariant as 'solid' | 'soft' | 'outline';
  }
  const colorClasses: Record<string, { soft: string; solid: string; outline: string }> = {
    primary: {
      soft: 'bg-accent-50/50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 border-accent-100 dark:border-accent-900/50',
      solid: 'bg-accent-600 dark:bg-accent-500 text-white border-accent-600 dark:border-accent-500',
      outline: 'bg-transparent border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-400',
    },
    success: {
      soft: 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
      solid: 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500',
      outline: 'bg-transparent border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    },
    warning: {
      soft: 'bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
      solid: 'bg-amber-500 dark:bg-amber-400 text-white border-amber-500 dark:border-amber-400',
      outline: 'bg-transparent border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    },
    danger: {
      soft: 'bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
      solid: 'bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500',
      outline: 'bg-transparent border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
    },
    muted: {
      soft: 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800',
      solid: 'bg-slate-600 dark:bg-slate-500 text-white border-slate-600 dark:border-slate-500',
      outline: 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400',
    },
    gray: {
      soft: 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800',
      solid: 'bg-slate-600 dark:bg-slate-500 text-white border-slate-600 dark:border-slate-500',
      outline: 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400',
    },
    purple: {
      soft: 'bg-violet-50/50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
      solid: 'bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500',
      outline: 'bg-transparent border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400',
    },
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[9px] tracking-wider',
    md: 'px-3 py-1 text-[11px] tracking-wider',
  };

  const selectedColor = (colorClasses[color] || colorClasses.muted) as { soft: string; solid: string; outline: string };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold uppercase rounded-md border transition-all duration-200
        ${selectedColor[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {dot && !icon && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
      )}
      <span className="whitespace-nowrap">{children || label}</span>
    </span>
  );
};

// Auto-color StatusBadge wrapper
export const StatusBadge: React.FC<{ status: string; label?: string; size?: BadgeSize; className?: string }> = ({ status, label: customLabel, size = 'sm', className }) => {
  const getBadgeConfig = (s: any): { color: BadgeColor; icon: React.ReactNode; label: string } => {
    const statusStr = String(s || '');
    const normalized = statusStr.toLowerCase().replace(/\s+/g, '');
    const iconSize = size === 'sm' ? 12 : 14;
    
    const formattedLabel = statusStr
      .replace(/([A-Z])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (['active', 'present', 'approved', 'completed', 'online', 'success', 'paid', 'verified'].includes(normalized)) 
      return { color: 'success', icon: <CheckCircle2 size={iconSize} />, label: formattedLabel };
    
    if (['inactive', 'absent', 'rejected', 'cancelled', 'error', 'danger', 'late', 'critical', 'failed'].includes(normalized)) 
      return { color: 'danger', icon: <XCircle size={iconSize} />, label: formattedLabel };
    
    if (['pending', 'inprogress', 'working', 'processing', 'ongoing', 'initializing', 'pendingapproval'].includes(normalized)) 
      return { color: 'primary', icon: <Clock size={iconSize} />, label: formattedLabel };
    
    if (['onleave', 'halfday', 'hold', 'warning', 'away', 'suboptimal'].includes(normalized)) 
      return { color: 'warning', icon: <AlertCircle size={iconSize} />, label: formattedLabel };
    
    if (['weekoff', 'holiday', 'review', 'purple', 'fortified', 'secure'].includes(normalized)) 
      return { color: 'purple', icon: <HelpCircle size={iconSize} />, label: formattedLabel };

    return { color: 'muted', icon: null, label: formattedLabel };
  };

  const { color, icon, label } = getBadgeConfig(status);
  
  return <ATMBadge label={customLabel || label} color={color} size={size} className={className} icon={icon} />;
};

export default ATMBadge;
