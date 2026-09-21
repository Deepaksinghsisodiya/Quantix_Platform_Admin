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
      soft: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-200/50 dark:border-primary-900/50',
      solid: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white border-transparent shadow-sm shadow-primary-500/20',
      outline: 'bg-transparent border-primary-300 dark:border-primary-800 text-primary-700 dark:text-primary-400',
    },
    success: {
      soft: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/50',
      solid: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/20',
      outline: 'bg-transparent border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    },
    warning: {
      soft: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/50',
      solid: 'bg-gradient-to-r from-amber-500 to-amber-400 text-white border-transparent shadow-sm shadow-amber-500/20',
      outline: 'bg-transparent border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    },
    danger: {
      soft: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/50',
      solid: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-transparent shadow-sm shadow-rose-500/20',
      outline: 'bg-transparent border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400',
    },
    muted: {
      soft: 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60',
      solid: 'bg-gradient-to-r from-slate-600 to-slate-500 text-white border-transparent shadow-sm shadow-slate-500/20',
      outline: 'bg-transparent border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400',
    },
    gray: {
      soft: 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60',
      solid: 'bg-gradient-to-r from-slate-600 to-slate-500 text-white border-transparent shadow-sm shadow-slate-500/20',
      outline: 'bg-transparent border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400',
    },
    purple: {
      soft: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-900/50',
      solid: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white border-transparent shadow-sm shadow-purple-500/20',
      outline: 'bg-transparent border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400',
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
        inline-flex items-center gap-1 font-extrabold uppercase rounded-full border transition-all duration-200
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
