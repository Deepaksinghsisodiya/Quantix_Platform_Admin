import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import {
  useGetWebhookSubscriptionsQuery,
  useCreateWebhookSubscriptionMutation,
  useUpdateWebhookSubscriptionMutation,
  useDeleteWebhookSubscriptionMutation,
  useRotateWebhookSecretMutation,
  useGetWebhookDeliveryLogsQuery,
  useRetryWebhookDeliveryMutation,
} from '../services/webhookApi';

import WebhookList from './WebhookList';

export const WebhookListWrapper: React.FC = () => {
  const [tab, setTab] = useState<'subscriptions' | 'deliveries'>('subscriptions');

  // Queries
  const { data: subsData, isLoading: isSubsLoading } = useGetWebhookSubscriptionsQuery(undefined);
  const { data: deliveriesData, isLoading: isDeliveriesLoading } = useGetWebhookDeliveryLogsQuery(
    { pageSize: 50 },
    { skip: tab !== 'deliveries' }
  );

  const subscriptions = subsData?.data ?? [];
  const deliveries = deliveriesData?.data ?? [];

  // Mutations
  const [createSubscription, { isLoading: isCreating }] = useCreateWebhookSubscriptionMutation();
  const [updateSubscription] = useUpdateWebhookSubscriptionMutation();
  const [deleteSubscription] = useDeleteWebhookSubscriptionMutation();
  const [rotateSecret] = useRotateWebhookSecretMutation();
  const [retryDelivery] = useRetryWebhookDeliveryMutation();

  // Handlers
  const handleToggleSubscription = async (id: string, isActive: boolean) => {
    try {
      await updateSubscription({ id, data: { isActive } }).unwrap();
      toast.success(isActive ? 'Subscription activated' : 'Subscription deactivated');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update status');
    }
  };

  const handleRotateSecret = async (id: string) => {
    try {
      const res = await rotateSecret(id).unwrap();
      window.prompt('Rotated secret (copy now):', res.data?.secret);
      toast.success('Secret rotated successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to rotate secret');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm('Soft-delete this subscription? It can be reviewed in audit history.')) {
      return;
    }
    try {
      await deleteSubscription(id).unwrap();
      toast.success('Subscription deleted');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete subscription');
    }
  };

  const handleRetryDelivery = async (id: string) => {
    try {
      await retryDelivery(id).unwrap();
      toast.success('Retry queued successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to retry delivery');
    }
  };

  // Formik for new subscription
  const formik = useFormik({
    initialValues: {
      eventType: '',
      webhookUrl: '',
      description: '',
    },
    validationSchema: Yup.object({
      eventType: Yup.string()
        .required('Event type is required')
        .min(3, 'Event type must be at least 3 characters'),
      webhookUrl: Yup.string()
        .required('Webhook URL is required')
        .url('Enter a valid URL')
        .test('is-https', 'Webhook URL must start with https://', (val) =>
          val ? val.startsWith('https://') : false
        ),
      description: Yup.string().max(250, 'Description is too long'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          eventType: values.eventType.trim(),
          webhookUrl: values.webhookUrl.trim(),
          description: values.description.trim() || undefined,
        };
        const res = await createSubscription(payload).unwrap();
        
        window.prompt('One-time secret (copy now):', res.data?.secret);
        toast.success('Subscription created successfully.');
        resetForm();
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Failed to create subscription');
      }
    },
  });

  return (
    <WebhookList
      tab={tab}
      onTabChange={setTab}
      subscriptions={subscriptions}
      isSubscriptionsLoading={isSubsLoading}
      deliveries={deliveries}
      isDeliveriesLoading={isDeliveriesLoading}
      onToggleSubscription={handleToggleSubscription}
      onRotateSecret={handleRotateSecret}
      onDeleteSubscription={handleDeleteSubscription}
      onRetryDelivery={handleRetryDelivery}
      formikProps={formik}
      isCreating={isCreating}
    />
  );
};

export default WebhookListWrapper;
