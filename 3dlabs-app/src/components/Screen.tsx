import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export const Screen = ({ children, scroll = true, style }: Props) => {
  if (!scroll) {
    return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, style]}>{children}</ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 }
});
