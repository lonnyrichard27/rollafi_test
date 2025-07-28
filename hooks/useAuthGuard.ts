import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const useAuthGuard = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const isValidUser = isAuthenticated && !!user;

  useEffect(() => {
    if (!isValidUser) {
      router.replace('/invite-login');
    }
  }, [isAuthenticated, user, router, isValidUser]);

  return { 
    isAuthenticated: isValidUser, 
    user
  };
};
