import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { useSchedule } from '../hooks/useLiveData';

export const ScheduleScreen = () => {
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const items = useSchedule(profile?.id, profile?.role === 'admin');

  const today = items.filter((item) => item.status !== 'cancelled').slice(0, 10);

  return (
    <Screen>
      <Card title="Today & Upcoming" subtitle="Tap any item for details">
        {today.map((item) => (
          <Pressable key={item.id} onPress={() => navigation.navigate('ScheduleDetail', { item })}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{`${item.date} ${item.startTime}`}</Text>
            </View>
          </Pressable>
        ))}
        {!today.length ? <Text>No schedule items yet.</Text> : null}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 10 },
  title: { fontWeight: '600' },
  meta: { opacity: 0.65 }
});
