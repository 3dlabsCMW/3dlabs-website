import { useEffect, useState } from 'react';

import { firestoreService } from '../services/firestoreService';
import { Announcement, AppUser, ScheduleItem, Task } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  useEffect(() => firestoreService.subscribeUsers(setUsers), []);
  return users;
};

export const useSchedule = (userId?: string, isAdmin = false) => {
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    const unsub = isAdmin
      ? firestoreService.subscribeAllSchedule(setItems)
      : firestoreService.subscribeSchedule(userId, setItems);
    return unsub;
  }, [userId, isAdmin]);

  return items;
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => firestoreService.subscribeTasks(setTasks), []);
  return tasks;
};

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  useEffect(() => firestoreService.subscribeAnnouncements(setAnnouncements), []);
  return announcements;
};
