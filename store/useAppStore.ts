import { ExchangeRate, SwapTransaction, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  user: User | null;
  exchangeRates: ExchangeRate[];
  transactions: SwapTransaction[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  
  setUser: (user: User) => void;
  updateUserVerification: (isVerified: boolean) => void;
  updateWalletBalances: (balances: { USD: number; NGN: number }) => void;
  setExchangeRates: (rates: ExchangeRate[]) => void;
  addTransaction: (transaction: SwapTransaction) => void;
  setLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

const initialExchangeRates: ExchangeRate[] = [
  {
    from: 'USD',
    to: 'NGN',
    rate: 1650,
    lastUpdated: new Date(),
  },
  {
    from: 'NGN',
    to: 'USD',
    rate: 0.000606,
    lastUpdated: new Date(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isDarkMode: false,
      exchangeRates: initialExchangeRates,
      transactions: [],
      isLoading: false,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateUserVerification: (isVerified: boolean) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, isVerified } });
        }
      },

      updateWalletBalances: (balances: { USD: number; NGN: number }) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { 
              ...currentUser, 
              wallets: { 
                USD: { balance: balances.USD },
                NGN: { balance: balances.NGN }
              }
            } 
          });
        }
      },

      setExchangeRates: (rates: ExchangeRate[]) => {
        set({ exchangeRates: rates });
      },

      addTransaction: (transaction: SwapTransaction) => {
        set((state) => ({ 
          transactions: [...state.transactions, transaction] 
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
