import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { CtaBannerList } from './CtaBannerList';
import {
  useGetAdminCtaBannersQuery,
  useToggleActiveCtaBannerMutation,
  useDeleteCtaBannerMutation,
} from '../Service/CtaBannerService';
import type { CtaBannerItem, CtaBannerFilter } from '../Model/CtaBannerTypes';

const DEFAULT_BANNERS: CtaBannerItem[] = [
  {
    ctaBannerId: 'b1a10001-0000-0000-0000-000000000001',
    siteVariant: 'Enterprise',
    badge: 'RUN EVERY LOCATION FROM ONE PLATFORM',
    heading: 'Ready to Run Every Location From',
    headingAccent: 'One Unified Platform?',
    subheading:
      'Connect your POS terminals, inventory ledger, kitchen dispatch, and real-time sales across 1 to 500+ outlets. Zero migration risk with dedicated white-glove onboarding.',
    primaryCta: { label: 'Start 14-Day Free Trial', href: '/contact' },
    secondaryCta: { label: 'Book Enterprise Consultation', href: '/contact' },
    telemetryChips: [
      {
        id: 'offline-mesh',
        label: '100% Offline LAN Mesh',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
      {
        id: 'cloud-sync',
        label: 'Real-Time Cloud HQ Sync',
        dotColor: '#FF4F00',
        pingColor: '#FB923C',
      },
      {
        id: 'security',
        label: 'SOC-2 & PCI-DSS Certified',
        dotColor: '#3B82F6',
        pingColor: '#60A5FA',
      },
    ],
    trustBadges: [
      '14-Day Full Enterprise Access',
      'Zero Setup Fees or Hidden Costs',
      'Dedicated White-Glove Onboarding',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ctaBannerId: 'b1a10001-0000-0000-0000-000000000002',
    siteVariant: 'Restaurant',
    badge: 'RUN EVERY VENUE FROM ONE PLATFORM',
    heading: 'Ready to Run Every Dining Venue From',
    headingAccent: 'One Connected Platform?',
    subheading:
      'Connect your dining room POS terminals, tableside handhelds, KDS kitchen lines, and delivery apps across 1 to 100+ branches with zero service downtime.',
    primaryCta: { label: 'Start Free Trial', href: '/contact' },
    secondaryCta: { label: 'Talk to Hospitality Specialist', href: '/contact' },
    telemetryChips: [
      {
        id: 'offline-mesh',
        label: '100% Offline LAN Mesh',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
      {
        id: 'cloud-sync',
        label: 'Sub-Second KDS Ticket Sync',
        dotColor: '#FF4F00',
        pingColor: '#FB923C',
      },
      {
        id: 'security',
        label: 'PCI-DSS & Kitchen Certified',
        dotColor: '#F59E0B',
        pingColor: '#FBBF24',
      },
    ],
    trustBadges: [
      'Full Restaurant POS & KDS Access',
      'Zero Setup Fees or Hidden Costs',
      'Dedicated White-Glove Onboarding',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ctaBannerId: 'b1a10001-0000-0000-0000-000000000003',
    siteVariant: 'Retail',
    badge: 'RUN EVERY STORE FROM ONE PLATFORM',
    heading: 'Ready to Run Every Retail Store From',
    headingAccent: 'One Connected Platform?',
    subheading:
      'Connect your counter POS registers, barcode scanners, matrix stockrooms, and e-commerce pickup across 1 to 500+ outlets with zero sales downtime.',
    primaryCta: { label: 'Start Free Trial', href: '/contact' },
    secondaryCta: { label: 'Talk to Retail Specialist', href: '/contact' },
    telemetryChips: [
      {
        id: 'offline-mesh',
        label: '100% Offline Lane Resilience',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
      {
        id: 'cloud-sync',
        label: 'Sub-Second Barcode Catalog Sync',
        dotColor: '#FF4F00',
        pingColor: '#FB923C',
      },
      {
        id: 'security',
        label: 'PCI-DSS & Fiscal Certified',
        dotColor: '#F59E0B',
        pingColor: '#FBBF24',
      },
    ],
    trustBadges: [
      'Full Retail POS & Matrix Stock Access',
      'Zero Setup Fees or Hidden Costs',
      'Dedicated White-Glove Onboarding',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CtaBannerListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CtaBannerFilter>({
    siteVariant: 'all',
    status: 'ALL',
    searchQuery: '',
  });

  const [deletingItem, setDeletingItem] = useState<CtaBannerItem | null>(null);

  // RTK Query
  const { data: res, isLoading } = useGetAdminCtaBannersQuery(undefined);
  const [toggleActive] = useToggleActiveCtaBannerMutation();
  const [deleteBanner, deleteState] = useDeleteCtaBannerMutation();

  // Smart fallback: If backend API returned items, show them. If loading or empty, show default seed items.
  const allItems = useMemo(() => {
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return DEFAULT_BANNERS;
  }, [res?.data]);

  const handleFilterChange = (newFilter: Partial<CtaBannerFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const handleAddNew = () => {
    navigate('/content/cta-banner/new');
  };

  const handleOpenEdit = (item: CtaBannerItem) => {
    navigate(`/content/cta-banner/edit/${item.ctaBannerId}`);
  };

  const handleToggleActive = async (item: CtaBannerItem) => {
    try {
      await toggleActive(item.ctaBannerId).unwrap();
      toast.success(
        item.isActive
          ? `Final CTA for ${item.siteVariant} is now hidden from the website.`
          : `Final CTA for ${item.siteVariant} is now live on the website!`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteBanner(deletingItem.ctaBannerId).unwrap();
      toast.success('CTA Banner configuration deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete CTA Banner.');
    }
  };

  return (
    <>
      <CtaBannerList
        items={allItems}
        isLoading={isLoading && !allItems.length}
        filter={filter}
        onFilterChange={handleFilterChange}
        onAddNew={handleAddNew}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        title="Delete Final CTA Banner?"
        description={`Are you sure you want to delete the Final CTA configuration for "${deletingItem?.siteVariant} Website"? This will remove the conversion banner from the live storefront.`}
        confirmLabel="Yes, Delete Banner"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};
