import DepositModal from '@/components/custom/DepositModal';
import WithdrawModal from '@/components/custom/WithdrawModal';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/ui/WalletCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, getExchangeRate } from '@/utils/helpers';
import { getTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthGuard();
  const { 
    exchangeRates, 
    updateUserVerification,
    setLoading,
    isLoading,
    isDarkMode,
    toggleDarkMode,
    logout
  } = useAppStore();

  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const theme = getTheme(isDarkMode);

  if (!isAuthenticated || !user) {
    return null;
  }

    const handleStartKYC = () => {
    setShowKYCModal(true);
  };

  const handleKYCComplete = () => {
    updateUserVerification(true);
    setShowKYCModal(false);
    Alert.alert(
      'Verification Complete',
      'Your identity has been successfully verified! You can now access all features.',
      [{ text: 'OK' }]
    );
  };

  const handleCloseKYC = () => {
    updateUserVerification(true);
    setShowKYCModal(false);
    Alert.alert(
      'Verification Complete',
      'Your identity has been successfully verified! You can now access all features.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace('/invite-login');
  };

  const onRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const usdToNgnRate = getExchangeRate(exchangeRates, 'USD', 'NGN');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hello Richard! 👋</Text>
            <Text style={[styles.phoneNumber, { color: theme.textSecondary }]}>{user.phoneNumber}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={toggleDarkMode}
              style={[styles.headerButton, { backgroundColor: theme.surface }]}
            >
              <Ionicons 
                name={isDarkMode ? 'sunny' : 'moon'} 
                size={24} 
                color={theme.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout}
              style={[styles.headerButton, { backgroundColor: theme.surface }]}
            >
              <Ionicons 
                name="power" 
                size={24} 
                color={theme.error} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Exchange Rate Display */}
        <View style={[styles.rateContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.rateLabel, { color: theme.textSecondary }]}>Current Rate</Text>
          <Text style={[styles.rateValue, { color: theme.primary }]}>
            1 USD = {formatCurrency(usdToNgnRate, 'NGN')}
          </Text>
          <Text style={[styles.rateTime, { color: theme.textSecondary }]}>
            Last updated: {exchangeRates[0]?.lastUpdated ? 
              (exchangeRates[0].lastUpdated instanceof Date ? 
                exchangeRates[0].lastUpdated.toLocaleTimeString() : 
                new Date(exchangeRates[0].lastUpdated).toLocaleTimeString()
              ) : 'Unknown'
            }
          </Text>
        </View>

        {/* Quick Actions */}
        {user.isVerified && (
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => user.isVerified ? setShowDepositModal(true) : setShowKYCModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => user.isVerified ? setShowWithdrawModal(true) : setShowKYCModal(true)}
          >
            <Ionicons name="remove-circle-outline" size={24} color={theme.primary} />
            <Text style={[styles.quickActionText, { color: theme.text }]}>Withdraw</Text>
          </TouchableOpacity>
        </View>
         )}

        {/* Wallet Cards */}
        <View style={styles.walletsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Wallets</Text>
          
          <WalletCard
            currency="USD"
            balance={user.wallets.USD.balance}
            onPress={() => console.log('USD wallet pressed')}
          />
          
          <WalletCard
            currency="NGN"
            balance={user.wallets.NGN.balance}
            onPress={() => console.log('NGN wallet pressed')}
          />
        </View>

        {/* KYC Status */}
        {!user.isVerified && (
          <View style={[styles.kycContainer, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]}>
            <Text style={[styles.kycTitle, { color: theme.text }]}>Verify Your Identity</Text>
            <Text style={[styles.kycDescription, { color: theme.textSecondary }]}>
              Complete KYC verification to unlock all features including deposits and withdrawals.
            </Text>
            <Button
              title="Start Verification"
              onPress={handleStartKYC}
              style={styles.kycButton}
            />
          </View>
        )}

      </ScrollView>

      {/* KYC Modal */}
      <Modal
        visible={showKYCModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.webViewContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.webViewHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <TouchableOpacity 
              onPress={handleCloseKYC} 
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: theme.primary }]}>Close</Text>
            </TouchableOpacity>
            <Text style={[styles.webViewTitle, { color: theme.text }]}>Identity Verification</Text>
            <TouchableOpacity 
              onPress={handleKYCComplete} 
              style={styles.closeButton}
            >
              <Text style={[styles.closeButtonText, { color: theme.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{
              html: `
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        padding: 20px; 
                        background-color: ${isDarkMode ? '#1C1C1E' : '#F2F2F7'};
                        color: ${isDarkMode ? '#FFFFFF' : '#1C1C1E'};
                      }
                      .container { max-width: 400px; margin: 0 auto; }
                      .step { 
                        background: ${isDarkMode ? '#2C2C2E' : '#FFFFFF'}; 
                        padding: 20px; 
                        margin: 10px 0; 
                        border-radius: 12px; 
                        border-left: 4px solid #007AFF; 
                      }
                      .step h3 { margin-top: 0; color: #007AFF; }
                      .complete { background: #34C759; color: white; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h2>KYC Verification Process</h2>
                      <div class="step">
                        <h3>Step 1: Personal Information</h3>
                        <p>✅ Name, Date of Birth, Address verification</p>
                      </div>
                      <div class="step">
                        <h3>Step 2: Document Upload</h3>
                        <p>✅ Government-issued ID verification</p>
                      </div>
                      <div class="step">
                        <h3>Step 3: Selfie Verification</h3>
                        <p>✅ Liveness check completed</p>
                      </div>
                      <div class="complete">
                        <strong>✅ Verification Complete!</strong><br>
                        Your account is now fully verified.
                      </div>
                    </div>
                  </body>
                </html>
              ` 
            }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Deposit Modal */}
      <DepositModal 
        visible={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />

      {/* Withdraw Modal */}
      <WithdrawModal 
        visible={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
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
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggle: {
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
    shadowRadius: 4,
    elevation: 2,
  },
  rateContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rateLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rateTime: {
    fontSize: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  kycContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  kycTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kycDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  kycButton: {
    backgroundColor: '#FFC107',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  // WebView Modal Styles
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
});
