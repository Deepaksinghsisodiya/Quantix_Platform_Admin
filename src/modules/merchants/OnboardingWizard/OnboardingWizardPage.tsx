/**
 * 2026-08-06: unified admin onboarding wizard — ONE 8-step process for every merchant type.
 * 2026-08-30 (user-locked sequence): infrastructure BEFORE funding —
 *
 *   1. Basic Info   2. Type & Plan   3. KYC   4. Payment
 *   5. Terminals (Standalone POS only)   6. Provision (Enterprise only)
 *   7. Fund (Generate First Token / wallet)   8. Activate & Notify
 *
 * The wizard renders entirely from the server-derived WizardState: closing the browser
 * mid-flight and reopening (or arriving from a website signup) resumes at the first
 * incomplete step. No local step pointer exists.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2, CreditCard, ShieldCheck, Wallet, KeyRound, Database, Globe,
  Store, Cloud, Server,
  CheckCircle2, Circle, MinusCircle, ArrowRight, ArrowLeft, Copy,
  Loader2, PartyPopper, RefreshCw, Upload, Eye, X as XIcon,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMFieldCell, ATMFormGrid } from '@/shared/components/form';
import { cn } from '@/lib/utils/cn';
import { useGetPlansListQuery, useGetPlanByIdQuery } from '@/modules/plans/services/planApi';
import { useGetTerminalsByMerchantQuery, useGetAllowedTerminalTypesQuery, useCreateTerminalMutation } from '@/modules/merchants/services/merchantApi';
import {
  useGetWizardStateQuery,
  useGetPlatformCountryQuery,
  useWizardUpdateBasicMutation,
  useWizardSetTypePlanMutation,
  useWizardRecordKycMutation,
  useWizardRemoveKycMutation,
  useWizardCompleteKycMutation,
  useWizardRecordPaymentMutation,
  useWizardChargeCardMutation,
  type WizardCardChargeResult,
  useWizardCreatePaymentLinkMutation,
  useWizardConfirmPaymentLinkMutation,
  useWizardFundMutation,
  useWizardProvisionMutation,
  useWizardActivateMutation,
} from './wizardApi';
import { postForm, getBlob } from '@/lib/api/client';
import { useGetSetupStatusQuery, useGetPaymentMethodsQuery } from '@/modules/settings/services/settingsApi';
import { countryName } from '@/lib/utils/countryName';
import { tokenizeCard, detectBrand } from '@/lib/payments/cardTokenizer';
import { CardChargePanel } from '@/shared/components/payments/CardChargePanel';
import { TokenDisplay } from '@/modules/tokens/Add/TokenDisplay';
import { useGetTokenQuery } from '@/modules/tokens/services/tokenApi';
import type {
  WizardState, WizardStepKey, WizardPlanOption,
} from './wizard.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_META: Record<WizardStepKey, { label: string; icon: React.ComponentType<any> }> = {
  basic_info: { label: 'Basic Info', icon: Building2 },
  type_plan:  { label: 'Type & Plan', icon: CreditCard },
  kyc:        { label: 'KYC', icon: ShieldCheck },
  payment:    { label: 'Payment', icon: CreditCard },
  terminals:  { label: 'Terminals', icon: Building2 },
  fund:       { label: 'Fund', icon: Wallet },
  provision:  { label: 'Provision', icon: Database },
  activate:   { label: 'Activate & Notify', icon: PartyPopper },
};

// 2026-08-30 (user directive): hardcoded COUNTRY_OPTIONS removed — the deployment
// country comes from platform.country and its display name from Intl (countryName).

const KYC_DOC_OPTIONS = [
  { label: 'ID Proof (passport / national ID / licence)', value: 'IdProof' },
  { label: 'Business Registration', value: 'BusinessRegistration' },
  { label: 'Tax ID (GSTIN / VAT / EIN)', value: 'TaxId' },
  { label: 'Address Proof', value: 'AddressProof' },
  { label: 'Bank Account Proof', value: 'BankAccount' },
  { label: 'Other', value: 'Other' },
];

// 2026-08-30 (user directive): the hardcoded PAYMENT_METHOD_OPTIONS (Cash/Wire/Check/
// Online/Other fiction) is gone — Step 4 offers the SAME platform Payment Methods
// catalog as token issuance (enabled methods only; "Card" routes to the online payment
// link; "External" requires a reference — the accounting trail).

const DB_ENGINE_OPTIONS = [
  { label: 'SQLite', value: 'Sqlite' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'SQL Server', value: 'SqlServer' },
];

/** Merchant kind cards shown at Step 2 — maps to (merchantType, plan filter). */
const KIND_CARDS = [
  {
    key: 'standalone-pos',
    title: 'Standalone — Local POS',
    desc: 'On-premise POS only. No cloud portal. Token-billed.',
    icon: Store,
    merchantType: 'Standalone' as const,
    planTypes: ['StandalonePos'],
  },
  {
    key: 'standalone-cloud',
    title: 'Standalone — Cloud',
    desc: 'Own isolated cloud instance + Merchant Admin Portal. Token-billed.',
    icon: Cloud,
    merchantType: 'Standalone' as const,
    planTypes: ['StandaloneCloud'],
  },
  {
    key: 'enterprise',
    title: 'Enterprise',
    desc: 'Shared managed cloud (own DB), bridge-connected. Billed online.',
    icon: Server,
    merchantType: 'Enterprise' as const,
    planTypes: ['EnterpriseCloud'],
  },
];

function errMsg(err: any, fallback: string): string {
  return err?.data?.message || err?.message || fallback;
}

/**
 * 2026-08-13 (user-locked): a "Skipped" status means two different things and the UI must
 * not conflate them. PROVISION is genuinely not applicable to Standalone merchants (the
 * Platform only provisions Enterprise databases). KYC applies to EVERY merchant — it is
 * common to all — it simply may have no documents recorded, since documents are optional.
 */
function skippedNote(key: WizardStepKey): string {
  return key === 'kyc' ? 'no documents recorded' : 'skipped — not applicable';
}
function skippedBadge(key: WizardStepKey): string {
  return key === 'kyc' ? 'No docs' : 'Skipped';
}

// ---------------------------------------------------------------------------
// Stepper sidebar
// ---------------------------------------------------------------------------

function StepperSidebar({
  state, activeStep, onNavigate,
}: {
  state: WizardState | null;
  activeStep: WizardStepKey;
  onNavigate: (key: WizardStepKey) => void;
}) {
  const steps = state?.steps ?? (Object.keys(STEP_META) as WizardStepKey[]).map((key) => ({
    key, status: key === 'basic_info' ? ('Current' as const) : ('Pending' as const),
  }));

  const completedCount = steps.filter((s) => s.status === 'Complete').length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="bg-white/75 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 backdrop-blur-md shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center justify-between px-2 pb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Onboarding Steps
        </p>
        <span className="text-[10px] font-black text-primary-600 dark:text-primary-400">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-2 pb-4">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {steps.map((s, idx) => {
          const meta = STEP_META[s.key];
          const isActive = s.key === activeStep;
          // 2026-08-13: KYC stays reachable even with no documents — it applies to every
          // merchant, so the operator must be able to come back and add documents later.
          // (Provision genuinely is not applicable to Standalone, so it stays locked.)
          const clickable = s.status === 'Complete'
            || s.key === state?.currentStep
            || (s.key === 'kyc' && s.status === 'Skipped');
          return (
            <button
              key={s.key}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onNavigate(s.key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : clickable
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed',
              )}
            >
              {s.status === 'Complete' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                </span>
              ) : s.status === 'Skipped' ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <MinusCircle size={13} className="text-slate-300 dark:text-slate-600" />
                </span>
              ) : (
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black',
                    isActive
                      ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600',
                  )}
                >
                  {idx + 1}
                </span>
              )}
              <span className="flex-1 text-xs font-bold">{meta.label}</span>
              {s.status === 'Skipped' && (
                <span className="text-[9px] font-black uppercase tracking-wider opacity-60">{skippedBadge(s.key)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 px-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
        {completedCount} of {total} steps complete. Close anytime — resuming reopens at the
        first incomplete step.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step card shell — consistent premium header for every wizard step
// ---------------------------------------------------------------------------

function WizardStepCard({
  stepKey, title, description, children,
}: {
  stepKey: WizardStepKey;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const meta = STEP_META[stepKey];
  const Icon = meta.icon;
  const stepNo = Object.keys(STEP_META).indexOf(stepKey) + 1;

  return (
    <ATMCard className="glass-card" padding="none">
      <div className="flex items-start gap-3.5 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-50/60 via-white to-white dark:from-primary-950/20 dark:via-transparent dark:to-transparent rounded-t-2xl">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/25 shrink-0">
          <Icon size={19} strokeWidth={2} />
        </span>
        <div className="min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Step {stepNo} of {Object.keys(STEP_META).length}
            </span>
          </div>
          <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight truncate mt-0.5">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </ATMCard>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { merchantId } = useParams<{ merchantId: string }>();
  const isNew = !merchantId;

  const { data: stateRes, isLoading: isStateLoading, refetch: refetchState } = useGetWizardStateQuery(merchantId ?? '', { skip: isNew });
  const { data: countryRes } = useGetPlatformCountryQuery();
  const { data: plansRes } = useGetPlansListQuery();
  // Deployment currency (derived from platform.country at setup) — payments are always
  // recorded in it; never a hardcoded 'USD'.
  const { data: setupRes } = useGetSetupStatusQuery();
  // 2026-09-05: undefined (not '') until setup-status arrives, so the card panel shows an
  // em dash and refuses to charge rather than displaying an amount with no currency.
  const platformCurrency = setupRes?.data?.currency || undefined;
  // Same payment-method catalog as token issuance (user directive) — enabled methods only.
  const methodsQuery = useGetPaymentMethodsQuery({ enabledOnly: true });
  const enabledMethods = methodsQuery.data?.data ?? [];
  // Card checkout tokenizes with the configured gateway's client script (Mock in dev).
  const paymentProvider = setupRes?.data?.paymentProvider || 'Mock';

  // Single-country deployment: configured once in Global Settings, displayed read-only here.
  const platformCountry =
    (countryRes?.data as any)?.settingValue
    ?? stateRes?.data?.basicInfo?.country
    ?? '…';
  const countryLabel = countryName(platformCountry) || platformCountry;

  const state: WizardState | null = stateRes?.data ?? null;
  const plans = ((plansRes?.data ?? []) as unknown as WizardPlanOption[])
    .filter((p) => p.isActive && !p.isDeprecated);

  // 2026-08-30 (user directive): the Fund step shows the SAME full token detail as the
  // Token section — fetched through the same token API and rendered by TokenDisplay.
  const fundTokenId = state?.fundSummary?.kind === 'Token' ? state.fundSummary.tokenId ?? '' : '';
  const fundTokenQuery = useGetTokenQuery(fundTokenId, { skip: !fundTokenId });

  const [activeStep, setActiveStep] = useState<WizardStepKey>('basic_info');
  useEffect(() => {
    if (state) setActiveStep(state.currentStep);
  }, [state?.currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutations ──
  const [updateBasic, { isLoading: updating }] = useWizardUpdateBasicMutation();
  const [setTypePlan, { isLoading: settingPlan }] = useWizardSetTypePlanMutation();
  const [recordKyc, { isLoading: recordingKyc }] = useWizardRecordKycMutation();
  const [removeKyc] = useWizardRemoveKycMutation();
  const [completeKyc, { isLoading: completingKyc }] = useWizardCompleteKycMutation();
  const [recordPayment, { isLoading: recordingPayment }] = useWizardRecordPaymentMutation();
  const [createPaymentLink, { isLoading: creatingLink }] = useWizardCreatePaymentLinkMutation();
  const [confirmPaymentLink, { isLoading: confirmingLink }] = useWizardConfirmPaymentLinkMutation();
  const [fund, { isLoading: funding }] = useWizardFundMutation();
  const [provision, { isLoading: provisioning }] = useWizardProvisionMutation();
  const [activate, { isLoading: activating }] = useWizardActivateMutation();

  // 2026-08-29 (Pass 44): Terminals step — Standalone POS only; the first token binds
  // to the earliest active terminal, so at least one must exist before Fund.
  const terminalsQuery = useGetTerminalsByMerchantQuery(merchantId ?? '', { skip: isNew || !merchantId });
  const [createTerminal, { isLoading: creatingTerminal }] = useCreateTerminalMutation();
  const [termName, setTermName] = useState('');
  const [termCode, setTermCode] = useState('');
  // 2026-08-30: type is required — it flavours the terminal-bound token (Restaurant/
  // Retail/Inventory). Options are plan-derived; one option ⇒ auto-selected + locked.
  const allowedTypesQuery = useGetAllowedTerminalTypesQuery(merchantId ?? '', { skip: isNew || !merchantId });
  const allowedTermTypes = allowedTypesQuery.data?.data ?? [];
  const [termType, setTermType] = useState('');
  useEffect(() => {
    if (allowedTermTypes.length === 1 && termType !== allowedTermTypes[0]) setTermType(allowedTermTypes[0] ?? '');
  }, [allowedTermTypes, termType]);

  const addTerminal = async () => {
    if (!merchantId || !termName.trim() || !termCode.trim() || !termType) return;
    try {
      await createTerminal({ merchantId, terminalName: termName.trim(), terminalCode: termCode.trim(), terminalType: termType }).unwrap();
      toast.success(`Terminal ${termName.trim()} created`);
      setTermName('');
      setTermCode('');
      void terminalsQuery.refetch();
      void refetchState();
    } catch (err: any) {
      toast.error(errMsg(err, 'Failed to create terminal'));
    }
  };

  // ── Step 1 form ──
  const [basic, setBasic] = useState({
    // country is server-authoritative (single-country deployment) — no fabricated default.
    companyName: '', contactName: '', contactEmail: '', contactPhone: '', country: '', businessNature: '',
  });
  useEffect(() => {
    if (state?.basicInfo) {
      setBasic({
        companyName: state.basicInfo.companyName ?? '',
        contactName: state.basicInfo.contactName ?? '',
        contactEmail: state.basicInfo.contactEmail ?? '',
        contactPhone: state.basicInfo.contactPhone ?? '',
        // 2026-09-04: was `?? 'US'` — a hardcoded country in a deployment-configured
        // platform. The submit path already sends platformCountry (below), so this local
        // field only mirrors the resumed record; leave it empty rather than invent one.
        country: state.basicInfo.country ?? '',
        businessNature: state.basicInfo.businessNature ?? '',
      });
    }
  }, [state?.basicInfo]);

  // 2026-08-12 (signup/onboarding split): the wizard no longer CREATES merchants —
  // signup is its own one-form page (New Signup / website); onboarding always continues
  // an existing signup, so Step 1 is the signed-up basic info, editable.
  const submitBasic = async () => {
    try {
      // Country is server-authoritative (single-country deployment) — value sent is ignored.
      const body = { ...basic, country: platformCountry };
      await updateBasic({ merchantId: merchantId!, body }).unwrap();
      toast.success('Merchant info updated.');
      setActiveStep(state?.currentStep ?? 'type_plan');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to save merchant info.')); }
  };

  // ── Step 2 form ──
  const [kindKey, setKindKey] = useState<string>('standalone-pos');
  const [planId, setPlanId] = useState<string>('');
  const [dbEngine, setDbEngine] = useState<string>('Sqlite');
  const [discountPct, setDiscountPct] = useState<number>(0);
  // 2026-09-05 (decision B): Enterprise expected MONTHLY revenue. Blank = no estimate,
  // which makes the coverage rule ask for 90 days of cover instead of 30 plus commission.
  const [expectedRevenue, setExpectedRevenue] = useState<string>('');
  useEffect(() => {
    if (state?.planSelection) {
      const pt = state.planSelection.planType;
      setKindKey(pt === 'EnterpriseCloud' ? 'enterprise' : pt === 'StandaloneCloud' ? 'standalone-cloud' : 'standalone-pos');
      setPlanId(state.planSelection.planId);
      setExpectedRevenue(
        state.planSelection.expectedMonthlyRevenue == null
          ? ''
          : String(state.planSelection.expectedMonthlyRevenue),
      );
    }
  }, [state?.planSelection]);

  const kind = KIND_CARDS.find((k) => k.key === kindKey)!;
  const kindPlans = plans.filter((p) => kind.planTypes.includes(p.planType));

  // Full plan contents preview — the operator shouldn't need to memorise plans.
  const { data: planDetailRes, isFetching: planDetailLoading } = useGetPlanByIdQuery(planId, { skip: !planId });
  const planDetail: any = planDetailRes?.data ?? null;
  const baseDaily: number = planDetail?.planPricePerDay ?? 0;
  const effectiveDaily = Number((baseDaily * (1 - (discountPct || 0) / 100)).toFixed(2));

  const submitTypePlan = async () => {
    if (!planId) { toast.error('Select a plan.'); return; }
    if (discountPct < 0 || discountPct >= 100) { toast.error('Discount must be between 0 and 99%.'); return; }
    try {
      await setTypePlan({
        merchantId: merchantId!,
        body: {
          merchantType: kind.merchantType,
          planId,
          // Per-merchant pricing: same plan, different price. Only sent when discounted.
          dailyPriceOverride: discountPct > 0 ? effectiveDaily : undefined,
          databaseEngine: kind.merchantType === 'Enterprise' ? dbEngine : undefined,
          // Blank stays undefined — "no estimate" is a real answer the rule handles.
          expectedMonthlyRevenue:
            kind.merchantType === 'Enterprise' && expectedRevenue.trim() !== ''
              ? Number(expectedRevenue)
              : undefined,
        },
      }).unwrap();
      toast.success(discountPct > 0
        ? `Plan attached at $${effectiveDaily}/day (${discountPct}% off).`
        : 'Type & plan saved.');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to set type & plan.')); }
  };

  // ── Step 3 form ──
  // 2026-08-12 (user-locked): multiple documents, file upload supported, NOTHING mandatory.
  const [kycForm, setKycForm] = useState({ documentType: 'IdProof', reference: '', notes: '' });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const submitKyc = async () => {
    try {
      if (kycFile) {
        setUploadingKyc(true);
        const form = new FormData();
        form.append('documentType', kycForm.documentType);
        if (kycForm.notes) form.append('notes', kycForm.notes);
        form.append('file', kycFile);
        await postForm(`/api/v1/onboarding-wizard/${merchantId}/kyc/upload`, form);
        toast.success(`"${kycFile.name}" uploaded.`);
      } else if (kycForm.reference.trim() || kycForm.notes.trim()) {
        await recordKyc({ merchantId: merchantId!, body: kycForm }).unwrap();
        toast.success('KYC document recorded.');
      } else {
        toast.error('Attach a file or enter a reference/notes first.');
        return;
      }
      setKycForm({ documentType: 'IdProof', reference: '', notes: '' });
      setKycFile(null);
      refetchState();
    } catch (e: any) { toast.error(errMsg(e, 'Failed to add the KYC document.'));
    } finally { setUploadingKyc(false); }
  };

  const viewKycFile = async (docId: string, fileName: string) => {
    try {
      const blob = await getBlob(`/api/v1/onboarding-wizard/${merchantId}/kyc/${docId}/file`);
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) { toast.error(errMsg(e, 'Failed to open the document.')); }
  };

  const deleteKycDoc = async (docId: string) => {
    try {
      await removeKyc({ merchantId: merchantId!, docId }).unwrap();
      toast.success('Document removed.');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to remove the document.')); }
  };

  // 2026-08-30 (user bug report): Continue must PERSIST the KYC review — it was pure
  // client navigation, so a reopened wizard resumed at KYC and typed-but-unadded
  // document fields were silently lost.
  const continueFromKyc = async () => {
    if (kycFile || kycForm.reference.trim() || kycForm.notes.trim()) {
      toast.error('You have an unsaved document — click "Add Document" / "Upload Document" first, or clear the fields.');
      return;
    }
    try {
      await completeKyc({ merchantId: merchantId! }).unwrap();
      setActiveStep('payment');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to save the KYC step.')); }
  };

  // ── Step 4 form ──
  const daily = state?.planSelection?.dailyPrice ?? 0;
  const isEnterprise = state?.planSelection?.merchantType === 'Enterprise';
  const [pay, setPay] = useState({
    periodDays: 30, amount: 0, securityDepositAmount: 0, rechargeAmount: 0,
    // 2026-09-05: no currencyCode in this form — the API records the payment in
    // platform.currency. paymentMethod starts empty — the operator picks from the catalog grid.
    paymentMethod: '', paymentReference: '', notes: '',
  });
  useEffect(() => {
    if (state?.paymentRecord) {
      const p = state.paymentRecord;
      setPay({
        periodDays: p.periodDays, amount: p.amount,
        securityDepositAmount: p.securityDepositAmount, rechargeAmount: p.rechargeAmount,
        paymentMethod: p.paymentMethod, paymentReference: p.paymentReference ?? '',
        notes: p.notes ?? '',
      });
    }
  }, [state?.paymentRecord]);
  // Auto-suggest the standalone amount from plan price × period.
  useEffect(() => {
    if (!isEnterprise && daily > 0 && !state?.paymentRecord) {
      setPay((prev) => ({ ...prev, amount: Number((daily * prev.periodDays).toFixed(2)) }));
    }
  }, [daily, pay.periodDays, isEnterprise, state?.paymentRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  const planCostForPeriod = Number((daily * pay.periodDays).toFixed(2));
  const enterpriseTotal = Number((pay.securityDepositAmount + pay.rechargeAmount).toFixed(2));

  // ── Card checkout (2026-08-30, user directive: "just we did for tokens") ──
  // Tokenize in the browser (provider script — PAN never reaches our API), then charge
  // server-side; the server computes the amount from the plan and records the payment.
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCharge, setCardCharge] = useState<WizardCardChargeResult | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [chargeCard, { isLoading: chargingCard }] = useWizardChargeCardMutation();
  const cardAmount = isEnterprise ? enterpriseTotal : planCostForPeriod;

  const handleChargeCard = async () => {
    setChargeError(null);
    const digits = cardNumber.replace(/\D/g, '');
    const [mmRaw, yyRaw] = cardExpiry.split('/').map((s) => s.trim());
    const mm = parseInt(mmRaw ?? '', 10);
    const yyNum = parseInt(yyRaw ?? '', 10);
    const yyyy = Number.isFinite(yyNum) ? (yyNum < 100 ? 2000 + yyNum : yyNum) : NaN;

    try {
      const cardToken = await tokenizeCard(paymentProvider, {
        cardholderName: cardName,
        cardNumber: digits,
        expiryMonth: Number.isFinite(mm) ? mm : 0,
        expiryYear: Number.isFinite(yyyy) ? yyyy : 0,
        cvv: cardCvv,
      });

      const res = await chargeCard({
        merchantId: merchantId!,
        body: {
          periodDays: pay.periodDays,
          securityDepositAmount: pay.securityDepositAmount,
          rechargeAmount: pay.rechargeAmount,
          paymentToken: cardToken.token,
          cardBrand: cardToken.brand,
          cardLast4: cardToken.last4,
          cardholderName: cardName.trim(),
          idempotencyKey: `onbcard-${merchantId}-${Date.now()}`,
        },
      }).unwrap();

      setCardCharge(res.data);
      if (res.data.status === 'Succeeded') {
        setCardCvv('');
        toast.success(`Payment captured and recorded — ${res.data.amount.toFixed(2)} ${res.data.currencyCode} via ${res.data.provider}`);
      } else {
        setChargeError(res.data.declineReason
          ? `Card declined — ${res.data.declineReason}`
          : res.data.gatewayMessage || 'Card declined by the gateway.');
      }
    } catch (err: any) {
      setChargeError(err?.data?.message || err?.message || 'Card charge failed.');
    }
  };

  const submitPayment = async () => {
    if (!pay.paymentMethod) {
      toast.error('Select a payment method first.');
      return;
    }
    if (pay.paymentMethod === 'External' && !pay.paymentReference.trim()) {
      toast.error('External payments are collected outside the platform — the payment reference is required for accounting.');
      return;
    }
    try {
      await recordPayment({
        merchantId: merchantId!,
        body: {
          amount: pay.amount,
          securityDepositAmount: pay.securityDepositAmount,
          rechargeAmount: pay.rechargeAmount,
          periodDays: pay.periodDays,
          paymentMethod: pay.paymentMethod,
          paymentReference: pay.paymentReference || undefined,
          notes: pay.notes || undefined,
        },
      }).unwrap();
      toast.success('Payment recorded.');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to record payment.')); }
  };

  // 2026-08-12: online payment — the admin never touches card data. A gateway-hosted
  // payment link is created (amount computed server-side from the plan), emailed/SMSed to
  // the merchant, and Confirm polls the gateway; success auto-records Step 4 as "Online".
  const requestPaymentLink = async () => {
    try {
      await createPaymentLink({
        merchantId: merchantId!,
        body: {
          periodDays: pay.periodDays,
          securityDepositAmount: pay.securityDepositAmount,
          rechargeAmount: pay.rechargeAmount,
        },
      }).unwrap();
      toast.success('Payment link created and sent to the merchant (email/SMS).');
    } catch (e: any) { toast.error(errMsg(e, 'Failed to create the payment link.')); }
  };
  const confirmLink = async () => {
    try {
      await confirmPaymentLink({ merchantId: merchantId! }).unwrap();
      toast.success('Online payment confirmed — recorded automatically.');
    } catch (e: any) { toast.error(errMsg(e, 'Payment is not completed yet.')); }
  };

  // ── Steps 5-7 actions ──
  const doFund = async () => {
    try {
      await fund(merchantId!).unwrap();
      toast.success(isEnterprise ? 'Wallet created and funded.' : 'First token generated.');
    } catch (e: any) { toast.error(errMsg(e, 'Funding failed.')); }
  };
  // 2026-08-30 (provision drift fix): Step 6 collects the manager-entered connection
  // details (Pass-27 model) and runs the REAL provisioner stack synchronously. SQLite
  // needs nothing (derived file path); server engines take host/credentials, or fall
  // back to the platform's configured template when left blank.
  const [provFields, setProvFields] = useState({
    host: '', port: '', databaseName: '', username: '', password: '', extraParams: '',
  });
  const provisionEngine = state?.planSelection?.databaseEngine || dbEngine;
  const doProvision = async () => {
    try {
      const body = provisionEngine === 'Sqlite'
        ? { databaseName: provFields.databaseName.trim() || undefined }
        : {
            host: provFields.host.trim() || undefined,
            port: Number(provFields.port) > 0 ? Number(provFields.port) : undefined,
            databaseName: provFields.databaseName.trim() || undefined,
            username: provFields.username.trim() || undefined,
            password: provFields.password || undefined,
            extraParams: provFields.extraParams.trim() || undefined,
          };
      await provision({ merchantId: merchantId!, body }).unwrap();
      toast.success('Database connection provisioned — status Ready.');
    } catch (e: any) { toast.error(errMsg(e, 'Provisioning failed.')); }
  };
  const doActivate = async () => {
    try {
      await activate(merchantId!).unwrap();
      toast.success('Merchant activated — welcome email sent.');
    } catch (e: any) { toast.error(errMsg(e, 'Activation failed.')); }
  };

  const copyToken = () => {
    if (state?.fundSummary?.encodedToken) {
      navigator.clipboard.writeText(state.fundSummary.encodedToken);
      toast.success('Token copied to clipboard.');
    }
  };

  // ── Loading / resume list ──
  if (!isNew && isStateLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const isActive = state?.merchantStatus === 'Active';

  // Signup is a separate one-form page now — the wizard only continues existing signups.
  if (isNew) return <Navigate to="/merchants/signups" replace />;

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Header */}
      <ATMPageHeader
        title="Merchant Onboarding"
        subtitle={
          state ? (
            <span>
              Onboarding <strong className="font-semibold text-slate-800 dark:text-slate-200">{state.companyName}</strong> — unified 8-step process. Resumes automatically where you left off.
            </span>
          ) : (
            'Continues a signup from the queue — website or admin-entered.'
          )
        }
        icon={Building2}
        iconColor="theme"
        onBack={() => navigate('/merchants/signups')}
        extraActions={
          <Link to="/merchants">
            <ATMButton variant="outline" size="sm" icon={ArrowLeft}>Back to Merchants</ATMButton>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <StepperSidebar state={state} activeStep={activeStep} onNavigate={setActiveStep} />

        <div className="space-y-4">
          {/* ═══ STEP 1: MERCHANT INFO ═══ */}
          {activeStep === 'basic_info' && (
            <WizardStepCard
              stepKey="basic_info"
              title="Merchant Info"
              description="Review and edit the enquiry info captured at signup, before continuing."
            >
              <ATMFormGrid cols={3}>
                <ATMFieldCell label="Merchant Company / Individual Name" required>
                  <ATMTextField name="companyName"
                    placeholder="e.g. Acme Foods Pvt Ltd, or a proprietor's name"
                    value={basic.companyName} onChange={(e) => setBasic({ ...basic, companyName: e.target.value })} />
                </ATMFieldCell>
                <ATMFieldCell label="Contact Person" required>
                  <ATMTextField name="contactName"
                    value={basic.contactName} onChange={(e) => setBasic({ ...basic, contactName: e.target.value })} />
                </ATMFieldCell>
                <ATMFieldCell label="Contact Email" required>
                  <ATMTextField name="contactEmail" type="email"
                    value={basic.contactEmail} onChange={(e) => setBasic({ ...basic, contactEmail: e.target.value })} />
                </ATMFieldCell>
                <ATMFieldCell label="Contact Phone">
                  <ATMTextField name="contactPhone"
                    value={basic.contactPhone} onChange={(e) => setBasic({ ...basic, contactPhone: e.target.value })} />
                </ATMFieldCell>
                {/* Single-country deployment — configured once in Global Settings, not editable per merchant. */}
                <ATMFieldCell label="Country">
                  <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-slate-50 dark:bg-zinc-900/40 shadow-sm">
                    <Globe size={15} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{countryLabel}</span>
                  </div>
                </ATMFieldCell>
                <ATMFieldCell label="Business Nature (free text)">
                  <ATMTextField name="businessNature"
                    placeholder="e.g. Restaurant chain, Retail shops, or both"
                    value={basic.businessNature} onChange={(e) => setBasic({ ...basic, businessNature: e.target.value })} />
                </ATMFieldCell>
              </ATMFormGrid>
              <div className="mt-5 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
                <ATMButton variant="primary" onClick={submitBasic} isLoading={updating} icon={ArrowRight}>
                  Save & Continue
                </ATMButton>
              </div>
            </WizardStepCard>
          )}

          {/* ═══ STEP 2: TYPE & PLAN ═══ */}
          {activeStep === 'type_plan' && state && (
            <WizardStepCard
              stepKey="type_plan"
              title="Merchant Type & Plan"
              description="Choose the merchant kind and the plan that grants their capacity, services and payment methods."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {KIND_CARDS.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    onClick={() => { setKindKey(k.key); setPlanId(''); }}
                    className={cn(
                      'relative flex flex-col gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                      kindKey === k.key
                        ? 'border-primary-500 ring-4 ring-primary-500/10 bg-primary-50/50 dark:bg-primary-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-transparent',
                    )}
                  >
                    {kindKey === k.key && (
                      <span className="absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 shadow-md shadow-primary-500/30">
                        <CheckCircle2 size={10} /> Selected
                      </span>
                    )}
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                        kindKey === k.key
                          ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/25'
                          : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-slate-500',
                      )}
                    >
                      <k.icon size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{k.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{k.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <ATMFormGrid cols={3}>
                <ATMFieldCell label="Plan" required>
                  <ATMSelectField
                    name="planId"
                    options={kindPlans.map((p) => ({
                      label: `${p.displayName} — $${p.planPricePerDay}/day (${p.flavour === 'RES' ? 'Restaurant' : p.flavour === 'RET' ? 'Retail' : 'Restaurant + Retail'})`,
                      value: p.planId,
                    }))}
                    value={planId}
                    onChange={(v: any) => setPlanId(v)}
                  />
                </ATMFieldCell>
                {kind.merchantType === 'Enterprise' && (
                  <ATMFieldCell label="Database Engine (for provisioning)" required>
                    <ATMSelectField
                      name="dbEngine"
                      options={DB_ENGINE_OPTIONS} value={dbEngine} onChange={(v: any) => setDbEngine(v)}
                    />
                  </ATMFieldCell>
                )}
                {kind.merchantType === 'Enterprise' && (
                  <ATMFieldCell
                    label="Expected Monthly Revenue (optional)"
                    hint="Blank = no estimate (funding must cover 90 days)."
                  >
                    <ATMTextField
                      name="expectedMonthlyRevenue"
                      type="number"
                      value={expectedRevenue}
                      onChange={(e) => setExpectedRevenue(e.target.value)}
                    />
                  </ATMFieldCell>
                )}
              </ATMFormGrid>
              {kind.merchantType === 'Enterprise' && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  Sets the wallet funding minimum: with an estimate the deposit and first recharge must
                  cover 30 days of subscription plus the commission that revenue implies. Left blank, they
                  must cover 90 days instead. It can be revised later on the merchant.
                </p>
              )}

              {/* Escape hatch: the operator may not like any available plan. */}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                {kindPlans.length === 0
                  ? 'No active plans for this merchant kind. '
                  : 'None of these plans fit? '}
                <a
                  href="/billing/plans" target="_blank" rel="noreferrer"
                  className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Create a new plan in System Setup → Plans ↗
                </a>
                {' '}— then come back here; this wizard resumes exactly where you left it.
              </p>

              {/* Plan contents preview — operator sees exactly what this plan grants. */}
              {planId && (
                <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-zinc-900/30 p-4 space-y-3">
                  {planDetailLoading || !planDetail ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 size={13} className="animate-spin" /> Loading plan contents…
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          What "{planDetail.displayName}" contains
                        </p>
                        <ATMBadge variant="info" size="sm">
                          {planDetail.flavour === 'RES' ? 'Restaurant' : planDetail.flavour === 'RET' ? 'Retail' : 'Restaurant + Retail'}
                        </ATMBadge>
                      </div>

                      {/* Limits mini-grid */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Capacity Limits</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(planDetail.limits ?? []).map((l: any) => (
                            <span key={l.limitCode} title={l.limitName}
                              className="px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                              {l.limitCode}:{l.maxValue}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Services / Payments / Modules chips */}
                      {[
                        { label: 'Services', items: (planDetail.services ?? []).filter((x: any) => x.isIncluded).map((x: any) => x.serviceName) },
                        { label: 'Payment Methods', items: (planDetail.payments ?? []).filter((x: any) => x.isIncluded).map((x: any) => x.paymentName) },
                        { label: 'Premium Modules', items: (planDetail.features ?? []).filter((x: any) => x.isIncluded && x.featureClass === 'Advance').map((x: any) => x.featureName) },
                      ].map((row) => (
                        <div key={row.label}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            {row.label} <span className="text-slate-300 dark:text-slate-600">({row.items.length})</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {row.items.length > 0 ? row.items.map((name: string) => (
                              <span key={name}
                                className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                {name}
                              </span>
                            )) : <span className="text-[10px] text-slate-400 italic">None included</span>}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-400">All 23 basic POS features are always included in every plan.</p>

                      {/* Pricing + per-merchant discount */}
                      <ATMFormGrid cols={3} className="border-t border-slate-200 dark:border-slate-800 pt-4">
                        <ATMFieldCell label="Plan Rate">
                          <p className="px-0.5 text-lg font-black text-slate-900 dark:text-white">${baseDaily.toFixed(2)}<span className="text-xs font-bold text-slate-400">/day</span></p>
                        </ATMFieldCell>
                        <ATMFieldCell label="Merchant Discount (%)">
                          <ATMTextField
                            name="discountPct" type="number"
                            value={discountPct}
                            onChange={(e) => setDiscountPct(Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
                          />
                        </ATMFieldCell>
                        <ATMFieldCell label="This Merchant Pays">
                          <p className={cn('px-0.5 text-lg font-black', discountPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white')}>
                            ${effectiveDaily.toFixed(2)}<span className="text-xs font-bold text-slate-400">/day</span>
                          </p>
                        </ATMFieldCell>
                      </ATMFormGrid>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
                <ATMButton variant="primary" onClick={submitTypePlan} isLoading={settingPlan} icon={ArrowRight}>
                  Save & Continue
                </ATMButton>
              </div>
            </WizardStepCard>
          )}

          {/* ═══ STEP 3: KYC ═══ */}
          {activeStep === 'kyc' && state && (
            <WizardStepCard
              stepKey="kyc"
              title="KYC Verification"
              description="Optional — upload or record any documents you verified. Multiple documents are fine; nothing is mandatory."
            >
              {state.kycDocuments.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {state.kycDocuments.map((d) => (
                    <div key={d.kycDocumentId} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">{d.documentType}</span>
                        <span className="text-xs font-mono text-slate-500 truncate">{d.reference}</span>
                        {d.hasFile && (
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {(d.fileSizeBytes / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ATMBadge variant="success" size="sm">{d.reviewStatus}</ATMBadge>
                        {d.hasFile && (
                          <button
                            type="button"
                            title="View document"
                            onClick={() => viewKycFile(d.kycDocumentId, d.reference)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Remove document"
                          onClick={() => deleteKycDoc(d.kycDocumentId)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ATMFormGrid cols={3}>
                <ATMFieldCell label="Document Type">
                  <ATMSelectField name="documentType" options={KYC_DOC_OPTIONS}
                    value={kycForm.documentType} onChange={(v: any) => setKycForm({ ...kycForm, documentType: v })} />
                </ATMFieldCell>
                <ATMFieldCell label="Document Number / Reference (optional)">
                  <ATMTextField name="reference"
                    value={kycForm.reference} onChange={(e) => setKycForm({ ...kycForm, reference: e.target.value })} />
                </ATMFieldCell>
                <ATMFieldCell label="Notes (optional)">
                  <ATMTextField name="notes"
                    value={kycForm.notes} onChange={(e) => setKycForm({ ...kycForm, notes: e.target.value })} />
                </ATMFieldCell>
              </ATMFormGrid>

              {/* Optional file — PDF/PNG/JPG/WEBP, max 10 MB. */}
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 transition-colors">
                  <Upload size={14} />
                  {kycFile ? 'Replace file' : 'Attach file (optional)'}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setKycFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {kycFile && (
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {kycFile.name} ({(kycFile.size / 1024).toFixed(0)} KB)
                    <button type="button" onClick={() => setKycFile(null)}
                      className="text-slate-400 hover:text-red-500"><XIcon size={13} /></button>
                  </span>
                )}
                <span className="text-[10px] text-slate-400">PDF / PNG / JPG / WEBP, up to 10 MB</span>
              </div>

              <div className="mt-5 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <ATMButton variant="outline" onClick={submitKyc} isLoading={recordingKyc || uploadingKyc}>
                  {kycFile ? 'Upload Document' : 'Add Document'}
                </ATMButton>
                <ATMButton
                  variant="primary"
                  onClick={continueFromKyc}
                  isLoading={completingKyc}
                  icon={ArrowRight}
                >
                  Save & Continue to Payment
                </ATMButton>
              </div>
            </WizardStepCard>
          )}

          {/* ═══ STEP 4: PAYMENT ═══ */}
          {activeStep === 'payment' && state && (
            <WizardStepCard
              stepKey="payment"
              title="Record Payment"
              description={
                isEnterprise
                  ? <>Enterprise: security deposit + first recharge ({state.planSelection?.planName} @ ${daily}/day).</>
                  : <>Standalone: the first token's price — plan daily rate (${daily}/day) × validity days.</>
              }
            >

              {/* 2026-09-05 (decision B): the funding minimum the server enforces, shown
                  before the operator types an amount, with a live shortfall. */}
              {isEnterprise && state.coverageRequirement && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-xs ${
                  enterpriseTotal >= state.coverageRequirement.minimumTokens
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'
                }`}>
                  <p className="font-semibold">
                    Required funding: {state.coverageRequirement.minimumTokens.toFixed(2)} tokens
                  </p>
                  <p className="mt-0.5 leading-relaxed">{state.coverageRequirement.explanation}</p>
                  <p className="mt-1">
                    Deposit + recharge entered: {enterpriseTotal.toFixed(2)}
                    {enterpriseTotal < state.coverageRequirement.minimumTokens
                      ? ` — ${(state.coverageRequirement.minimumTokens - enterpriseTotal).toFixed(2)} short.`
                      : ' — requirement met.'}
                  </p>
                </div>
              )}

              <ATMFormGrid cols={3}>
                <ATMFieldCell
                  label={isEnterprise ? 'First Subscription Period (days)' : 'Token Validity (days, min 30)'}
                  required
                >
                  <ATMTextField
                    name="periodDays"
                    type="number"
                    value={pay.periodDays}
                    onChange={(e) => setPay({ ...pay, periodDays: Number(e.target.value) || 0 })}
                  />
                </ATMFieldCell>
                {isEnterprise ? (
                  <>
                    <ATMFieldCell label="Security Deposit ($)" required>
                      <ATMTextField name="securityDepositAmount" type="number"
                        value={pay.securityDepositAmount}
                        onChange={(e) => setPay({ ...pay, securityDepositAmount: Number(e.target.value) || 0 })} />
                    </ATMFieldCell>
                    <ATMFieldCell label="First Recharge ($)" required>
                      <ATMTextField name="rechargeAmount" type="number"
                        value={pay.rechargeAmount}
                        onChange={(e) => setPay({ ...pay, rechargeAmount: Number(e.target.value) || 0 })} />
                    </ATMFieldCell>
                  </>
                ) : (
                  <ATMFieldCell label="Amount Received ($)" required>
                    <ATMTextField name="amount" type="number"
                      value={pay.amount}
                      onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) || 0 })} />
                  </ATMFieldCell>
                )}
              </ATMFormGrid>

              {/* Validation hint */}
              <div className={cn(
                'mt-4 px-3 py-2 rounded-lg text-xs font-semibold',
                (isEnterprise ? enterpriseTotal >= planCostForPeriod : pay.amount >= planCostForPeriod)
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
              )}>
                Plan cost for {pay.periodDays} days: ${planCostForPeriod.toFixed(2)}
                {isEnterprise
                  ? <> · Deposit + Recharge = ${enterpriseTotal.toFixed(2)} {enterpriseTotal >= planCostForPeriod ? '✓' : '— must be at least the plan cost'}</>
                  : <> · Amount = ${pay.amount.toFixed(2)} {pay.amount >= planCostForPeriod ? '✓' : '— must cover the token price'}</>}
              </div>

              {/* 2026-08-30 (user directive): the SAME payment-method catalog as token
                  issuance. Card = online payment link; External = mandatory reference. */}
              <div className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Method</p>
                {methodsQuery.isLoading ? (
                  <p className="py-2 text-xs font-semibold text-slate-400">Loading payment methods…</p>
                ) : enabledMethods.length === 0 ? (
                  <p className="py-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    No payment methods are enabled — enable at least one under System Setup → Payment Methods.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {enabledMethods.map((m) => (
                      <button
                        key={m.methodType}
                        type="button"
                        onClick={() => setPay({ ...pay, paymentMethod: m.methodType })}
                        className={cn(
                          'rounded-xl border px-4 py-3 text-sm font-bold transition-colors text-left',
                          pay.paymentMethod === m.methodType
                            ? 'border-primary-500 bg-primary-50/60 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300',
                        )}
                      >
                        {m.displayName}
                        {m.methodType === 'External' && (
                          <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Collected outside the platform</span>
                        )}
                        {m.methodType === 'Card' && (
                          <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Online — charged via gateway</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {pay.paymentMethod && pay.paymentMethod !== 'Card' && (
                <>
                  <div className="mt-4">
                    <ATMFormGrid cols={2}>
                      <ATMFieldCell
                        label={pay.paymentMethod === 'External' ? 'Payment Reference (required)' : 'Payment Reference (optional)'}
                        required={pay.paymentMethod === 'External'}
                      >
                        <ATMTextField name="paymentReference"
                          placeholder={pay.paymentMethod === 'External' ? 'Bank/settlement/transaction reference…' : 'Wire ref, cheque no, receipt no…'}
                          value={pay.paymentReference} onChange={(e) => setPay({ ...pay, paymentReference: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Notes (optional)">
                        <ATMTextField name="notes"
                          value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} />
                      </ATMFieldCell>
                    </ATMFormGrid>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <ATMButton variant="primary" onClick={submitPayment} isLoading={recordingPayment} icon={ArrowRight}>
                      Record Payment & Continue
                    </ATMButton>
                  </div>
                </>
              )}

              {/* 2026-08-30 (user directive): Card = the SAME eCommerce checkout as the
                  token wizard — card fields, client-side tokenization, server charge. */}
              {pay.paymentMethod === 'Card' && (
                <div className="mt-4">
                  <CardChargePanel
                    amount={cardAmount > 0 ? cardAmount : null}
                    currency={platformCurrency}
                    cardName={cardName}
                    onCardNameChange={setCardName}
                    cardNumber={cardNumber}
                    onCardNumberChange={setCardNumber}
                    cardExpiry={cardExpiry}
                    onCardExpiryChange={setCardExpiry}
                    cardCvv={cardCvv}
                    onCardCvvChange={setCardCvv}
                    cardBrand={detectBrand(cardNumber.replace(/\D/g, ''))}
                    cardCharge={cardCharge}
                    chargeError={chargeError}
                    charging={chargingCard}
                    onChargeCard={handleChargeCard}
                    successNote="The payment has been recorded — continue with the next step."
                  />
                </div>
              )}

              {/* 2026-08-12: ONLINE payment link — hosted gateway link for a merchant who
                  pays remotely; no card data touches the platform. Secondary option under
                  Card, or shown whenever a link is already in flight. */}
              {(pay.paymentMethod === 'Card' || state.paymentIntent) && (
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Or send a payment link to the merchant
                </p>
                {state.paymentIntent ? (
                  <div className="rounded-xl border border-sky-200 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/20 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Payment link for <strong>{state.paymentIntent.amount.toFixed(2)} {state.paymentIntent.currencyCode}</strong>{' '}
                      via {state.paymentIntent.provider} — sent to the merchant by email/SMS.
                    </p>
                    {state.paymentIntent.paymentLinkUrl && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-[11px] px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 break-all">
                          {state.paymentIntent.paymentLinkUrl}
                        </code>
                        <ATMButton
                          variant="outline" size="sm" icon={Copy}
                          onClick={() => { navigator.clipboard.writeText(state.paymentIntent!.paymentLinkUrl!); toast.success('Link copied.'); }}
                        >
                          Copy
                        </ATMButton>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ATMButton variant="primary" size="sm" isLoading={confirmingLink} onClick={confirmLink}>
                        Confirm Payment Received
                      </ATMButton>
                      <ATMButton variant="outline" size="sm" isLoading={creatingLink} onClick={requestPaymentLink}>
                        Regenerate Link
                      </ATMButton>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Confirm polls the gateway — once the merchant has paid, Step 4 records itself as "Online".
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <ATMButton variant="outline" isLoading={creatingLink} onClick={requestPaymentLink}>
                      Request Online Payment
                    </ATMButton>
                    <p className="text-[11px] text-slate-400 max-w-md">
                      Creates a secure payment link with the configured gateway for the amount
                      above and sends it to the merchant — card details never reach the platform.
                    </p>
                  </div>
                )}
              </div>
              )}
            </WizardStepCard>
          )}

          {/* ═══ STEP 5: TERMINALS (Standalone POS only) ═══ */}
          {activeStep === 'terminals' && state && (
            <WizardStepCard
              stepKey="terminals"
              title="Terminals"
              description="Standalone POS merchants have no central cloud — create the first terminal here. The first token binds to it, and the local POS pairs with a 6-digit code."
            >
              {(terminalsQuery.data?.data ?? []).length > 0 && (
                <div className="mb-4 space-y-2">
                  {(terminalsQuery.data?.data ?? []).map((t) => (
                    <div key={t.terminalId} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{t.terminalName}</span>
                        <code className="text-[11px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800">{t.terminalCode}</code>
                      </div>
                      <ATMBadge size="sm" color={t.isRegistered ? 'success' : 'gray'} label={t.isRegistered ? 'Paired' : 'Not paired yet'} />
                    </div>
                  ))}
                </div>
              )}

              <ATMFormGrid cols={4}>
                <ATMFieldCell label="Terminal Name">
                  <ATMTextField
                    name="termName"
                    placeholder="e.g. Front Counter"
                    value={termName}
                    onChange={(e) => setTermName(e.target.value)}
                  />
                </ATMFieldCell>
                <ATMFieldCell label="Terminal Code">
                  <ATMTextField
                    name="termCode"
                    placeholder="e.g. T-01"
                    value={termCode}
                    onChange={(e) => setTermCode(e.target.value)}
                  />
                </ATMFieldCell>
                {/* Plan-derived taxonomy — flavours the terminal-bound token. */}
                <ATMFieldCell label="Terminal Type">
                  <ATMSelectField
                    name="termType"
                    placeholder="Select type…"
                    options={allowedTermTypes.map((t) => ({ value: t, label: t }))}
                    value={termType || null}
                    onChange={(v) => setTermType((v as string) ?? '')}
                    disabled={allowedTermTypes.length <= 1}
                  />
                </ATMFieldCell>
                <div className="flex items-end">
                  <ATMButton
                    variant="outline"
                    isLoading={creatingTerminal}
                    disabled={!termName.trim() || !termCode.trim() || !termType}
                    onClick={addTerminal}
                  >
                    Add Terminal
                  </ATMButton>
                </div>
              </ATMFormGrid>

              <p className="text-[10px] text-slate-400 mt-3">
                The plan's Max Terminals limit is enforced on creation.
              </p>

              <div className="flex justify-end mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                <ATMButton
                  variant="primary"
                  icon={ArrowRight}
                  disabled={(terminalsQuery.data?.data ?? []).length === 0}
                  onClick={() => setActiveStep('fund')}
                >
                  Continue to Fund
                </ATMButton>
              </div>
            </WizardStepCard>
          )}

          {/* ═══ STEP 6: FUND ═══ */}
          {activeStep === 'fund' && state && (
            <WizardStepCard
              stepKey="fund"
              title={isEnterprise ? 'Create Wallet' : 'Generate First Token'}
              description={
                state.fundSummary
                  ? 'Funding is complete — review below, then continue.'
                  : isEnterprise
                    ? 'Create the funded wallet with the deposit and first recharge recorded in Step 4.'
                    : 'Generate the first token, which binds to the earliest active terminal.'
              }
            >
              {state.paymentRecord && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900/40 text-xs text-slate-600 dark:text-slate-300">
                  Recorded payment: <b>${state.paymentRecord.amount.toFixed(2)}</b> via {state.paymentRecord.paymentMethod}
                  {state.paymentRecord.paymentReference ? ` (ref ${state.paymentRecord.paymentReference})` : ''} ·
                  period <b>{state.paymentRecord.periodDays}d</b>
                  {isEnterprise && <> · deposit ${state.paymentRecord.securityDepositAmount.toFixed(2)} + recharge ${state.paymentRecord.rechargeAmount.toFixed(2)}</>}
                </div>
              )}

              {state.fundSummary ? (
                <div className="space-y-3">
                  {state.fundSummary.kind === 'Wallet' ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                      <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-sm">
                        <p className="font-bold text-slate-900 dark:text-white">Wallet funded</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Balance ${state.fundSummary.walletBalance?.toFixed(2)} · Security deposit ${state.fundSummary.securityDeposit?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">
                        <KeyRound className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <div className="text-sm">
                          <p className="font-bold text-slate-900 dark:text-white">First token generated</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {state.fundSummary.validityDays} days validity — it will be emailed to the merchant at Activate &amp; Notify.
                          </p>
                        </div>
                      </div>
                      {/* 2026-08-30 (user directive): the SAME full detail as the Token
                          section — QR, token string, identity grid, "what this token grants". */}
                      {fundTokenQuery.data?.data ? (
                        <TokenDisplay token={fundTokenQuery.data.data} />
                      ) : fundTokenQuery.isFetching ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 px-1 py-3">
                          <Loader2 size={13} className="animate-spin" /> Loading token details…
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {fundTokenQuery.isError && (
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Failed to load the token details — the raw token string is below.
                            </p>
                          )}
                          <div className="relative">
                            <textarea
                              readOnly rows={3}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 px-3 py-2 font-mono text-[10px] text-slate-600 dark:text-slate-400"
                              value={state.fundSummary.encodedToken ?? ''}
                            />
                            <button onClick={copyToken} className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white" title="Copy token">
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <ATMButton variant="primary" onClick={() => setActiveStep(state.currentStep)} icon={ArrowRight}>
                      Continue
                    </ATMButton>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <ATMButton variant="primary" onClick={doFund} isLoading={funding} icon={isEnterprise ? Wallet : KeyRound}>
                    {isEnterprise ? 'Create Wallet (deposit + recharge)' : 'Generate First Token'}
                  </ATMButton>
                </div>
              )}
            </WizardStepCard>
          )}

          {/* ═══ STEP 7: PROVISION ═══ */}
          {activeStep === 'provision' && state && (
            <WizardStepCard
              stepKey="provision"
              title="Database Provisioning"
              description={isEnterprise
                ? 'Composes and stores this merchant\u2019s dedicated database connection (encrypted at rest).'
                : 'Skipped — Standalone merchants are not platform-provisioned.'}
            >
              {isEnterprise ? (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Composes and stores this merchant's dedicated{' '}
                    <b>{DB_ENGINE_OPTIONS.find((o) => o.value === provisionEngine)?.label ?? provisionEngine}</b>{' '}
                    connection (encrypted at rest). The merchant cloud creates the schema
                    itself on first connect via the Bridge.
                  </p>
                  {/* 2026-08-30 (provision drift fix): manager-entered access details —
                      the Pass-27 fields the provisioners always supported but no UI
                      collected since the unified wizard. */}
                  {provisionEngine === 'Sqlite' ? (
                    <ATMFormGrid cols={2} className="mb-4">
                      <ATMFieldCell label="Database File Name (optional)">
                        <ATMTextField
                          name="provDbName" placeholder={`derived: merchant-<code>.db`}
                          value={provFields.databaseName}
                          onChange={(e) => setProvFields({ ...provFields, databaseName: e.target.value })}
                        />
                      </ATMFieldCell>
                    </ATMFormGrid>
                  ) : (
                    <ATMFormGrid cols={3} className="mb-4">
                      <ATMFieldCell label="Host">
                        <ATMTextField name="provHost" placeholder="db.example.internal"
                          value={provFields.host}
                          onChange={(e) => setProvFields({ ...provFields, host: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Port (optional)">
                        <ATMTextField name="provPort" type="number" placeholder="engine default"
                          value={provFields.port}
                          onChange={(e) => setProvFields({ ...provFields, port: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Database Name (optional)">
                        <ATMTextField name="provDbName" placeholder="derived from merchant code"
                          value={provFields.databaseName}
                          onChange={(e) => setProvFields({ ...provFields, databaseName: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Username">
                        <ATMTextField name="provUser"
                          value={provFields.username}
                          onChange={(e) => setProvFields({ ...provFields, username: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Password">
                        <ATMTextField name="provPassword" type="password"
                          value={provFields.password}
                          onChange={(e) => setProvFields({ ...provFields, password: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell label="Extra Params (optional)">
                        <ATMTextField name="provExtra" placeholder="e.g. SslMode=Require"
                          value={provFields.extraParams}
                          onChange={(e) => setProvFields({ ...provFields, extraParams: e.target.value })} />
                      </ATMFieldCell>
                      <ATMFieldCell className="sm:col-span-3">
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Leave host/credentials blank to use the platform's configured connection template.
                        </p>
                      </ATMFieldCell>
                    </ATMFormGrid>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Status:{' '}
                      <ATMBadge variant={state.provisioningStatus === 'Failed' ? 'danger' : 'info'} size="sm">
                        {state.provisioningStatus === 'NotApplicable' ? 'Not Provisioned Yet' : state.provisioningStatus}
                      </ATMBadge>
                      {state.provisioningError && <p className="text-rose-500 mt-1">{state.provisioningError}</p>}
                    </div>
                    <ATMButton variant="primary" onClick={doProvision} isLoading={provisioning} icon={Database}>
                      {state.steps.find((s) => s.key === 'provision')?.status === 'Complete' ? 'Re-run Provisioning' : 'Provision Database'}
                    </ATMButton>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Skipped — Standalone merchants are not platform-provisioned. A Standalone Cloud
                  instance is set up manually outside the platform; a Local POS merchant runs fully on-premise.
                </p>
              )}
            </WizardStepCard>
          )}

          {/* ═══ STEP 8: ACTIVATE ═══ */}
          {activeStep === 'activate' && state && (
            <WizardStepCard
              stepKey="activate"
              title="Activate & Notify"
              description={
                isActive
                  ? 'This merchant is live.'
                  : 'Final review — activating sets the merchant live, provisions their portal login, and emails the welcome pack.'
              }
            >
              {isActive ? (
                <div className="text-center py-8 space-y-4">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/30">
                    <PartyPopper className="h-8 w-8" />
                  </span>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {state.companyName} is live!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Welcome email with credentials{state.merchantType === 'Standalone' ? ' and the activation token' : ''} has been sent to {state.basicInfo?.contactEmail}.
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <Link to={`/merchants/${state.merchantId}`}>
                      <ATMButton variant="primary" size="md">Open Merchant Detail</ATMButton>
                    </Link>
                    <Link to="/merchants/onboard">
                      <ATMButton variant="outline" size="md" icon={RefreshCw}>Onboard Another</ATMButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5 mb-5">
                    {state.steps.filter((s) => s.key !== 'activate').map((s) => (
                      <div key={s.key} className="flex items-center gap-2.5 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {s.status === 'Complete'
                          ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40"><CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" /></span>
                          : s.status === 'Skipped'
                            ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><MinusCircle size={12} className="text-slate-400 dark:text-slate-600" /></span>
                            : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40"><Circle size={12} className="text-amber-500" /></span>}
                        <span className={cn(
                          s.status === 'Complete' ? 'text-slate-700 dark:text-slate-300'
                            : s.status === 'Skipped' ? 'text-slate-400 dark:text-slate-600'
                              : 'text-amber-600 dark:text-amber-400',
                        )}>
                          {STEP_META[s.key].label}{s.status === 'Skipped' ? ` (${skippedNote(s.key)})` : s.status !== 'Complete' ? ' — incomplete' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <ATMButton
                      variant="primary"
                      onClick={doActivate}
                      isLoading={activating}
                      disabled={state.steps.some((s) => s.key !== 'activate' && (s.status === 'Pending' || s.status === 'Current'))}
                      icon={PartyPopper}
                    >
                      Activate Merchant & Send Welcome
                    </ATMButton>
                  </div>
                </>
              )}
            </WizardStepCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizardPage;
