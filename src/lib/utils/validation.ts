import * as yup from 'yup';

// ---------------------------------------------------------------------------
// safeParse compatibility wrapper for Zod to Yup migration
// ---------------------------------------------------------------------------
function wrapYupSchema<T>(schema: yup.Schema<T>) {
  return {
    safeParse: (value: any): { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } => {
      try {
        const parsed = schema.validateSync(value, { abortEarly: false });
        return { success: true, data: parsed };
      } catch (err: any) {
        return {
          success: false,
          error: {
            issues: err.inner?.length
              ? err.inner.map((issue: any) => ({ message: issue.message }))
              : [{ message: err.message }],
          },
        };
      }
    },
    validateSync: (value: any) => schema.validateSync(value),
  };
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const emailSchema = wrapYupSchema(
  yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
);

/**
 * Phone schema — E.164 form: `+` followed by 6–15 digits, leading digit ≠ 0.
 * Round_16 audit H4: tightens the prior `min(6).max(20)` permissive variant.
 * Solution_Rules §20.6 (Phase 2) tracks the country-aware control upgrade for cloud apps;
 * until then this regex enforces canonical E.164 storage on every Platform-side form.
 */
export const phoneSchema = wrapYupSchema(
  yup
    .string()
    .required('Phone number is required')
    .matches(/^\+[1-9]\d{6,14}$/, 'Invalid phone number — use international E.164 format (+CountryCodeNumber)')
);

export const businessNameSchema = wrapYupSchema(
  yup
    .string()
    .required('Business name must be at least 2 characters')
    .min(2, 'Business name must be at least 2 characters')
    .max(120, 'Business name must be at most 120 characters')
);

export const passwordSchema = wrapYupSchema(
  yup
    .string()
    .required('Password must be at least 8 characters')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one digit')
);

export const urlSchema = wrapYupSchema(
  yup
    .string()
    .required('Invalid URL')
    .url('Invalid URL')
);

// ---------------------------------------------------------------------------
// Validator functions — return { success, error? }
// ---------------------------------------------------------------------------

interface ValidationResult {
  readonly success: boolean;
  readonly error?: string;
}

function validate(schema: ReturnType<typeof wrapYupSchema>, value: string): ValidationResult {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error.issues[0]?.message };
}

export function validateEmail(value: string): ValidationResult {
  return validate(emailSchema, value);
}

export function validatePhone(value: string): ValidationResult {
  return validate(phoneSchema, value);
}

export function validateBusinessName(value: string): ValidationResult {
  return validate(businessNameSchema, value);
}

export function validatePassword(value: string): ValidationResult {
  return validate(passwordSchema, value);
}

export function validateUrl(value: string): ValidationResult {
  return validate(urlSchema, value);
}
