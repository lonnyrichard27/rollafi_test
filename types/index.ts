export interface User {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  wallets: {
    USD: {
      balance: number;
    };
    NGN: {
      balance: number;
    };
  };
}

export interface ExchangeRate {
  from: 'USD' | 'NGN';
  to: 'USD' | 'NGN';
  rate: number;
  lastUpdated: Date;
}

export interface SwapTransaction {
  id: string;
  fromCurrency: 'USD' | 'NGN';
  toCurrency: 'USD' | 'NGN';
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export type Currency = 'USD' | 'NGN';

export interface InviteData {
  phoneNumber: string;
  inviterName?: string;
}
