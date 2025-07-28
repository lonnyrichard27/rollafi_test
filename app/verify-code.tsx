import { Button } from '@/components/ui/Button';
import { formValidationRules } from '@/hooks/useFormValidation';
import { useAppStore } from '@/store/useAppStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

interface FormData {
  code: string;
}

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { setUser } = useAppStore();
  
  const { 
    control, 
    handleSubmit, 
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      code: '',
    }
  });
  
  const [isResending, setIsResending] = useState(false);

  const handleVerifyCode = async (data: FormData) => {
    if (data.code.length !== 4) {
      setError('code', { 
        type: 'validation', 
        message: 'Please enter the complete 4-digit code' 
      });
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (data.code.length === 4) {
        const mockUser = {
          id: '1',
          phoneNumber: phoneNumber!,
          isVerified: false,
          wallets: {
            USD: { balance: 1250.50 },
            NGN: { balance: 850000.75 }
          }
        };
        
        setUser(mockUser);
        router.replace('/(tabs)');
      } else {
        setError('code', { 
          type: 'api', 
          message: 'Invalid verification code' 
        });
      }
    } catch {
      setError('code', { 
        type: 'api', 
        message: 'Verification failed. Please try again.' 
      });
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      setError('code', { 
        type: 'api', 
        message: 'Failed to resend code. Please try again.' 
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneForDisplay = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneNumber}>{formatPhoneForDisplay(phoneNumber || '')}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="code"
            rules={formValidationRules.verificationCode}
            render={({ field: { onChange } }) => (
              <OtpInput
                numberOfDigits={4}
                onTextChange={(text) => onChange(text)}
                focusColor="#007AFF"
                disabled={isSubmitting}
                autoFocus={true}
                theme={{
                  containerStyle: {
                    width: '90%',
                    alignSelf: 'center',
                    marginBottom: 24,
                    gap: 12,
                  },
                  pinCodeContainerStyle: {
                    ...styles.pinCodeContainer,
                    height: 80,
                    width: 70,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  pinCodeTextStyle: styles.pinCodeText,
                  focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
                  filledPinCodeContainerStyle: styles.filledPinCodeContainer,
                }}
                onFilled={(code) => {
                  onChange(code);
                  if (code.length === 4) {
                    handleSubmit(handleVerifyCode)();
                  }
                }}
              />
            )}
          />

          {errors.code ? <Text style={styles.errorText}>{errors.code.message}</Text> : null}

          <Button
            title="Verify Code"
            onPress={handleSubmit(handleVerifyCode)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
              <Text style={[styles.resendLink, isResending && styles.resendLinkDisabled]}>
                {isResending ? 'Sending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to phone number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -100,
  },
  otpContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  resendLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  backButton: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  pinCodeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  focusedPinCodeContainer: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  filledPinCodeContainer: {
    backgroundColor: '#F2F2F7',
    borderColor: '#007AFF',
  },
});
