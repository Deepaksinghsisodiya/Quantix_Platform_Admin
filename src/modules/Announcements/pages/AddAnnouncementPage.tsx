import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { AddAnnouncementWrapper } from '../Add/AddAnnouncementWrapper';

export const AddAnnouncementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteVariant = searchParams.get('siteVariant') || 'Enterprise';
  const defaultSortOrder = Number(searchParams.get('order') || '1');

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      <ATMPageHeader
        title="Add Announcement Banner"
        subtitle={`Create and configure a promotional top-strip announcement banner for the ${siteVariant} website.`}
        onBack={() => navigate('/content/announcements')}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content/marketing' },
          { label: 'Announcements', href: '/content/announcements' },
          { label: 'New Announcement' },
        ]}
      />

      <div className="bg-transparent">
        <AddAnnouncementWrapper
          siteVariant={siteVariant}
          defaultSortOrder={defaultSortOrder}
          onSuccess={() => navigate('/content/announcements')}
          onCancel={() => navigate('/content/announcements')}
        />
      </div>
    </div>
  );
};

export default AddAnnouncementPage;
