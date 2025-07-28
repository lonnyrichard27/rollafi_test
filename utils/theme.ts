export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  error: string;
  success: string;
  warning: string;
  overlay: string;
}

export const lightTheme: Theme = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  primary: '#007AFF',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme: Theme = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  primary: '#0A84FF',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
