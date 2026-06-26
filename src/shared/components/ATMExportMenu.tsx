import React from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { ATMDropdown } from '../ui/ATMDropdown';

interface Props {
  onExportExcel: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

export const ATMExportMenu: React.FC<Props> = ({
  onExportExcel,
  onExportPdf,
  isLoading,
}) => {
  return (
    <ATMDropdown
      trigger={
        <button
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2.5 bg-zen-card border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-accent-600" />
          ) : (
            <Download size={18} className="text-accent-600" />
          )}
          {isLoading ? 'Exporting...' : 'Export'}
        </button>
      }
      items={[
        {
          label: 'Export as Excel (.xlsx)',
          icon: <FileText size={16} className="text-emerald-600" />,
          onClick: onExportExcel,
        },
        ...(onExportPdf ? [{
          label: 'Export as PDF',
          icon: <FileText size={16} className="text-rose-600" />,
          onClick: onExportPdf,
        }] : []),
      ]}
    />
  );
};
