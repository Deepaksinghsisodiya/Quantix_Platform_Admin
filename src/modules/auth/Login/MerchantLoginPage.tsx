/**
 * MerchantLoginPage — 2026-09-21. Merchant-branded sign-in screen.
 * Uses the exact same form/schema/MFA flow as the admin login, but brands it
 * "Merchant Portal" and always lands a successful sign-in on /merchant/dashboard.
 */
import React from 'react';
import LoginFormWrapper from './LoginFormWrapper';

export const MerchantLoginPage: React.FC = () => {
  return <LoginFormWrapper variant="merchant" />;
};

export default MerchantLoginPage;