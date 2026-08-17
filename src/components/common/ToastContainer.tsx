import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { colors } from '../../theme/colors';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container}>
      {toasts.map(toast => {
        let border = colors.borderDefault;
        let bg = colors.bgSurface;
        let icon = <Info size={16} color={colors.infoText} />;

        if (toast.type === 'success') {
          border = colors.creditBorder;
          bg = '#f0fdf4';
          icon = <CheckCircle2 size={16} color={colors.creditText} />;
        } else if (toast.type === 'error') {
          border = colors.debitBorder;
          bg = '#fef2f2';
          icon = <AlertCircle size={16} color={colors.debitText} />;
        } else if (toast.type === 'warning') {
          border = colors.pendingBorder;
          bg = '#fffbeb';
          icon = <AlertTriangle size={16} color={colors.pendingText} />;
        }

        return (
          <View
            key={toast.id}
            style={[styles.toast, { backgroundColor: bg, borderColor: border }]}
          >
            <View style={{ marginTop: 2 }}>{icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{toast.title}</Text>
              {toast.message && <Text style={styles.message}>{toast.message}</Text>}
            </View>
            <TouchableOpacity
              onPress={() => removeToast(toast.id)}
              style={styles.closeBtn}
            >
              <X size={12} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
    width: 360,
    maxWidth: '90%',
    gap: 8,
  },
  toast: {
    padding: 10,
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
  },
});
