import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMfaSetupRequired, selectCurrentUser } from '../slices/authSlice';
import { useLazySetupMfaQuery, useEnableMfaMutation } from '../services/authApi';
import MfaSetupForm from './MfaSetupForm';

const verifySchema = Yup.object().shape({
  code: Yup.string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code')
    .matches(/^\d{6}$/, 'Code must be 6 digits')
    .required('Enter the 6-digit code'),
});

export const MfaSetupWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [secret, setSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [backupCodes, setBackupCodes] = useState<readonly string[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);

  const [triggerSetup] = useLazySetupMfaQuery();
  const [enableMfaMutation, { isLoading: isSubmitting }] = useEnableMfaMutation();

  // Lazy-load the setup payload when the user advances past the overview step.
  useEffect(() => {
    if (step !== 2 || secret) return;
    
    triggerSetup()
      .unwrap()
      .then((res) => {
        const payload = res.data;
        if (!payload) {
          setSetupError('MFA setup failed: empty response.');
          return;
        }
        setSecret(payload.secret);
        setTotpUri(payload.qrCodeUri);
        setBackupCodes(payload.backupCodes);
      })
      .catch((err: any) => {
        setSetupError(err?.data?.message || err?.message || 'Failed to start MFA setup.');
      });
  }, [step, secret, triggerSetup]);

  const clearErrorMessage = () => {
    setErrorMessage('');
  };

  const handleVerify = async (values: any, { setSubmitting }: any) => {
    setErrorMessage('');
    try {
      await enableMfaMutation(values.code).unwrap();
      dispatch(setMfaSetupRequired(false));
      toast.success('Two-factor authentication enabled successfully.');
      setStep(4);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Verification failed.';
      setErrorMessage(msg.includes('INVALID_MFA_CODE')
        ? 'Invalid code. Please enter the code shown in your authenticator app.'
        : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopySecret = () => {
    void navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard');
  };

  const handleCopyBackupCodes = () => {
    void navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  const handleDownloadBackupCodes = () => {
    const content = [
      'Quantix Platform — Backup Recovery Codes',
      '==========================================',
      '',
      'Store these codes in a safe place. Each code can only be used once.',
      '',
      ...backupCodes.map((code, i) => `  ${String(i + 1).padStart(2, ' ')}. ${code}`),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantix-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded.');
  };

  const handleComplete = () => {
    const landing = user?.role === 'Merchant' ? '/merchant/dashboard' : '/dashboard';
    navigate(landing, { replace: true });
  };

  return (
    <Formik
      initialValues={{ code: '' }}
      validationSchema={verifySchema}
      onSubmit={handleVerify}
    >
      <MfaSetupForm
        step={step}
        setStep={setStep}
        secret={secret}
        totpUri={totpUri}
        backupCodes={backupCodes}
        setupError={setupError}
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        isSubmitting={isSubmitting}
        onCopySecret={handleCopySecret}
        onCopyBackupCodes={handleCopyBackupCodes}
        onDownloadBackupCodes={handleDownloadBackupCodes}
        onComplete={handleComplete}
      />
    </Formik>
  );
};

export default MfaSetupWrapper;
