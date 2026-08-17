import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toLowerCase().trim();

  let bg = colors.neutralPillBg;
  let text = colors.neutralPillText;
  let border = colors.neutralPillBorder;

  if (
    norm === 'approved' ||
    norm === 'paid' ||
    norm === 'active' ||
    norm === 'reconciled' ||
    norm === 'matched' ||
    norm === 'auto-reconciled' ||
    norm === 'credit'
  ) {
    bg = colors.creditBg;
    text = colors.creditText;
    border = colors.creditBorder;
  } else if (
    norm === 'rejected' ||
    norm === 'overdue' ||
    norm === 'critical' ||
    norm === 'debit' ||
    norm === 'unmatched'
  ) {
    bg = colors.debitBg;
    text = colors.debitText;
    border = colors.debitBorder;
  } else if (
    norm === 'pending' ||
    norm === 'pending approval' ||
    norm === 'under review' ||
    norm === 'review' ||
    norm === 'scheduled' ||
    norm === 'warning' ||
    norm === 'conflict'
  ) {
    bg = colors.pendingBg;
    text = colors.pendingText;
    border = colors.pendingBorder;
  } else if (norm === 'draft' || norm === 'sent' || norm === 'info' || norm === 'submitted') {
    bg = colors.infoBg;
    text = colors.infoText;
    border = colors.infoBorder;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: text },
          isSmall && styles.badgeTextSm,
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Public Sans, IBM Plex Sans, sans-serif',
  },
  badgeTextSm: {
    fontSize: 10,
  },
});
