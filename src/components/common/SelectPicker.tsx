import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react';
import { colors } from '../../theme/colors';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectPickerProps {
  label?: string;
  value: string;
  options: Array<string | SelectOption>;
  onChange: (val: string) => void;
  placeholder?: string;
  style?: any;
  required?: boolean;
}

export const SelectPicker: React.FC<SelectPickerProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  style,
  required,
}) => {
  const normalizedOptions: SelectOption[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: colors.debitText }}>*</Text>}
        </Text>
      )}
      <View style={styles.selectWrapper}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.bgSurfaceAlt,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 24,
            paddingTop: 5,
            paddingBottom: 5,
            fontSize: 11.5,
            fontFamily: 'Public Sans, sans-serif',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map(opt => (
            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#fff', color: '#0f172a' }}>
              {opt.label}
            </option>
          ))}
        </select>
        <View style={styles.chevronIcon} pointerEvents="none">
          <ChevronDown size={13} color={colors.textMuted} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    gap: 3,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  selectWrapper: {
    position: 'relative',
    height: 30,
    justifyContent: 'center',
  },
  chevronIcon: {
    position: 'absolute',
    right: 7,
    top: 8,
  },
});
