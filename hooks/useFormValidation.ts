import { validatePhoneNumber } from '@/utils/helpers';

export const formValidationRules = {
  phoneNumber: {
    required: 'Phone number is required',
    validate: (value: string) => validatePhoneNumber(value) || 'Please enter a valid phone number'
  },
  verificationCode: {
    required: 'Verification code is required',
    minLength: {
      value: 4,
      message: 'Please enter the complete 4-digit code'
    },
    maxLength: {
      value: 4,
      message: 'Verification code must be exactly 4 digits'
    },
    pattern: {
      value: /^\d{4}$/,
      message: 'Verification code must contain only numbers'
    }
  },
  amount: {
    required: 'Amount is required',
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Please enter a valid amount greater than 0';
      }
      return true;
    }
  },
  bankAccount: {
    required: 'Account number is required',
    minLength: {
      value: 10,
      message: 'Account number must be at least 10 digits'
    },
    pattern: {
      value: /^\d+$/,
      message: 'Account number must contain only numbers'
    }
  },
  bankName: {
    required: 'Bank name is required',
    minLength: {
      value: 2,
      message: 'Bank name must be at least 2 characters'
    }
  },
  accountName: {
    required: 'Account name is required',
    minLength: {
      value: 2,
      message: 'Account name must be at least 2 characters'
    }
  }
};

export type ValidationRuleKey = keyof typeof formValidationRules;
