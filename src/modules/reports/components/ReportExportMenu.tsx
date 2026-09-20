import React from 'react';
import { ATMButton, ATMDropdown } from '@/shared/ui';
import { Download, FileText, Table2 } from 'lucide-react';
import {
  useReportExport,
  type ReportExportKey,
  type ReportExportParams,
} from '@/lib/hooks/useReports';

interface ReportExportMenuProps extends ReportExportParams {
  readonly report: ReportExportKey;
  /** Disable while the page itself is still loading or failed to load. */
  readonly disabled?: boolean;
}

/**
 * 2026-09-04 (decision E): the one export control every report page carries. The
 * operator chooses CSV or PDF; the file covers the window and filters shown on screen.
 */
export const ReportExportMenu: React.FC<ReportExportMenuProps> = ({ report, disabled, ...params }) => {
  const { exportReport, exporting } = useReportExport(report, params);
  const busy = exporting !== null;

  return (
    <ATMDropdown
      align="right"
      trigger={
        <ATMButton
          variant="secondary"
          size="sm"
          leftIcon={<Download className="h-3.5 w-3.5" />}
          loading={busy}
          disabled={disabled || busy}
        >
          {busy ? `Exporting ${exporting.toUpperCase()}…` : 'Export'}
        </ATMButton>
      }
      items={[
        { label: 'CSV (spreadsheet)', icon: <Table2 className="h-4 w-4" />, onClick: () => { void exportReport('csv'); }, disabled: disabled || busy },
        { label: 'PDF (document)', icon: <FileText className="h-4 w-4" />, onClick: () => { void exportReport('pdf'); }, disabled: disabled || busy },
      ]}
    />
  );
};

export default ReportExportMenu;
