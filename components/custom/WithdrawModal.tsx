import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { Currency } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { getTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomModal from './CustomModal';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
}

interface WithdrawFormData {
  amount: string;
  accountNumber: string;
  bankName: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ visible, onClose }) => {
  const { isDarkMode, user, updateWalletBalances } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const { 
    control, 
    handleSubmit, 
    setValue,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WithdrawFormData>({
    defaultValues: {
      amount: '',
      accountNumber: '',
      bankName: '',
      accountName: '',
      routingNumber: '',
      swiftCode: '',
    }
  });

  const watchAmount = watch('amount');
  const numericAmount = parseFloat(watchAmount) || 0;
  const currentBalance = user?.wallets[selectedCurrency].balance || 0;
  const hasInsufficientFunds = numericAmount > currentBalance;

  const handleMaxAmount = () => {
    setValue('amount', currentBalance.toString());
  };

  const handleWithdraw = async (data: WithdrawFormData) => {
    const amount = parseFloat(data.amount);
    
    if (amount <= 0) {
      setError('amount', { 
        type: 'validation', 
        message: 'Please enter a valid amount to withdraw.' 
      });
      return;
    }

    if (amount > currentBalance) {
      setError('amount', { 
        type: 'validation', 
        message: `You don't have enough ${selectedCurrency} to complete this withdrawal.` 
      });
      return;
    }

    if (selectedCurrency === 'USD' && !data.routingNumber) {
      setError('routingNumber', { 
        type: 'validation', 
        message: 'Routing number is required for USD withdrawals.' 
      });
      return;
    }


    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBalance = currentBalance - amount;
      updateWalletBalances({
        USD: selectedCurrency === 'USD' ? newBalance : user?.wallets.USD.balance || 0,
        NGN: selectedCurrency === 'NGN' ? newBalance : user?.wallets.NGN.balance || 0,
      });

      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of ${formatCurrency(amount, selectedCurrency)} has been processed. The funds will be transferred to your account within 1-3 business days.`,
        [{ text: 'OK', onPress: () => { reset(); onClose(); } }]
      );
    } catch {
      Alert.alert('Error', 'Failed to process withdrawal. Please try again.');
    }
  };

  const styles = getStyles(theme);

  return (
    <CustomModal visible={visible} onClose={onClose} title="Withdraw Funds">
      <View style={styles.container}>
        {/* Currency Selection */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Currency</Text>
        <View style={styles.currencyContainer}>
          {(['USD', 'NGN'] as const).map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyButton,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                selectedCurrency === currency && { 
                  backgroundColor: theme.primary + '20', 
                  borderColor: theme.primary 
                }
              ]}
              onPress={() => setSelectedCurrency(currency)}
            >
              <Text style={[
                styles.currencyText,
                { color: theme.text },
                selectedCurrency === currency && { color: theme.primary }
              ]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Balance */}
        <View style={[styles.balanceContainer, { backgroundColor: theme.surfaceSecondary }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: theme.text }]}>
            {formatCurrency(currentBalance, selectedCurrency)}
          </Text>
        </View>

        {/* Amount Input */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Withdrawal Amount</Text>
        <View style={styles.amountContainer}>
          <Input
            value={watch('amount')}
            onChangeText={value => setValue('amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            style={styles.amountInput}
            containerStyle={styles.inputWrapper}
          />
          <TouchableOpacity onPress={handleMaxAmount} style={[styles.maxButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
        
        {hasInsufficientFunds && numericAmount > 0 && (
          <Text style={[styles.errorText, { color: theme.error }]}>Insufficient funds</Text>
        )}

        {/* Account Details */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Bank Account Details</Text>
        
        <Input
          value={watch('accountName')}
          onChangeText={value => setValue('accountName', value)}
          placeholder="Account Holder Name"
          containerStyle={styles.inputContainer}
        />

        <Input
          value={watch('bankName')}
          onChangeText={value => setValue('bankName', value)}
          placeholder={selectedCurrency === 'USD' ? 'Bank Name (e.g., Chase Bank)' : 'Bank Name (e.g., GTBank)'}
          containerStyle={styles.inputContainer}
        />

        <Input
          value={watch('accountNumber')}
          onChangeText={value => setValue('accountNumber', value)}
          placeholder="Account Number"
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />

        {selectedCurrency === 'USD' && (
          <Input
            value={watch('routingNumber')}
            onChangeText={value => setValue('routingNumber', value)}
            placeholder="Routing Number"
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
        )}

        {/* Fees Info */}
        <View style={[styles.feeContainer, { backgroundColor: theme.surfaceSecondary }]}>
          <View style={styles.feeRow}>
            <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.feeText, { color: theme.textSecondary }]}>
              {selectedCurrency === 'USD' 
                ? 'Processing fee: $5.00 • Processing time: 1-3 business days'
                : 'Processing fee: ₦500 • Processing time: Within 24 hours'
              }
            </Text>
          </View>
        </View>

        {/* Withdraw Button */}
        <Button
          title="Confirm Withdrawal"
          onPress={handleSubmit(handleWithdraw)}
          disabled={
            !numericAmount ||
            numericAmount <= 0 ||
            hasInsufficientFunds ||
            !watch('accountNumber')
          }
          style={styles.withdrawButton}
        />
      </View>
    </CustomModal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'right',
  },
  maxButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  maxButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    marginTop: -15,
  },
  inputContainer: {
    marginBottom: 0,
  },
  feeContainer: {
    padding: 12,
    borderRadius: 8,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  feeText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  withdrawButton: {
    marginTop: 10,
  },
});

export default WithdrawModal;
