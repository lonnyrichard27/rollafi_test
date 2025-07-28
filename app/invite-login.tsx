import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formValidationRules } from '@/hooks/useFormValidation';
import { validatePhoneNumber } from '@/utils/helpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface FormData {
  phoneNumber: string;
}

export default function InviteLoginScreen() {
  const router = useRouter();
  const { inviteCode, phone } = useLocalSearchParams<{ inviteCode?: string; phone?: string }>();
  
  const { 
    control, 
    handleSubmit, 
    setValue, 
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      phoneNumber: phone || '',
    }
  });

  useEffect(() => {
    if (inviteCode && phone) {
      setValue('phoneNumber', phone);
    }
  }, [inviteCode, phone, setValue]);

  const handleSendCode = async (data: FormData) => {
    if (!validatePhoneNumber(data.phoneNumber)) {
      setError('phoneNumber', { 
        type: 'validation', 
        message: 'Please enter a valid phone number' 
      });
      return;
    }
    
    try {
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, always succeed
      router.push({
        pathname: '/verify-code',
        params: { phoneNumber: data.phoneNumber },
      });
    } catch {
      setError('phoneNumber', { 
        type: 'api', 
        message: 'Failed to send verification code. Please try again.' 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to RollaFi</Text>
          <Text style={styles.subtitle}>
            {inviteCode 
              ? 'Complete your registration'
              : 'Enter your phone number to get started'
            }
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="phoneNumber"
            rules={formValidationRules.phoneNumber}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+234 XXX XXX XXXX"
                keyboardType="phone-pad"
                error={errors.phoneNumber?.message}
                maxLength={20}
              />
            )}
          />

          <Button
            title="Send Verification Code"
            onPress={handleSubmit(handleSendCode)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -100,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
});
