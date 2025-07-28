import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { formValidationRules } from '@/hooks/useFormValidation';
import { useAppStore } from '@/store/useAppStore';
import { Currency } from '@/types';
import { calculateSwapAmount, formatCurrency, getExchangeRate } from '@/utils/helpers';
import { getTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SwapFormData {
  amount: string;
}

export default function SwapScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthGuard();
  const { 
    exchangeRates,
    updateWalletBalances,
    isDarkMode
  } = useAppStore();

  const [fromCurrency, setFromCurrency] = useState<Currency>('USD');
  const [toCurrency, setToCurrency] = useState<Currency>('NGN');
  const [isProcessing, setIsProcessing] = useState(false);

  const { control, handleSubmit, formState: { isValid }, watch, setValue } = useForm<SwapFormData>({
    mode: 'onChange',
    defaultValues: {
      amount: ''
    }
  });

  const watchedAmount = watch('amount');
  const theme = getTheme(isDarkMode);

  if (!isAuthenticated || !user) {
    return null;
  }

  const rate = getExchangeRate(exchangeRates, fromCurrency, toCurrency);
  const numericAmount = parseFloat(watchedAmount) || 0;
  const convertedAmount = calculateSwapAmount(numericAmount, rate);
  
  const fromBalance = user.wallets[fromCurrency].balance;
  const toBalance = user.wallets[toCurrency].balance;
  
  const hasInsufficientFunds = numericAmount > fromBalance;

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setValue('amount', '');
  };

  const handleMaxAmount = () => {
    setValue('amount', fromBalance.toString());
  };

  const handleSwap = async (data: SwapFormData) => {
    const amount = parseFloat(data.amount);
    
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to swap.');
      return;
    }

    if (hasInsufficientFunds) {
      Alert.alert('Insufficient Funds', `You don't have enough ${fromCurrency} to complete this swap.`);
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFromBalance = fromBalance - amount;
      const newToBalance = toBalance + convertedAmount;
      
      updateWalletBalances({
        USD: fromCurrency === 'USD' ? newFromBalance : newToBalance,
        NGN: fromCurrency === 'NGN' ? newFromBalance : newToBalance,
      });

      Alert.alert(
        'Swap Successful!',
        `You have successfully swapped ${formatCurrency(amount, fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)}.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Currency Swap</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* From Currency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>From</Text>
          <View style={[styles.currencyContainer, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={handleSwapCurrencies}
            >
              <Text style={[styles.currencyCode, { color: theme.text }]}>{fromCurrency}</Text>
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name="amount"
                rules={formValidationRules.amount}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="0.00"
                    keyboardType="numeric"
                    style={styles.amountInput}
                    containerStyle={styles.inputWrapper}
                    error={error?.message}
                  />
                )}
              />
              <TouchableOpacity onPress={handleMaxAmount} style={[styles.maxButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
            Available: {formatCurrency(fromBalance, fromCurrency)}
          </Text>
          
          {hasInsufficientFunds && numericAmount > 0 && (
            <Text style={[styles.errorText, { color: theme.error }]}>Insufficient funds</Text>
          )}
        </View>

        {/* Swap Button */}
        <View style={styles.swapButtonContainer}>
          <TouchableOpacity onPress={handleSwapCurrencies} style={[styles.swapIconButton, { backgroundColor: theme.surface }]}>
            <Text style={[styles.swapIcon, { color: theme.primary }]}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* To Currency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>To</Text>
          <View style={[styles.currencyContainer, { backgroundColor: theme.surface }]}>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={handleSwapCurrencies}
            >
              <Text style={[styles.currencyCode, { color: theme.text }]}>{toCurrency}</Text>

            </TouchableOpacity>
            
            <View style={styles.convertedContainer}>
              <Text style={[styles.convertedAmount, { color: theme.text }]}>
                {formatCurrency(convertedAmount, toCurrency)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
            Balance: {formatCurrency(toBalance, toCurrency)}
          </Text>
        </View>


        <View style={[styles.rateContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.rateText, { color: theme.textSecondary }]}>
            1 {fromCurrency} = {formatCurrency(rate, toCurrency)}
          </Text>
        </View>


        <Button
          title={isProcessing ? 'Processing...' : 'Confirm Swap'}
          onPress={handleSubmit(handleSwap)}
          loading={isProcessing}
          disabled={!numericAmount || numericAmount <= 0 || hasInsufficientFunds || !isValid}
          style={styles.confirmButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currencySelector: {
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  maxButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  convertedContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  convertedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  swapIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  swapIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rateContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rateText: {
    fontSize: 16,
  },
  confirmButton: {
    marginTop: 30,
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
  },
});
