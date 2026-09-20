import React from 'react';
import { Form, type FormikProps } from 'formik';
import { Link } from 'react-router-dom';
import { AtSign, Lock, User, UserCheck, Shield } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { useBrandName } from '@/shared/hooks/useBrandName';

interface RegisterFormProps {
  formikProps: FormikProps<any>;
  isSubmitting: boolean;
  apiError?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formikProps,
  isSubmitting,
  apiError,
}) => {
  const brandName = useBrandName();
  const password: string = formikProps.values?.password ?? '';
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-accent-100 selection:text-accent-900 dark:bg-slate-950">
      {/* Premium Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-accent-300/30 to-indigo-400/10 rounded-full blur-[140px] dark:from-accent-900/20 dark:to-indigo-900/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-emerald-300/20 to-accent-400/10 rounded-full blur-[140px] dark:from-emerald-950/15 dark:to-accent-900/10 pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[30%] h-[30%] bg-purple-300/15 rounded-full blur-[120px] dark:bg-purple-900/5 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-[480px] animate-slide-up z-10">
        {/* Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 md:p-10 shadow-2xl backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-900/80 shadow-accent-500/5">
          {/* Logo / header */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 shadow-lg shadow-accent-500/20 transition-all duration-300 hover:scale-105">
              <span className="text-2xl font-black text-white tracking-tighter">Q</span>
            </div>
            <div className="text-center space-y-0.5">
              <h1 className="text-xl font-black tracking-tight text-surface-900 dark:text-surface-555">
                Create Account
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-surface-400 dark:text-surface-500">
                Join {brandName}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="transition-all duration-200">
            {apiError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300" role="alert">
                {apiError}
              </div>
            )}

            <Form className="flex flex-col gap-4" noValidate>
              
              {/* Names Row */}
              <div className="grid grid-cols-2 gap-3">
                <ATMInputField
                  name="firstName"
                  label="First Name"
                  placeholder="First"
                  required
                  icon={<User size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                />
                <ATMInputField
                  name="lastName"
                  label="Last Name"
                  placeholder="Last"
                  required
                  icon={<User size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                />
              </div>

              {/* Username */}
              <ATMInputField
                name="username"
                label="Username"
                placeholder="Choose a username"
                required
                icon={<UserCheck size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              {/* Email */}
              <ATMInputField
                name="email"
                label="Email Address"
                placeholder="name@company.com"
                type="email"
                required
                icon={<AtSign size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              {/* Password */}
              <div>
                <ATMInputField
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="At least 12 characters"
                  required
                  icon={<Lock size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                />
                <PasswordStrengthMeter password={password} minLength={12} />
              </div>

              {/* Confirm Password */}
              <ATMInputField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                required
                icon={<Lock size={16} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              {/* Register Button */}
              <ATMButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/10 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/20 mt-2"
              >
                Register
              </ATMButton>

              {/* Back to Login */}
              <div className="text-center mt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </span>
              </div>

            </Form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
