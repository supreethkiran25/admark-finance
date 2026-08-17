import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
import { X } from 'lucide-react';
import { colors } from '../../theme/colors';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}) => {
  if (!isOpen) return null;

  const maxWidth = size === 'xl' ? 980 : size === 'lg' ? 760 : size === 'sm' ? 420 : 540;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.dialog, { maxWidth }]}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={{ padding: 14 }}>
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
  },
  body: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bgSurfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
});
