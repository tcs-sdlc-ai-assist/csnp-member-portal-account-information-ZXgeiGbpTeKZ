import { describe, it, expect } from 'vitest';
import { maskPII, maskObjectForLog, PII_TYPES } from './piiMasking.js';

describe('piiMasking', () => {
  describe('maskPII', () => {
    describe('Name masking', () => {
      it('masks a name showing only the first letter', () => {
        expect(maskPII('John', PII_TYPES.NAME)).toBe('J***');
      });

      it('masks a full name showing only the first letter', () => {
        expect(maskPII('Jane Doe', PII_TYPES.NAME)).toBe('J***');
      });

      it('masks a single character name', () => {
        expect(maskPII('A', PII_TYPES.NAME)).toBe('A***');
      });

      it('trims whitespace before masking name', () => {
        expect(maskPII('  John  ', PII_TYPES.NAME)).toBe('J***');
      });
    });

    describe('Email masking', () => {
      it('masks an email showing first 2 chars and domain', () => {
        expect(maskPII('john@example.com', PII_TYPES.EMAIL)).toBe('jo***@example.com');
      });

      it('masks an email with a short local part', () => {
        expect(maskPII('ab@test.com', PII_TYPES.EMAIL)).toBe('ab***@test.com');
      });

      it('masks an email with a single char local part', () => {
        expect(maskPII('a@test.com', PII_TYPES.EMAIL)).toBe('a***@test.com');
      });

      it('returns *** for an email without @ symbol', () => {
        expect(maskPII('notanemail', PII_TYPES.EMAIL)).toBe('***');
      });

      it('masks jane.doe@email.com correctly', () => {
        expect(maskPII('jane.doe@email.com', PII_TYPES.EMAIL)).toBe('ja***@email.com');
      });
    });

    describe('Phone masking', () => {
      it('masks a phone number showing only last 4 digits', () => {
        expect(maskPII('555-123-4567', PII_TYPES.PHONE)).toBe('***-4567');
      });

      it('masks a phone number without dashes', () => {
        expect(maskPII('5551234567', PII_TYPES.PHONE)).toBe('***-4567');
      });

      it('masks a phone number with parentheses', () => {
        expect(maskPII('(555) 123-4567', PII_TYPES.PHONE)).toBe('***-4567');
      });

      it('masks a short phone number', () => {
        expect(maskPII('1234', PII_TYPES.PHONE)).toBe('***-1234');
      });

      it('masks a phone number with fewer than 4 digits', () => {
        expect(maskPII('123', PII_TYPES.PHONE)).toBe('***-123');
      });

      it('masks 555-1234 correctly', () => {
        expect(maskPII('555-1234', PII_TYPES.PHONE)).toBe('***-1234');
      });
    });

    describe('Address masking', () => {
      it('masks an address showing only the last word', () => {
        expect(maskPII('123 Main Street', PII_TYPES.ADDRESS)).toBe('*** Street');
      });

      it('masks a full address showing only the last word', () => {
        expect(maskPII('123 Main St, Springfield, IL 62701', PII_TYPES.ADDRESS)).toBe('*** 62701');
      });

      it('masks a single word address', () => {
        expect(maskPII('Springfield', PII_TYPES.ADDRESS)).toBe('*** Springfield');
      });

      it('masks 456 Oak Ave, Springfield, IL 62702 correctly', () => {
        expect(maskPII('456 Oak Ave, Springfield, IL 62702', PII_TYPES.ADDRESS)).toBe('*** 62702');
      });
    });

    describe('MemberId masking', () => {
      it('masks a member ID showing only last 3 chars', () => {
        expect(maskPII('M1234567', PII_TYPES.MEMBER_ID)).toBe('M***567');
      });

      it('masks a short member ID', () => {
        expect(maskPII('M12', PII_TYPES.MEMBER_ID)).toBe('M***12');
      });

      it('masks a 3-char member ID', () => {
        expect(maskPII('ABC', PII_TYPES.MEMBER_ID)).toBe('M***ABC');
      });

      it('masks M1234567 correctly', () => {
        expect(maskPII('M1234567', PII_TYPES.MEMBER_ID)).toBe('M***567');
      });
    });

    describe('Edge cases', () => {
      it('returns [REDACTED] for null value', () => {
        expect(maskPII(null, PII_TYPES.NAME)).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for undefined value', () => {
        expect(maskPII(undefined, PII_TYPES.EMAIL)).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for empty string', () => {
        expect(maskPII('', PII_TYPES.PHONE)).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for whitespace-only string', () => {
        expect(maskPII('   ', PII_TYPES.ADDRESS)).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for unknown PII type', () => {
        expect(maskPII('some value', 'UnknownType')).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for null type', () => {
        expect(maskPII('some value', null)).toBe('[REDACTED]');
      });

      it('returns [REDACTED] for undefined type', () => {
        expect(maskPII('some value', undefined)).toBe('[REDACTED]');
      });

      it('handles numeric value by converting to string', () => {
        expect(maskPII(5551234567, PII_TYPES.PHONE)).toBe('***-4567');
      });
    });
  });

  describe('maskObjectForLog', () => {
    it('masks all known PII fields in a flat object', () => {
      const obj = {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '555-1234',
        address: '123 Main St, Springfield, IL 62701',
        memberId: 'M1234567',
      };

      const masked = maskObjectForLog(obj);

      expect(masked.name).toBe('J***');
      expect(masked.email).toBe('ja***@email.com');
      expect(masked.phone).toBe('***-1234');
      expect(masked.address).toBe('*** 62701');
      expect(masked.memberId).toBe('M***567');
    });

    it('preserves non-PII fields as-is', () => {
      const obj = {
        name: 'Jane Doe',
        isActive: true,
        count: 42,
        role: 'member',
      };

      const masked = maskObjectForLog(obj);

      expect(masked.name).toBe('J***');
      expect(masked.isActive).toBe(true);
      expect(masked.count).toBe(42);
      expect(masked.role).toBe('member');
    });

    it('processes nested objects recursively', () => {
      const obj = {
        user: {
          name: 'John Smith',
          email: 'john@test.com',
        },
        settings: {
          theme: 'dark',
        },
      };

      const masked = maskObjectForLog(obj);

      expect(masked.user.name).toBe('J***');
      expect(masked.user.email).toBe('jo***@test.com');
      expect(masked.settings.theme).toBe('dark');
    });

    it('processes arrays element-by-element', () => {
      const arr = [
        { name: 'Jane Doe', email: 'jane@test.com' },
        { name: 'John Smith', email: 'john@test.com' },
      ];

      const masked = maskObjectForLog(arr);

      expect(Array.isArray(masked)).toBe(true);
      expect(masked.length).toBe(2);
      expect(masked[0].name).toBe('J***');
      expect(masked[0].email).toBe('ja***@test.com');
      expect(masked[1].name).toBe('J***');
      expect(masked[1].email).toBe('jo***@test.com');
    });

    it('returns null for null input', () => {
      expect(maskObjectForLog(null)).toBeNull();
    });

    it('returns undefined for undefined input', () => {
      expect(maskObjectForLog(undefined)).toBeUndefined();
    });

    it('returns primitive values as-is', () => {
      expect(maskObjectForLog('hello')).toBe('hello');
      expect(maskObjectForLog(42)).toBe(42);
      expect(maskObjectForLog(true)).toBe(true);
    });

    it('handles an empty object', () => {
      const masked = maskObjectForLog({});
      expect(masked).toEqual({});
    });

    it('handles an empty array', () => {
      const masked = maskObjectForLog([]);
      expect(masked).toEqual([]);
    });

    it('detects camelCase PII field names', () => {
      const obj = {
        firstName: 'Jane',
        lastName: 'Doe',
        emailAddress: 'jane@test.com',
        phoneNumber: '5551234567',
        streetAddress: '123 Main St',
      };

      const masked = maskObjectForLog(obj);

      expect(masked.firstName).toBe('J***');
      expect(masked.lastName).toBe('D***');
      expect(masked.emailAddress).toBe('ja***@test.com');
      expect(masked.phoneNumber).toBe('***-4567');
      expect(masked.streetAddress).toBe('*** St');
    });

    it('detects snake_case PII field names', () => {
      const obj = {
        first_name: 'Jane',
        last_name: 'Doe',
        email_address: 'jane@test.com',
        phone_number: '5551234567',
        member_id: 'M1234567',
      };

      const masked = maskObjectForLog(obj);

      expect(masked.first_name).toBe('J***');
      expect(masked.last_name).toBe('D***');
      expect(masked.email_address).toBe('ja***@test.com');
      expect(masked.phone_number).toBe('***-4567');
      expect(masked.member_id).toBe('M***567');
    });

    it('does not mask non-PII fields that happen to contain string values', () => {
      const obj = {
        category: 'Coverage Info',
        channel: 'Email',
        enabled: true,
      };

      const masked = maskObjectForLog(obj);

      expect(masked.category).toBe('Coverage Info');
      expect(masked.channel).toBe('Email');
      expect(masked.enabled).toBe(true);
    });

    it('handles deeply nested structures', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              name: 'Deep Name',
              email: 'deep@test.com',
            },
          },
        },
      };

      const masked = maskObjectForLog(obj);

      expect(masked.level1.level2.level3.name).toBe('D***');
      expect(masked.level1.level2.level3.email).toBe('de***@test.com');
    });

    it('handles objects with null field values', () => {
      const obj = {
        name: null,
        email: 'jane@test.com',
        phone: null,
      };

      const masked = maskObjectForLog(obj);

      expect(masked.name).toBeNull();
      expect(masked.email).toBe('ja***@test.com');
      expect(masked.phone).toBeNull();
    });

    it('handles objects with boolean PII-named fields without masking them', () => {
      const obj = {
        name: 'Jane',
        email: true,
      };

      const masked = maskObjectForLog(obj);

      expect(masked.name).toBe('J***');
      // boolean values are not strings or numbers, so they should not be masked
      expect(masked.email).toBe(true);
    });

    it('masks numeric values in PII fields', () => {
      const obj = {
        phone: 5551234567,
      };

      const masked = maskObjectForLog(obj);

      expect(masked.phone).toBe('***-4567');
    });

    it('handles mixed arrays with objects and primitives', () => {
      const arr = [
        { name: 'Jane' },
        'plain string',
        42,
        null,
      ];

      const masked = maskObjectForLog(arr);

      expect(Array.isArray(masked)).toBe(true);
      expect(masked[0].name).toBe('J***');
      expect(masked[1]).toBe('plain string');
      expect(masked[2]).toBe(42);
      expect(masked[3]).toBeNull();
    });

    it('does not mutate the original object', () => {
      const obj = {
        name: 'Jane Doe',
        email: 'jane@test.com',
      };

      const masked = maskObjectForLog(obj);

      expect(obj.name).toBe('Jane Doe');
      expect(obj.email).toBe('jane@test.com');
      expect(masked.name).toBe('J***');
      expect(masked.email).toBe('ja***@test.com');
    });
  });
});