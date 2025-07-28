import { useAppStore } from '@/store/useAppStore';
import { getTheme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  modalWidth?: number | string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  modalWidth,
}) => {
  const { isDarkMode } = useAppStore();
  const theme = getTheme(isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[
          styles.modalContainer, 
          { backgroundColor: theme.surface },
          modalWidth ? { width: modalWidth as any } : {}
        ]}>
          <View style={styles.header}>
            {title && (
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            )}
            {showCloseButton && (
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            )}
          </View>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalContainer: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 32,
    width: SCREEN_WIDTH - 40,
    maxWidth: 500,
    maxHeight: '90%',
    position: 'relative',
    alignItems: 'stretch',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom:20,
    alignItems: 'center'
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
});

export default CustomModal; 