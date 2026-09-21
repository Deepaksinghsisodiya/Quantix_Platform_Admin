import React, { useMemo, useState } from 'react';
import {
  Monitor,
  Plus,
  Smartphone,
  Pencil,
  Trash2,
  Copy,
  AlertTriangle,
} from 'lucide-react';

import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { formatDate } from '@/lib/utils/formatDate';
import type { MerchantTerminal, PlatformPairingCode } from '../types/merchant.types';

interface FormState {
  terminalCode: string;
  terminalName: string;
  terminalType: string;
}

interface MerchantTerminalsProps {
  merchantId: string;
  terminals: MerchantTerminal[];
  /** Plan-derived type options (Restaurant/Retail/Inventory subset). Single option ⇒ preselected + disabled. */
  allowedTypes: string[];
  isLoading: boolean;
  terminalsError: any;
  onBackClick: () => void;

  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  editTarget: MerchantTerminal | null;
  setEditTarget: (target: MerchantTerminal | null) => void;
  deleteTarget: MerchantTerminal | null;
  setDeleteTarget: (target: MerchantTerminal | null) => void;
  pairingCode: PlatformPairingCode | null;
  setPairingCode: (code: PlatformPairingCode | null) => void;

  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  submitting: boolean;

  handleCreate: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleIssuePairingCode: (terminal: MerchantTerminal) => Promise<void>;
  openEdit: (t: MerchantTerminal) => void;
  copyCode: () => void;
}

export const MerchantTerminalsPage: React.FC<MerchantTerminalsProps> = ({
  terminals,
  allowedTypes,
  isLoading,
  terminalsError,
  onBackClick,

  createOpen,
  setCreateOpen,
  editTarget,
  setEditTarget,
  deleteTarget,
  setDeleteTarget,
  pairingCode,
  setPairingCode,

  form,
  setForm,
  submitting,

  handleCreate,
  handleUpdate,
  handleDelete,
  handleIssuePairingCode,
  openEdit,
  copyCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerminals = useMemo(() => {
    if (!searchQuery.trim()) return terminals;
    const query = searchQuery.toLowerCase();
    return terminals.filter(
      (t) =>
        t.terminalCode?.toLowerCase().includes(query) ||
        t.terminalName?.toLowerCase().includes(query) ||
        t.terminalType?.toLowerCase().includes(query)
    );
  }, [terminals, searchQuery]);

  const columns = useMemo<ATMTableColumn<MerchantTerminal>[]>(
    () => [
      {
        key: 'terminalCode',
        header: 'Code',
        renderCell: (val) => (
          <span className="font-mono text-xs text-surface-700 dark:text-surface-300">{val}</span>
        ),
        width: '120px',
      },
      {
        key: 'terminalName',
        header: 'Name',
        renderCell: (val) => (
          <span className="text-surface-900 dark:text-surface-100 font-bold">{val}</span>
        ),
      },
      {
        key: 'terminalType',
        header: 'Type',
        renderCell: (val) => val ?? '—',
        width: '140px',
      },
      {
        // Registered = a PosTerminal installer redeemed this terminal's 6-digit pairing
        // code; until then it awaits pairing. (2026-08-30: label was 'Pending' — vague.)
        key: 'isRegistered',
        header: 'Status',
        renderCell: (val) => (
          <ATMBadge color={val ? 'success' : 'warning'} size="sm" label={val ? 'Registered' : 'Awaiting Pairing'} />
        ),
        width: '150px',
      },
      {
        // 2026-08-30: replaced the 'Last Seen' column — that field had no writer and
        // Standalone Local-Only terminals never sync to Platform (tokens are the only
        // channel), so it could never show anything. Pairing time is the honest fact.
        key: 'registeredAt',
        header: 'Paired On',
        renderCell: (val) => (val ? formatDate(val, 'datetime') : '—'),
        width: '180px',
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'right',
        renderCell: (_, row) => (
          <div className="flex items-center justify-end gap-1.5">
            <ATMIconButton
              icon={Smartphone}
              variant="success"
              size="sm"
              onClick={() => handleIssuePairingCode(row)}
              tooltip="Issue 6-digit pairing code"
            />
            <ATMIconButton
              icon={Pencil}
              variant="default"
              size="sm"
              onClick={() => openEdit(row)}
              tooltip="Edit"
            />
            <ATMIconButton
              icon={Trash2}
              variant="danger"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              tooltip="Deactivate"
            />
          </div>
        ),
        width: '160px',
      },
    ],
    [handleIssuePairingCode, openEdit, setDeleteTarget]
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Premium Page Header */}
      <ATMPageHeader
        title="Standalone Terminals"
        subtitle="Pre-register physical PosTerminals for this Standalone Local-Only merchant."
        icon={Monitor}
        iconColor="theme"
        onBack={onBackClick}
      />

      {terminalsError && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-300">
          Error loading terminals. Please try again.
        </div>
      )}

      {/* ATMTable Integration */}
      <ATMCard padding="none" className="overflow-hidden rounded-2xl">
        <ATMTable<MerchantTerminal>
          columns={columns}
          data={filteredTerminals}
          isLoading={isLoading}
          density="compact"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search terminals by code, name or type..."
          extraHeaderActions={
            <ATMButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                // Single allowed type ⇒ preselect it (the field renders disabled).
                setForm({ terminalCode: '', terminalName: '', terminalType: (allowedTypes.length === 1 ? allowedTypes[0] : '') ?? '' });
                setCreateOpen(true);
              }}
            >
              Add Terminal
            </ATMButton>
          }
          emptyMessage="No terminals registered yet. Click Add Terminal to start."
        />
      </ATMCard>

      {/* Create / Edit Modal */}
      <ATMModal
        isOpen={createOpen || !!editTarget}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
          setForm({ terminalCode: '', terminalName: '', terminalType: '' });
        }}
        title={editTarget ? 'Edit Terminal' : 'Add Terminal'}
        footer={
          <div className="flex justify-end gap-2">
            <ATMButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setCreateOpen(false);
                setEditTarget(null);
                setForm({ terminalCode: '', terminalName: '', terminalType: '' });
              }}
              disabled={submitting}
            >
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={editTarget ? handleUpdate : handleCreate}
              disabled={submitting || !form.terminalCode.trim() || !form.terminalName.trim() || !form.terminalType}
              isLoading={submitting}
            >
              {editTarget ? 'Update' : 'Create'}
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-4">
          <ATMTextField
            label="Terminal Code (unique per merchant)"
            placeholder="POS-001"
            value={form.terminalCode}
            onChange={(e) => setForm({ ...form, terminalCode: e.target.value })}
            required
          />
          <ATMTextField
            label="Display Name"
            placeholder="Front Counter"
            value={form.terminalName}
            onChange={(e) => setForm({ ...form, terminalName: e.target.value })}
            required
          />
          {/* 2026-08-30: type is a plan-derived taxonomy, not free text — tokens bound to
              this terminal are flavoured by it. One allowed option ⇒ locked in. */}
          <ATMSelectField
            name="terminalType"
            label="Terminal Type"
            placeholder={allowedTypes.length === 0 ? 'No types available for this plan' : 'Select type…'}
            options={allowedTypes.map((t) => ({ value: t, label: t }))}
            value={form.terminalType || null}
            onChange={(v) => setForm({ ...form, terminalType: (v as string) ?? '' })}
            disabled={allowedTypes.length <= 1}
            required
            helperText={
              allowedTypes.length === 1
                ? `This merchant's plan supports ${allowedTypes[0]} terminals only.`
                : 'Determines what the terminal-bound tokens grant (restaurant vs retail vs inventory-station).'
            }
          />
        </div>
      </ATMModal>

      {/* Delete Confirmation Modal */}
      <ATMModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate Terminal"
        footer={
          <div className="flex justify-end gap-2">
            <ATMButton
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
            >
              Cancel
            </ATMButton>
            <ATMButton
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={submitting}
            >
              Deactivate
            </ATMButton>
          </div>
        }
      >
        <p className="text-sm text-surface-500 font-medium">
          Deactivate <strong>{deleteTarget?.terminalName}</strong>? The record will be soft-deleted
          and any pending pairing codes invalidated. Applied tokens remain in active history.
        </p>
      </ATMModal>

      {/* Pairing Code Display Modal */}
      <ATMModal
        isOpen={!!pairingCode}
        onClose={() => setPairingCode(null)}
        title="Pairing Code"
        footer={
          <ATMButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => setPairingCode(null)}
          >
            Close
          </ATMButton>
        }
      >
        {pairingCode && (
          <div className="space-y-4">
            <p className="text-sm text-surface-500 font-medium">
              Share this 6-digit code with whoever is installing{' '}
              <strong className="text-surface-900 dark:text-surface-100">{pairingCode.terminalName}</strong>.
              They must enter this code in the installer setup.
            </p>

            <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 p-6">
              <code className="font-mono text-4xl font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                {pairingCode.code}
              </code>
              <ATMButton
                variant="ghost"
                size="sm"
                onClick={copyCode}
                icon={Copy}
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="space-y-1 text-amber-800 dark:text-amber-300 font-medium">
                <p><strong>Single-use:</strong> the code can only be redeemed once.</p>
                <p><strong>Expires:</strong> {formatDate(pairingCode.expiresAt, 'datetime')} (24 hours).</p>
                <p><strong>Not visible later:</strong> this is the only time the code is shown. If lost, issue a new one.</p>
              </div>
            </div>
          </div>
        )}
      </ATMModal>
    </div>
  );
};

export default MerchantTerminalsPage;
