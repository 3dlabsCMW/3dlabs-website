import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

interface Props {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Card = ({ title, subtitle, children }: Props) => (
  <View style={styles.card}>
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 13, color: colors.subtext }
});
