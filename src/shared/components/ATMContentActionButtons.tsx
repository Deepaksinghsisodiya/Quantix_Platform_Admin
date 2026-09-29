import React from 'react';
import { Eye, EyeOff, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ATMContentActionButtonsProps {
  isActive?: boolean;
  onToggleActive?: () => void;
  toggleType?: 'switch' | 'icon';
  /** Disables only the publish toggle, e.g. while its mutation is in flight. */
  toggleDisabled?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md';
  moveTooltip?: { up?: string; down?: string };
  className?: string;
}

export const ATMContentActionButtons: React.FC<ATMContentActionButtonsProps> = ({
  isActive,
  onToggleActive,
  toggleType = 'switch',
  toggleDisabled = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  activeLabel = 'Live',
  inactiveLabel = 'Hidden',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  showLabels = false,
  size = 'md',
  moveTooltip,
  className,
}) => {
  const btnSizeClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 13 : 14;

  return (
    <div className={cn('flex items-center gap-2 shrink-0', className)}>
      {/* Reorder Buttons (Optional) */}
      {(onMoveUp || onMoveDown) && (
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title={moveTooltip?.up || 'Move Up'}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowUp size={iconSize} />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title={moveTooltip?.down || 'Move Down'}
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowDown size={iconSize} />
            </button>
          )}
        </div>
      )}

      {/* Toggle Active Switch or Icon Button */}
      {onToggleActive && (
        toggleType === 'icon' ? (
          <button
            type="button"
            onClick={onToggleActive}
            disabled={toggleDisabled}
            title={isActive ? 'Click to hide from website' : 'Click to publish on website'}
            className={cn(
              'inline-flex items-center justify-center rounded-lg border font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-55 disabled:cursor-not-allowed',
              showLabels ? 'h-8 px-2.5 gap-1.5 text-xs' : btnSizeClass,
              isActive
                ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
          >
            {isActive ? <Eye size={iconSize} /> : <EyeOff size={iconSize} />}
            {showLabels && <span>{isActive ? activeLabel : inactiveLabel}</span>}
          </button>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={onToggleActive}
            disabled={toggleDisabled}
            title={isActive ? 'Status: Published Live (Click to hide from website)' : 'Status: Hidden Draft (Click to publish on website)'}
            className={cn(
              'h-8 rounded-lg border inline-flex items-center gap-2 transition-all duration-200 cursor-pointer select-none text-xs font-semibold shadow-2xs group disabled:opacity-55 disabled:cursor-not-allowed',
              showLabels ? 'px-2.5' : 'px-2',
              isActive
                ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/90 hover:border-emerald-300 dark:hover:bg-emerald-900/50'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300'
            )}
          >
            {/* Animated Slider Track */}
            <span
              className={cn(
                'relative inline-flex h-4 w-7 p-0.5 items-center rounded-full transition-colors duration-200 ease-in-out shrink-0',
                isActive
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out',
                  isActive ? 'translate-x-3' : 'translate-x-0'
                )}
              />
            </span>

            {/* Label */}
            {showLabels && (
              <span
                className={cn(
                  'text-xs font-semibold transition-colors leading-none',
                  isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                )}
              >
                {isActive ? activeLabel : inactiveLabel}
              </span>
            )}
          </button>
        )
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Edit Item"
          className={cn(
            'inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:text-[#FF4F00] hover:border-orange-300 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 dark:hover:border-orange-800 transition-all shadow-2xs cursor-pointer font-bold',
            showLabels ? 'h-8 px-2.5 gap-1.5 text-xs' : btnSizeClass
          )}
        >
          <Edit2 size={iconSize} />
          {showLabels && <span>{editLabel}</span>}
        </button>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          title="Delete Item"
          className={cn(
            'inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-2xs cursor-pointer',
            showLabels ? 'h-8 px-2.5 gap-1.5 text-xs' : btnSizeClass
          )}
        >
          <Trash2 size={iconSize} />
          {showLabels && <span>{deleteLabel}</span>}
        </button>
      )}
    </div>
  );
};

export default ATMContentActionButtons;
