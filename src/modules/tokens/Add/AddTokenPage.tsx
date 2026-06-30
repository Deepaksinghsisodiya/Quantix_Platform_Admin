import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Receipt,
  Wallet,
  Key,
} from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMBadge, StatusBadge, ATMTextField, ATMModal, ATMBreadcrumbs } from '@/shared/ui';
import { TokenForm } from '../Form/TokenForm';
import type { PaymentMethod } from '../Form/TokenForm';
export type { PaymentMethod };
import { TokenDisplay } from './TokenDisplay';
import type { RechargeToken, TokenGenerateRequest, TokenTier, Invoice } from '@/lib/types';

interface TokenInvoiceCardProps {
  invoice: Invoice;
  paymentMethod: PaymentMethod;
  onRecordPayment: () => void;
  onMarkPrepaid: () => void;
  loading: boolean;
}

function TokenInvoiceCard({
  invoice,
  paymentMethod,
  onRecordPayment,
  onMarkPrepaid,
  loading,
}: TokenInvoiceCardProps) {
  const isPaid = invoice.status === 'Paid';

  return (
    <ATMCard title="Token Purchase Invoice" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Receipt className="h-4 w-4 text-accent-600" />
          <span>Invoice {invoice.invoiceNumber} — one-time token purchase (PF-07)</span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900 shadow-inner">
          <dl className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{item.description}</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {item.quantity > 1 && `${item.quantity} × `}${item.unitPrice.toFixed(2)}
                  {item.quantity > 1 && ` = $${item.amount.toFixed(2)}`}
                </span>
              </div>
            ))}
            {invoice.tax > 0 && (
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Tax</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">${invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 text-sm font-extrabold border-t border-gray-100 dark:border-gray-800">
              <span className="text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-accent-600 dark:text-accent-400">${invoice.total.toFixed(2)}</span>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={invoice.status} />

          {!isPaid && paymentMethod === 'manual' && (
            <ATMButton
              type="button"
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={onRecordPayment}
              isLoading={loading}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
            >
              Record Manual Payment
            </ATMButton>
          )}

          {!isPaid && paymentMethod === 'prepaid' && (
            <ATMButton
              type="button"
              variant="primary"
              size="sm"
              icon={Wallet}
              onClick={onMarkPrepaid}
              isLoading={loading}
              className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150"
            >
              Mark as Pre-paid
            </ATMButton>
          )}

          {!isPaid && paymentMethod === 'online' && (
            <ATMBadge label="Awaiting online payment" color="primary" />
          )}

          {isPaid && (
            <ATMButton
              type="button"
              variant="ghost"
              size="sm"
              icon={FileText}
            >
              Download Invoice PDF
            </ATMButton>
          )}
        </div>
      </div>
    </ATMCard>
  );
}

export interface AddTokenPageProps {
  canGenerate: boolean;
  generatedToken: RechargeToken | null;
  tokenInvoice: Invoice | null;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  manualPaymentModal: boolean;
  setManualPaymentModal: (open: boolean) => void;
  manualRef: string;
  setManualRef: (val: string) => void;
  prefill?: { merchantId?: string; tier?: TokenTier } | undefined;
  isGenerating: boolean;
  isInvoiceCreating: boolean;
  isRecordingPayment: boolean;
  isMarkingPaid: boolean;
  onSubmit: (request: TokenGenerateRequest) => void;
  onEmail: (token: RechargeToken) => void;
  onDownloadPdf: (token: RechargeToken) => void;
  onRecordManualPayment: () => void;
  onMarkPrepaid: () => void;
  onGenerateAnother: () => void;
}

export const AddTokenPage: React.FC<AddTokenPageProps> = ({
  canGenerate,
  generatedToken,
  tokenInvoice,
  paymentMethod,
  setPaymentMethod,
  manualPaymentModal,
  setManualPaymentModal,
  manualRef,
  setManualRef,
  prefill,
  isGenerating,
  isInvoiceCreating,
  isRecordingPayment,
  isMarkingPaid,
  onSubmit,
  onEmail,
  onDownloadPdf,
  onRecordManualPayment,
  onMarkPrepaid,
  onGenerateAnother,
}) => {
  if (!canGenerate) {
    return (
      <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
        <div className="px-6s py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
          <ATMBreadcrumbs />
          <ATMPageHeader
            title="Generate Recharge Token"
            subtitle="Configure and generate a new recharge token for a Standalone merchant."
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
          <ATMCard padding="md" className="max-w-xl mx-auto shadow-sm border border-gray-150">
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ATMBadge variant="solid" color="danger" label="Access Denied" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                Your role does not include <code className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 text-xs">token.generate</code>. Contact a Platform Admin if this is wrong.
              </p>
            </div>
          </ATMCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Fixed Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <div className="flex flex-col gap-1">
          <ATMBreadcrumbs />
          <ATMPageHeader
            title={prefill ? 'Renew Recharge Token' : 'Generate Recharge Token'}
            icon={Key}
            subtitle={
              prefill
                ? 'Generating a renewal token with pre-filled merchant and tier from the expiring token.'
                : 'Configure and generate a new recharge token for a Standalone merchant.'}
          />
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
        <div className="max-w-full mx-auto w-full">
          {!generatedToken && (
            <TokenForm
              onSubmit={onSubmit}
              loading={isGenerating}
              prefillMerchantId={prefill?.merchantId}
              prefillTier={prefill?.tier}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          )}

          {generatedToken && (
            <div className="space-y-6">
              <TokenDisplay
                token={generatedToken}
                onEmail={onEmail}
                onDownloadPdf={onDownloadPdf}
              />

              {tokenInvoice && (
                <TokenInvoiceCard
                  invoice={tokenInvoice}
                  paymentMethod={paymentMethod}
                  onRecordPayment={() => setManualPaymentModal(true)}
                  onMarkPrepaid={onMarkPrepaid}
                  loading={isRecordingPayment || isMarkingPaid}
                />
              )}

              <div className="flex items-center gap-4 pt-2">
                <ATMButton
                  type="button"
                  variant="primary"
                  onClick={onGenerateAnother}
                >
                  Generate Another Token
                </ATMButton>
                <Link
                  to="/tokens"
                  className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Back to Token History
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ATMModal
        isOpen={manualPaymentModal}
        onClose={() => { setManualPaymentModal(false); setManualRef(''); }}
        title="Record Manual Payment"
        subtitle="Enter the payment reference for this bank transfer or manual payment."
        size="md"
      >
        <div className="space-y-4">
          <ATMTextField
            name="manualRef"
            label="Payment Reference"
            placeholder="e.g., Bank transfer ref, receipt number..."
            value={manualRef}
            onChange={(e) => setManualRef(e.target.value)}
          />
          {tokenInvoice && (
            <div className="rounded-xl bg-gray-55 px-4 py-3 text-sm dark:bg-gray-900 shadow-inner flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-bold">Amount Due: </span>
              <span className="font-extrabold text-accent-600 dark:text-accent-400">${tokenInvoice.total.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <ATMButton type="button" variant="secondary" size="sm" onClick={() => { setManualPaymentModal(false); setManualRef(''); }}>
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="primary"
              size="sm"
              disabled={!manualRef.trim()}
              isLoading={isRecordingPayment}
              onClick={onRecordManualPayment}
            >
              Confirm Payment
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
};
export default AddTokenPage;
