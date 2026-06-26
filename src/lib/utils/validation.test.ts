import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  businessNameSchema,
  passwordSchema,
  urlSchema,
  validateEmail,
  validatePhone,
  validateBusinessName,
  validatePassword,
  validateUrl,
} from './validation';

describe('emailSchema', () => {
  it('accepts a valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects missing @ sign', () => {
    expect(emailSchema.safeParse('userexample.com').success).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(emailSchema.safeParse('user@').success).toBe(false);
  });
});

describe('phoneSchema', () => {
  it('accepts valid E.164 phone number', () => {
    expect(phoneSchema.safeParse('+14155551234').success).toBe(true);
  });

  it('accepts number without + prefix', () => {
    expect(phoneSchema.safeParse('14155551234').success).toBe(true);
  });

  it('rejects empty string', () => {
    expect(phoneSchema.safeParse('').success).toBe(false);
  });

  it('rejects too short number', () => {
    expect(phoneSchema.safeParse('+1234').success).toBe(false);
  });

  it('rejects leading zero', () => {
    expect(phoneSchema.safeParse('+0123456789').success).toBe(false);
  });

  it('rejects letters', () => {
    expect(phoneSchema.safeParse('+1415abc1234').success).toBe(false);
  });
});

describe('businessNameSchema', () => {
  it('accepts valid business name', () => {
    expect(businessNameSchema.safeParse('Acme Corp').success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    expect(businessNameSchema.safeParse('A').success).toBe(false);
  });

  it('rejects name longer than 120 characters', () => {
    const long = 'A'.repeat(121);
    expect(businessNameSchema.safeParse(long).success).toBe(false);
  });

  it('accepts exactly 2 characters', () => {
    expect(businessNameSchema.safeParse('AB').success).toBe(true);
  });

  it('accepts exactly 120 characters', () => {
    expect(businessNameSchema.safeParse('A'.repeat(120)).success).toBe(true);
  });
});

describe('passwordSchema', () => {
  it('accepts valid password', () => {
    expect(passwordSchema.safeParse('Passw0rd').success).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Pa1');
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = passwordSchema.safeParse('password1');
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase letter', () => {
    const result = passwordSchema.safeParse('PASSWORD1');
    expect(result.success).toBe(false);
  });

  it('rejects password without digit', () => {
    const result = passwordSchema.safeParse('Passwordd');
    expect(result.success).toBe(false);
  });

  it('accepts complex password', () => {
    expect(passwordSchema.safeParse('MyStr0ng!Pass').success).toBe(true);
  });
});

describe('urlSchema', () => {
  it('accepts valid URL', () => {
    expect(urlSchema.safeParse('https://example.com').success).toBe(true);
  });

  it('rejects invalid URL', () => {
    expect(urlSchema.safeParse('not-a-url').success).toBe(false);
  });
});

describe('validateEmail', () => {
  it('returns success for valid email', () => {
    expect(validateEmail('test@example.com')).toEqual({ success: true });
  });

  it('returns error for invalid email', () => {
    const result = validateEmail('bad');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('validatePhone', () => {
  it('returns success for valid phone', () => {
    expect(validatePhone('+14155551234')).toEqual({ success: true });
  });

  it('returns error for invalid phone', () => {
    const result = validatePhone('123');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('validateBusinessName', () => {
  it('returns success for valid name', () => {
    expect(validateBusinessName('Acme Corp')).toEqual({ success: true });
  });

  it('returns error for too short name', () => {
    const result = validateBusinessName('A');
    expect(result.success).toBe(false);
    expect(result.error).toContain('at least 2');
  });
});

describe('validatePassword', () => {
  it('returns success for valid password', () => {
    expect(validatePassword('Passw0rd')).toEqual({ success: true });
  });

  it('returns specific error for missing uppercase', () => {
    const result = validatePassword('password1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('uppercase');
  });

  it('returns specific error for too short', () => {
    const result = validatePassword('Pa1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('8 characters');
  });
});

describe('validateUrl', () => {
  it('returns success for valid URL', () => {
    expect(validateUrl('https://example.com')).toEqual({ success: true });
  });

  it('returns error for invalid URL', () => {
    const result = validateUrl('bad');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
