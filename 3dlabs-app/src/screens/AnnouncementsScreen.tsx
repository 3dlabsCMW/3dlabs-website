import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAnnouncements } from '../hooks/useLiveData';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firestoreService';

export const AnnouncementsScreen = () => {
  const { profile } = useAuth();
  const announcements = useAnnouncements();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const post = async () => {
    if (!profile || !title.trim() || !message.trim()) return;
    await firestoreService.createAnnouncement({ title: title.trim(), message: message.trim(), createdBy: profile.id });
    setTitle('');
    setMessage('');
  };

  return (
    <Screen>
      {profile?.role === 'admin' ? (
        <Card title="Post Announcement">
          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.input, styles.message]} placeholder="Message" value={message} onChangeText={setMessage} multiline />
          <AppButton label="Post" onPress={post} />
        </Card>
      ) : null}

      <Card title="Latest Announcements">
        {announcements.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.message}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  message: { minHeight: 80, textAlignVertical: 'top' },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontWeight: '700' }
});
