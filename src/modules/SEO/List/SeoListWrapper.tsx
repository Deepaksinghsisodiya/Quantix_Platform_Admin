import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { SeoList, SiteVariantTab } from './SeoList';
import {
  useGetAdminSeoListQuery,
  useSaveSeoMetadataMutation,
} from '../Service/SeoService';
import type { SaveSeoMetadataPayload } from '../Model/SeoTypes';

export const SeoListWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');

  // Queries & Mutations
  const { data: seoRes, isLoading, refetch } = useGetAdminSeoListQuery();
  const [saveSeoMetadata, { isLoading: isSaving }] = useSaveSeoMetadataMutation();

  const allItems = useMemo(() => seoRes?.data || [], [seoRes?.data]);

  // Dynamic counts for tabs
  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allItems.filter((b) => b.siteVariant === 'Enterprise').length,
      Restaurant: allItems.filter((b) => b.siteVariant === 'Restaurant').length,
      Retail: allItems.filter((b) => b.siteVariant === 'Retail').length,
    }),
    [allItems]
  );

  const handleSave = async (payload: SaveSeoMetadataPayload) => {
    try {
      await saveSeoMetadata(payload).unwrap();
      toast.success(
        `SEO Metadata successfully saved & published for ${payload.siteVariant} (${payload.pageSlug})!`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save SEO metadata.');
    }
  };

  return (
    <SeoList
      seoList={allItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      counts={counts}
      isLoading={isLoading}
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
};
