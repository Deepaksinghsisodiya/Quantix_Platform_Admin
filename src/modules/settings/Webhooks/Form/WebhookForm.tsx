import React from 'react';
import { FormikProps } from 'formik';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMButton } from '@/shared/ui/ATMButton';

interface WebhookFormValues {
  eventType: string;
  webhookUrl: string;
  description: string;
}

interface WebhookFormProps {
  formikProps: FormikProps<WebhookFormValues>;
  isSubmitting: boolean;
}

export const WebhookForm: React.FC<WebhookFormProps> = ({ formikProps, isSubmitting }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = formikProps;

  return (
    <ATMCard title="New Webhook Subscription" className="glass-card">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <ATMTextField
              name="eventType"
              label="Event Type"
              placeholder="e.g. merchant.created"
              value={values.eventType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.eventType ? errors.eventType : undefined}
            />
          </div>
          <div className="md:col-span-2">
            <ATMTextField
              name="webhookUrl"
              label="Webhook URL"
              placeholder="https://your.endpoint/webhook"
              value={values.webhookUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.webhookUrl ? errors.webhookUrl : undefined}
            />
          </div>
        </div>

        <div>
          <ATMTextField
            name="description"
            label="Description (Optional)"
            placeholder="Add a description for this webhook subscription"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
          />
        </div>

        <div className="flex justify-end pt-2">
          <ATMButton
            type="submit"
            variant="primary"
            size="md"
            className="w-full md:w-auto px-6"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Create Subscription
          </ATMButton>
        </div>
      </form>
    </ATMCard>
  );
};

export default WebhookForm;
