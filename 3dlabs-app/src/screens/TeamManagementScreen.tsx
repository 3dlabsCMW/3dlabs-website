import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useLiveData';
import { firestoreService } from '../services/firestoreService';
import { UserRole } from '../types';

export const TeamManagementScreen = () => {
  const { profile } = useAuth();
  const users = useUsers();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (profile?.role !== 'admin') {
    return (
      <Screen>
        <Card title="Access denied">
          <Text>Admin only.</Text>
        </Card>
      </Screen>
    );
  }

  const addUserStub = async () => {
    if (!name.trim() || !email.trim()) return;
    await firestoreService.createUser({
      name: name.trim(),
      email: email.trim(),
      role: 'team',
      status: 'active',
      phone: ''
    });
    setName('');
    setEmail('');
    Alert.alert('User record created', 'Now create this person in Firebase Auth and link with UID in production flow.');
  };

  const setRole = async (id: string, role: UserRole) => firestoreService.updateUser(id, { role });

  return (
    <Screen>
      <Card title="Add User (MVP quick flow)">
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <AppButton label="Add" onPress={addUserStub} />
      </Card>

      <Card title="Team Members">
        {users.map((u) => (
          <View key={u.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.name}</Text>
              <Text>{`${u.email} • ${u.role} • ${u.status}`}</Text>
            </View>
            <View style={styles.actions}>
              <AppButton label={u.status === 'active' ? 'Deactivate' : 'Activate'} variant="secondary" onPress={() => firestoreService.updateUser(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} />
              <AppButton label={u.role === 'admin' ? 'Set Team' : 'Set Admin'} onPress={() => setRole(u.id, u.role === 'admin' ? 'team' : 'admin')} />
              <AppButton label="Remove" variant="danger" onPress={() => firestoreService.deleteUser(u.id)} />
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  row: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 10, gap: 10 },
  name: { fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }
});
