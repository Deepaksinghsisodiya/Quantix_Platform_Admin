import React, { useState, useMemo, useCallback } from 'react';
import { useMerchants } from '@/lib/hooks/useMerchants';
import { useBulkGenerateTokens, useTokenTemplates } from '../services/useTokens';
import type { TokenTier, RechargeToken } from '@/lib/types';
import { toast } from 'sonner';
import { BulkTokenPage } from './BulkTokenPage';

export const BulkTokenWrapper: React.FC = () => {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedTier, setSelectedTier] = useState<TokenTier | null>(null);
  const [validityDays, setValidityDays] = useState(90);
  const [quantity, setQuantity] = useState(10);
  const [generatedTokens, setGeneratedTokens] = useState<readonly RechargeToken[]>([]);

  const {
    data: merchantsData,
    isLoading: merchantsLoading,
    isError: merchantsError,
    refetch: refetchMerchants,
  } = useMerchants({ merchantType: 'Standalone', pageSize: 200 });

  const { data: templatesRes } = useTokenTemplates();
  const templates = templatesRes?.data || [];

  const bulkGenerateMutation = useBulkGenerateTokens();

  const handleGenerate = useCallback(() => {
    if (!selectedMerchant || !selectedTier || quantity <= 0) return;

    const matchingTemplate = templates.find((t) => t.tier === selectedTier) || templates[0];
    const templateId = matchingTemplate?.id || '';

    bulkGenerateMutation.mutate(
      {
        merchantIds: Array(quantity).fill(selectedMerchant),
        templateId,
        overrides: {
          validityDays,
          tier: selectedTier,
        },
        invoiceOption: 'immediate',
      },
      {
        onSuccess: (res) => {
          setGeneratedTokens(res.data || []);
          toast.success(`${quantity} tokens generated successfully`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to generate tokens in bulk');
        },
      }
    );
  }, [selectedMerchant, selectedTier, quantity, validityDays, bulkGenerateMutation, templates]);

  const handleDownloadCsv = useCallback(() => {
    if (generatedTokens.length === 0) return;
    try {
      const headers = ['Token ID', 'Token String', 'Status'];
      const rows = generatedTokens.map((t) => [t.id, t.tokenString, t.status]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `bulk_tokens_${selectedMerchant}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV downloaded successfully');
    } catch {
      toast.error('Failed to generate CSV');
    }
  }, [generatedTokens, selectedMerchant]);

  const handleEmail = useCallback(() => {
    toast.info('Sending tokens via email to merchant...');
  }, []);

  const handleReset = useCallback(() => {
    setGeneratedTokens([]);
  }, []);

  const merchantOptions = useMemo(() => {
    return (merchantsData?.data ?? []).map((t: any) => ({
      label: t.businessName,
      value: t.id,
    }));
  }, [merchantsData]);

  return (
    <BulkTokenPage
      merchantsLoading={merchantsLoading}
      merchantsError={merchantsError}
      refetchMerchants={refetchMerchants}
      merchantOptions={merchantOptions}
      selectedMerchant={selectedMerchant}
      setSelectedMerchant={setSelectedMerchant}
      selectedTier={selectedTier}
      setSelectedTier={setSelectedTier}
      validityDays={validityDays}
      setValidityDays={setValidityDays}
      quantity={quantity}
      setQuantity={setQuantity}
      generating={bulkGenerateMutation.isPending}
      generatedTokens={generatedTokens}
      onGenerate={handleGenerate}
      onDownloadCsv={handleDownloadCsv}
      onEmail={handleEmail}
      onReset={handleReset}
    />
  );
};

export default BulkTokenWrapper;
