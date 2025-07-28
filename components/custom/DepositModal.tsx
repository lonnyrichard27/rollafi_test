import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formValidationRules } from '@/hooks/useFormValidation';
import { useAppStore } from '@/store/useAppStore';
import { Currency } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { getTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomModal from './CustomModal';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DepositFormData {
  amount: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ visible, onClose }) => {
  const { isDarkMode, user, updateWalletBalances } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const { control, handleSubmit, formState: { isValid }, reset, watch } = useForm<DepositFormData>({
    mode: 'onChange',
    defaultValues: {
      amount: ''
    }
  });

  const watchedAmount = watch('amount');

  const depositMethods = {
    USD: [
      { id: 'bank_transfer', name: 'Bank Transfer', icon: 'card-outline', description: 'Transfer from your US bank account' },
      { id: 'debit_card', name: 'Debit Card', icon: 'card', description: 'Instant deposit with your debit card' },
      { id: 'wire', name: 'Wire Transfer', icon: 'swap-horizontal', description: 'International wire transfer' },
    ],
    NGN: [
      { id: 'bank_transfer_ngn', name: 'Bank Transfer', icon: 'card-outline', description: 'Transfer from your Nigerian bank account' },
      { id: 'ussd', name: 'USSD Code', icon: 'phone-portrait', description: 'Use your bank\'s USSD code' },
      { id: 'card_ngn', name: 'Naira Card', icon: 'card', description: 'Use your Nigerian debit card' },
    ],
  };

  const handleDeposit = (data: DepositFormData) => {
    if (!selectedMethod) {
      Alert.alert('Select Method', 'Please select a deposit method to continue.');
      return;
    }

    const depositAmount = parseFloat(data.amount);

    // Mock deposit success
    Alert.alert(
      'Deposit Initiated',
      `Your ${selectedCurrency} deposit request for ${formatCurrency(depositAmount, selectedCurrency)} has been initiated. You will receive further instructions via email.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Add the deposited amount to user's wallet
            if (user) {
              const currentBalance = user.wallets[selectedCurrency].balance;
              updateWalletBalances({
                USD: selectedCurrency === 'USD' ? currentBalance + depositAmount : user.wallets.USD.balance,
                NGN: selectedCurrency === 'NGN' ? currentBalance + depositAmount : user.wallets.NGN.balance,
              });
            }
            reset();
            setSelectedMethod('');
            onClose();
          },
        },
      ]
    );
  };

  const styles = getStyles(theme);

  return (
    <CustomModal visible={visible} onClose={onClose} title="Deposit Funds">
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
              onPress={() => {
                setSelectedCurrency(currency);
                setSelectedMethod('');
              }}
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
            Current {selectedCurrency} Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: theme.text }]}>
            {user ? formatCurrency(user.wallets[selectedCurrency].balance, selectedCurrency) : '0.00'}
          </Text>
        </View>

        {/* Amount Input */}
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Deposit Amount</Text>
          <Controller
            control={control}
            name="amount"
            rules={formValidationRules.amount}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                placeholder={`Enter amount in ${selectedCurrency}`}
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={styles.amountInput}
                error={error?.message}
              />
            )}
          />
        </View>

        {/* Deposit Methods */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Deposit Method</Text>
        <View style={styles.methodsContainer}>
          {depositMethods[selectedCurrency].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedMethod === method.id && { 
                  backgroundColor: theme.primary + '10', 
                  borderColor: theme.primary 
                }
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodHeader}>
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedMethod === method.id ? theme.primary : theme.textSecondary} 
                />
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    { color: theme.text },
                    selectedMethod === method.id && { color: theme.primary }
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={[styles.methodDescription, { color: theme.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Deposit Button */}
        <Button
          title="Continue Deposit"
          onPress={handleSubmit(handleDeposit)}
          disabled={!selectedMethod || !isValid || !watchedAmount}
          style={styles.depositButton}
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
  amountInput: {
    marginTop: 8,
  },
  methodsContainer: {
    gap: 12,
  },
  methodButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 14,
  },
  depositButton: {
    marginTop: 10,
  },
});

export default DepositModal;
