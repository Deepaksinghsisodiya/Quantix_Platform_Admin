import React from 'react';
import { Form, Field, useFormikContext } from 'formik';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  KeyRound,
  CheckCircle2,
  Copy,
  Download,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MfaSetupFormProps {
  step: number;
  setStep: (step: number) => void;
  secret: string;
  totpUri: string;
  backupCodes: readonly string[];
  setupError: string | null;
  errorMessage: string;
  clearErrorMessage: () => void;
  isSubmitting: boolean;
  onCopySecret: () => void;
  onCopyBackupCodes: () => void;
  onDownloadBackupCodes: () => void;
  onComplete: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Step Indicator Component                                                  */
/* -------------------------------------------------------------------------- */
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const labels = ['Overview', 'Scan QR', 'Verify', 'Backup'];

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;

        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  isComplete
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 dark:bg-brand-500'
                    : isActive
                      ? 'border-2 border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300 scale-105'
                      : 'border border-surface-200 bg-surface-50 text-surface-400 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-500',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4.5 w-4.5" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wider',
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : isComplete
                      ? 'text-brand-500 dark:text-brand-500'
                      : 'text-surface-400 dark:text-surface-500',
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'mb-5 h-0.5 w-6 sm:w-8 rounded-full transition-colors duration-300',
                  stepNum < currentStep
                    ? 'bg-brand-600 dark:bg-brand-500'
                    : 'bg-surface-200 dark:bg-surface-800',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export const MfaSetupForm: React.FC<MfaSetupFormProps> = ({
  step,
  setStep,
  secret,
  totpUri,
  backupCodes,
  setupError,
  errorMessage,
  clearErrorMessage,
  isSubmitting,
  onCopySecret,
  onCopyBackupCodes,
  onDownloadBackupCodes,
  onComplete,
}) => {
  // Access Formik context when step === 3
  const formik = useFormikContext<any>();

  /* ---- Error Alert ---- */
  function renderError(msg: string) {
    if (!msg) return null;
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-200/60 bg-red-50/80 p-3.5 text-xs font-semibold text-red-800 backdrop-blur-sm animate-fade-in shadow-sm"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{msg}</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-brand-100 selection:text-brand-900 dark:bg-slate-950">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-brand-300/30 to-indigo-400/10 rounded-full blur-[140px] dark:from-brand-900/20 dark:to-indigo-900/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-emerald-300/20 to-brand-400/10 rounded-full blur-[140px] dark:from-emerald-950/15 dark:to-brand-900/10 pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative w-full max-w-[460px] animate-slide-up z-10">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-900/80 shadow-brand-500/5">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-lg shadow-brand-500/20">
              <span className="text-xl font-black text-white tracking-tighter">Q</span>
            </div>
          </div>

          {/* Step indicators */}
          <div className="mb-10">
            <StepIndicator currentStep={step} totalSteps={4} />
          </div>

          {/* Page contents */}
          <div className="transition-all duration-200">
            {/* Step 1: Overview */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/40 shadow-sm">
                    <ShieldCheck className="h-7 w-7 text-brand-600 dark:text-brand-400 animate-pulse" />
                  </div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 mt-1">
                    Enable Two-Factor Security
                  </h2>
                  <p className="text-xs text-surface-400 dark:text-surface-550 leading-relaxed px-2">
                    MFA adds an extra layer of protection to your credentials. You will need an authenticator application.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: <Smartphone className="h-5 w-5" />,
                      title: 'Download Authenticator app',
                      desc: 'Install Google Authenticator, Authy, or Microsoft Authenticator.',
                    },
                    {
                      icon: <QrCode className="h-5 w-5" />,
                      title: 'Scan QR Code',
                      desc: 'Open the app and scan the QR barcode we generate.',
                    },
                    {
                      icon: <KeyRound className="h-5 w-5" />,
                      title: 'Enter Verification Code',
                      desc: 'Type the 6-digit authentication token to finalize setup.',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-2xl border border-surface-100 bg-surface-50/50 p-4 dark:border-surface-800/40 dark:bg-surface-900/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 shadow-sm border border-brand-100/20">
                        {item.icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-surface-800 dark:text-surface-100">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-surface-400 dark:text-surface-450 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] hover:shadow-xl"
                    onClick={() => setStep(2)}
                  >
                    Get Started
                  </button>
                  <p className="text-center text-[10px] font-bold text-surface-400 uppercase tracking-wide leading-relaxed">
                    MFA is mandatory. Complete enrollment to enter dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Scan QR */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
                    Scan the QR Code
                  </h2>
                  <p className="text-xs text-surface-400 dark:text-surface-550 leading-relaxed">
                    Scan this QR code with your authenticator app.
                  </p>
                </div>

                {renderError(setupError || '')}

                {/* QR code card */}
                <div className="flex justify-center">
                  <div className="rounded-[1.5rem] border border-surface-200/60 bg-white p-5 shadow-lg shadow-brand-500/5 dark:border-surface-800/40">
                    {totpUri ? (
                      <QRCodeSVG value={totpUri} size={170} level="M" />
                    ) : (
                      <div className="flex h-[170px] w-[170px] items-center justify-center text-xs font-semibold text-surface-400 animate-pulse">
                        Loading QR code...
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual entry key */}
                <div className="rounded-2xl border border-surface-150 bg-surface-50/50 p-4 dark:border-surface-800/40 dark:bg-surface-900/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400/80 mb-2">
                    Or Enter Key Manually
                  </p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 break-all rounded-lg bg-surface-100 border border-surface-200/50 px-3 py-1.5 font-mono text-[11px] text-surface-700 dark:bg-surface-850 dark:border-surface-700/30 dark:text-surface-200 select-all">
                      {secret || 'fetching_secret_key...'}
                    </code>
                    <button
                      type="button"
                      disabled={!secret}
                      className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-500 hover:bg-surface-100 hover:text-surface-800 dark:border-surface-850 dark:bg-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
                      onClick={onCopySecret}
                      title="Copy Key"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 font-bold text-xs uppercase tracking-wider dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 transition-all active:scale-[0.98]"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!secret}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/10 hover:shadow-xl hover:shadow-brand-500/20 transition-all active:scale-[0.98]"
                    onClick={() => setStep(3)}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Verify form inside Formik context */}
            {step === 3 && formik && (
              <Form className="flex flex-col gap-6 animate-fade-in" noValidate>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
                    Verify Your Code
                  </h2>
                  <p className="text-xs text-surface-400 dark:text-surface-550 leading-relaxed">
                    Verify connection by entering the code from your app.
                  </p>
                </div>

                {renderError(errorMessage)}

                <div className="flex flex-col items-center gap-2">
                  <Field
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className={cn(
                      'w-48 h-14 text-center text-3xl font-mono tracking-[0.4em] rounded-xl border border-surface-200 bg-surface-50/50 outline-none transition-all duration-300',
                      'focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/5 focus:shadow-sm',
                      'dark:border-surface-800 dark:bg-surface-900/50 dark:text-surface-100 dark:focus:border-brand-400 dark:focus:bg-surface-800',
                      formik.errors.code && formik.touched.code && 'border-danger focus:border-danger focus:ring-danger/5 dark:border-danger dark:focus:border-danger',
                    )}
                  />
                  {formik.errors.code && formik.touched.code && (
                    <p className="text-[11px] font-semibold text-danger px-1 animate-in fade-in slide-in-from-top-1">
                      {formik.errors.code as string}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 font-bold text-xs uppercase tracking-wider dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 transition-all active:scale-[0.98]"
                    onClick={() => {
                      setStep(2);
                      clearErrorMessage();
                      formik.resetForm();
                    }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/20 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:shadow-xl hover:shadow-brand-500/25"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Enable'
                    )}
                  </button>
                </div>
              </Form>
            )}

            {/* Step 4: Backup codes */}
            {step === 4 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 shadow-sm border border-emerald-100/25">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 mt-1">
                    Save Your Backup Codes
                  </h2>
                  <p className="text-xs text-surface-400 dark:text-surface-550 leading-relaxed px-2">
                    Use these one-time codes if you lose access to your authenticator app. Store them securely.
                  </p>
                </div>

                {/* Backup codes list */}
                <div className="rounded-2xl border border-surface-200/60 bg-surface-50/50 p-5 dark:border-surface-800/40 dark:bg-surface-900/50">
                  <div className="grid grid-cols-2 gap-3.5">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-xl border border-surface-100 bg-white px-3.5 py-2 font-mono text-[12px] font-bold text-surface-700 dark:border-surface-850 dark:bg-surface-900 dark:text-surface-300"
                      >
                        <span className="text-[10px] font-bold text-surface-400/80 select-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 font-bold text-xs uppercase tracking-wider dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 transition-all active:scale-[0.98]"
                    onClick={onCopyBackupCodes}
                  >
                    <Copy className="h-4 w-4" />
                    Copy All
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white text-surface-700 hover:bg-surface-50 font-bold text-xs uppercase tracking-wider dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 transition-all active:scale-[0.98]"
                    onClick={onDownloadBackupCodes}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>

                <button
                  type="button"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] hover:shadow-xl"
                  onClick={onComplete}
                >
                  Done — Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-surface-400/80 dark:text-surface-500/60">
          Quantix Platform v1.0.0-alpha
        </p>
      </div>
    </div>
  );
};

export default MfaSetupForm;
