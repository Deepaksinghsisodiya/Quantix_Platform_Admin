import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useGetTerminalsByMerchantQuery,
  useCreateTerminalMutation,
  useUpdateTerminalMutation,
  useDeactivateTerminalMutation,
  useIssuePairingCodeMutation,
} from '../services/merchantApi';
import type { MerchantTerminal, PlatformPairingCode } from '../types/merchant.types';
import MerchantTerminalsPage from './MerchantTerminalsPage';

interface FormState {
  terminalCode: string;
  terminalName: string;
  terminalType: string;
}

const EMPTY_FORM: FormState = { terminalCode: '', terminalName: '', terminalType: 'POS-REST' };

export const MerchantTerminalsWrapper: React.FC = () => {
  const { id: merchantId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: terminalsRes, isLoading, error: terminalsError } = useGetTerminalsByMerchantQuery(merchantId);

  // Mutations
  const [createTerminal] = useCreateTerminalMutation();
  const [updateTerminal] = useUpdateTerminalMutation();
  const [deactivateTerminal] = useDeactivateTerminalMutation();
  const [issuePairingCode] = useIssuePairingCodeMutation();

  // Dialog targets
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MerchantTerminal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MerchantTerminal | null>(null);
  const [pairingCode, setPairingCode] = useState<PlatformPairingCode | null>(null);

  // Forms
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const terminals = terminalsRes?.data ?? [];

  const handleCreate = async () => {
    if (!form.terminalCode.trim() || !form.terminalName.trim()) return;
    setSubmitting(true);
    try {
      await createTerminal({
        merchantId,
        terminalCode: form.terminalCode.trim(),
        terminalName: form.terminalName.trim(),
        terminalType: form.terminalType.trim() || undefined,
      }).unwrap();
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Terminal added successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create terminal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await updateTerminal({
        terminalId: editTarget.terminalId,
        data: {
          terminalCode: form.terminalCode.trim(),
          terminalName: form.terminalName.trim(),
          terminalType: form.terminalType.trim() || undefined,
        },
      }).unwrap();
      setEditTarget(null);
      setForm(EMPTY_FORM);
      toast.success('Terminal updated successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update terminal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deactivateTerminal(deleteTarget.terminalId).unwrap();
      setDeleteTarget(null);
      toast.success('Terminal deactivated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to deactivate terminal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssuePairingCode = async (terminal: MerchantTerminal) => {
    try {
      const res = await issuePairingCode({ terminalId: terminal.terminalId, ttlHours: 24 }).unwrap();
      if (res.data) {
        setPairingCode(res.data);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to issue pairing code.');
    }
  };

  const openEdit = (t: MerchantTerminal) => {
    setEditTarget(t);
    setForm({
      terminalCode: t.terminalCode,
      terminalName: t.terminalName,
      terminalType: t.terminalType ?? 'POS-REST',
    });
  };

  const copyCode = () => {
    if (pairingCode?.code) {
      navigator.clipboard.writeText(pairingCode.code);
      toast.success('Copied to clipboard');
    }
  };

  const onBackClick = () => {
    navigate(`/merchants/${merchantId}`);
  };

  return (
    <MerchantTerminalsPage
      merchantId={merchantId}
      terminals={terminals}
      isLoading={isLoading}
      terminalsError={terminalsError}
      onBackClick={onBackClick}
      createOpen={createOpen}
      setCreateOpen={setCreateOpen}
      editTarget={editTarget}
      setEditTarget={setEditTarget}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      pairingCode={pairingCode}
      setPairingCode={setPairingCode}
      form={form}
      setForm={setForm}
      submitting={submitting}
      handleCreate={handleCreate}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      handleIssuePairingCode={handleIssuePairingCode}
      openEdit={openEdit}
      copyCode={copyCode}
    />
  );
};

export default MerchantTerminalsWrapper;
