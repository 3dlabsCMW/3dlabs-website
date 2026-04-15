import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { db } from '../firebase/config';
import { Announcement, AppUser, ScheduleItem, Task } from '../types';

const withTimestamps = {
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

export const firestoreService = {
  subscribeUsers: (cb: (users: AppUser[]) => void) =>
    onSnapshot(query(collection(db, 'users'), orderBy('name', 'asc')), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, 'id'>) })));
    }),

  createUser: (data: Partial<AppUser>) => addDoc(collection(db, 'users'), { ...data, ...withTimestamps }),
  updateUser: (id: string, data: Partial<AppUser>) => updateDoc(doc(db, 'users', id), { ...data, updatedAt: serverTimestamp() }),
  deleteUser: (id: string) => deleteDoc(doc(db, 'users', id)),

  subscribeSchedule: (userId: string, cb: (items: ScheduleItem[]) => void) =>
    onSnapshot(
      query(
        collection(db, 'scheduleItems'),
        where('assignedUserIds', 'array-contains', userId),
        orderBy('date', 'asc')
      ),
      (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ScheduleItem, 'id'>) })));
      }
    ),

  subscribeAllSchedule: (cb: (items: ScheduleItem[]) => void) =>
    onSnapshot(query(collection(db, 'scheduleItems'), orderBy('date', 'asc')), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ScheduleItem, 'id'>) })));
    }),

  createScheduleItem: (data: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    addDoc(collection(db, 'scheduleItems'), { ...data, ...withTimestamps }),
  updateScheduleItem: (id: string, data: Partial<ScheduleItem>) =>
    updateDoc(doc(db, 'scheduleItems', id), { ...data, updatedAt: serverTimestamp() }),
  deleteScheduleItem: (id: string) => deleteDoc(doc(db, 'scheduleItems', id)),

  subscribeTasks: (cb: (tasks: Task[]) => void) =>
    onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) })));
    }),

  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => addDoc(collection(db, 'tasks'), { ...data, ...withTimestamps }),
  updateTask: (id: string, data: Partial<Task>) => updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() }),
  deleteTask: (id: string) => deleteDoc(doc(db, 'tasks', id)),

  subscribeAnnouncements: (cb: (items: Announcement[]) => void) =>
    onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) })));
    }),

  createAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) =>
    addDoc(collection(db, 'announcements'), { ...data, createdAt: serverTimestamp() })
};
