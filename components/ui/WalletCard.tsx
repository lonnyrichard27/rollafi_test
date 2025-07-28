import { useAppStore } from '@/store/useAppStore';
import { Currency } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { getTheme } from '@/utils/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WalletCardProps {
  currency: Currency;
  balance: number;
  onPress?: () => void;
}

export function WalletCard({ currency, balance, onPress }: WalletCardProps) {
  const { isDarkMode } = useAppStore();
  const theme = getTheme(isDarkMode);
  
  const getCurrencyColor = (currency: Currency) => {
    return currency === 'USD' ? '#34C759' : '#007AFF';
  };

  const getCurrencySymbol = (currency: Currency) => {
    return currency === 'USD' ? '$' : '₦';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: theme.surface,
          borderLeftColor: getCurrencyColor(currency) 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.currencyIcon, { backgroundColor: getCurrencyColor(currency) }]}>
          <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
        </View>
        <Text style={[styles.currencyCode, { color: theme.text }]}>{currency}</Text>
      </View>
      
      <Text style={[styles.balance, { color: theme.text }]}>{formatCurrency(balance, currency)}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Available Balance</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
  },
});
