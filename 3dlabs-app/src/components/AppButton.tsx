import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const AppButton = ({ label, onPress, variant = 'primary' }: Props) => (
  <Pressable style={[styles.button, styles[variant]]} onPress={onPress}>
    <Text style={[styles.label, variant !== 'secondary' && styles.lightLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  lightLabel: { color: 'white' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: '#E2E8F0' },
  danger: { backgroundColor: colors.danger }
});
