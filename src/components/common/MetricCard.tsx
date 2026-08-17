import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  badgeText?: string;
  badgeType?: 'credit' | 'debit' | 'pending' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  badgeText,
  badgeType = 'neutral',
}) => {
  let badgeBg = colors.bgSurfaceAlt;
  let badgeColor = colors.textMuted;
  let badgeBorder = colors.borderSubtle;

  if (badgeType === 'credit') {
    badgeBg = colors.creditBg;
    badgeColor = colors.creditText;
    badgeBorder = colors.creditBorder;
  } else if (badgeType === 'debit') {
    badgeBg = colors.debitBg;
    badgeColor = colors.debitText;
    badgeBorder = colors.debitBorder;
  } else if (badgeType === 'pending') {
    badgeBg = colors.pendingBg;
    badgeColor = colors.pendingText;
    badgeBorder = colors.pendingBorder;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.subContainer}>
        {badgeText && (
          <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        )}
        {subValue && <Text style={styles.subText}>{subValue}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create<any>({
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    padding: 10,
    flex: 1,
    minWidth: 180,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textPrimary,
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
  },
  subText: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
});
