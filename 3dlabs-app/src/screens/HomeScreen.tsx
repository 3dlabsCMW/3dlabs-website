import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAnnouncements, useSchedule, useTasks } from '../hooks/useLiveData';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { formatDate, isDateToday } from '../utils/date';

export const HomeScreen = () => {
  const { profile } = useAuth();
  const schedule = useSchedule(profile?.id, profile?.role === 'admin');
  const tasks = useTasks();
  const announcements = useAnnouncements();

  const todaysItems = schedule.filter((item) => isDateToday(item.date)).slice(0, 3);
  const upcomingTasks = tasks.filter((task) => task.status !== 'done').slice(0, 3);
  const latestAnnouncement = announcements[0];

  return (
    <Screen>
      <Card title="Today’s Schedule" subtitle="Live shared team schedule">
        {todaysItems.length === 0 ? <Text style={styles.empty}>No items today.</Text> : null}
        {todaysItems.map((item) => (
          <Text key={item.id}>{`${item.startTime} • ${item.title}`}</Text>
        ))}
      </Card>

      <Card title="Upcoming Tasks" subtitle="Top open tasks">
        {upcomingTasks.length === 0 ? <Text style={styles.empty}>No open tasks.</Text> : null}
        {upcomingTasks.map((task) => (
          <Text key={task.id}>{`${task.title} (${task.priority})`}</Text>
        ))}
      </Card>

      <Card title="Latest Announcement">
        {latestAnnouncement ? (
          <>
            <Text style={styles.announcementTitle}>{latestAnnouncement.title}</Text>
            <Text>{latestAnnouncement.message}</Text>
            <Text style={styles.timestamp}>{formatDate(latestAnnouncement.createdAt)}</Text>
          </>
        ) : (
          <Text style={styles.empty}>No announcements yet.</Text>
        )}
      </Card>

      <Card title="Quick Actions">
        <AppButton label="Sign Out" onPress={() => authService.logout()} variant="secondary" />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  empty: { opacity: 0.6 },
  announcementTitle: { fontWeight: '600' },
  timestamp: { fontSize: 12, opacity: 0.6 }
});
