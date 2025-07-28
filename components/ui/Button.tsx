import { useAppStore } from '@/store/useAppStore';
import { getTheme } from '@/utils/theme';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { isDarkMode } = useAppStore();
  const theme = getTheme(isDarkMode);
  
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyle.push({ backgroundColor: theme.primary });
    } else if (variant === 'secondary') {
      baseStyle.push({ backgroundColor: theme.textSecondary });
    } else if (variant === 'outline') {
      baseStyle.push({ 
        backgroundColor: 'transparent',
        borderColor: theme.primary,
        borderWidth: 1
      });
    }
    
    if (disabled || loading) {
      baseStyle.push({ opacity: 0.6 });
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (variant === 'primary') {
      baseStyle.push({ color: '#FFFFFF' });
    } else if (variant === 'secondary') {
      baseStyle.push({ color: '#FFFFFF' });
    } else if (variant === 'outline') {
      baseStyle.push({ color: theme.primary });
    }
    
    if (disabled || loading) {
      baseStyle.push({ opacity: 0.6 });
    }
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
