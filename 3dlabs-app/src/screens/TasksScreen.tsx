import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useLiveData';
import { firestoreService } from '../services/firestoreService';
import { TaskStatus } from '../types';

export const TasksScreen = () => {
  const tasks = useTasks();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [title, setTitle] = useState('');

  const visibleTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const createTask = async () => {
    if (!profile || !title.trim()) return;
    await firestoreService.createTask({
      title: title.trim(),
      description: '',
      dueDate: '',
      priority: 'medium',
      assignedUserIds: [],
      status: 'todo',
      createdBy: profile.id
    });
    setTitle('');
  };

  const updateStatus = async (id: string, current: TaskStatus) => {
    const next: TaskStatus = current === 'todo' ? 'in_progress' : current === 'in_progress' ? 'done' : 'todo';
    await firestoreService.updateTask(id, { status: next });
  };

  return (
    <Screen>
      {profile?.role === 'admin' ? (
        <Card title="Create Task">
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task title" />
          <AppButton label="Create" onPress={createTask} />
        </Card>
      ) : null}

      <Card title="Filters">
        <View style={styles.row}>
          {['all', 'todo', 'in_progress', 'done'].map((status) => (
            <Pressable key={status} onPress={() => setFilter(status as TaskStatus | 'all')}>
              <Text style={[styles.filter, filter === status && styles.selected]}>{status}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card title="Shared Tasks">
        {visibleTasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <Pressable onPress={() => updateStatus(task.id, task.status)} style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text>{`Status: ${task.status}`}</Text>
            </Pressable>
            {profile?.role === 'admin' ? (
              <AppButton
                label="Delete"
                variant="danger"
                onPress={() =>
                  Alert.alert('Delete Task', 'Delete permanently?', [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => firestoreService.deleteTask(task.id) }
                  ])
                }
              />
            ) : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  filter: { textTransform: 'capitalize', padding: 6 },
  selected: { fontWeight: '700', textDecorationLine: 'underline' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
  taskRow: { flexDirection: 'row', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  taskTitle: { fontWeight: '600' }
});
