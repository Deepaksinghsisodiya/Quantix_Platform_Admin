import React from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import AdminDashboardWrapper from './admin/AdminDashboardWrapper';
import OperationsManagerDashboardWrapper from './operations-manager/OperationsManagerDashboardWrapper';
import FinanceManagerDashboardWrapper from './finance-manager/FinanceManagerDashboardWrapper';
import ContentManagerDashboardWrapper from './content-manager/ContentManagerDashboardWrapper';
import OperatorDashboardWrapper from './operator/OperatorDashboardWrapper';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  switch (user?.role) {
    case 'OperationsManager':
      return <OperationsManagerDashboardWrapper />;
    case 'FinanceManager':
      return <FinanceManagerDashboardWrapper />;
    case 'ContentManager':
      return <ContentManagerDashboardWrapper />;
    case 'Operator':
      return <OperatorDashboardWrapper />;
    case 'Admin':
    default:
      return <AdminDashboardWrapper />;
  }
};

export default DashboardPage;
