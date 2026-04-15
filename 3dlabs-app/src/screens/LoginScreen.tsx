import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { authService } from '../services/authService';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await authService.login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', 'Please check your email and password.');
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>3DLabs</Text>
      <Text style={styles.subtitle}>Internal Team App</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton label="Sign In" onPress={handleLogin} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', color: colors.primary },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.subtext, marginBottom: 20 },
  form: { gap: 10 },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10
  }
});
