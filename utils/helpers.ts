import { Currency } from '@/types';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const locale = currency === 'USD' ? 'en-US' : 'en-NG';
  const currencyCode = currency;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat().format(number);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('234')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return `+${cleaned}`;
};

export const parsePhoneNumber = (input: string): string => {
  return input.replace(/\D/g, '');
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = parsePhoneNumber(phoneNumber);
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const calculateSwapAmount = (
  amount: number,
  rate: number
): number => {
  return Number((amount * rate).toFixed(2));
};

export const getExchangeRate = (
  rates: any[],
  from: Currency,
  to: Currency
): number => {
  const rate = rates.find(r => r.from === from && r.to === to);
  return rate ? rate.rate : 1;
};
