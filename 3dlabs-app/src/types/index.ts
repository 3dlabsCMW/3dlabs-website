export type UserRole = 'admin' | 'team';
export type UserStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleCategory = 'meeting' | 'job' | 'reminder' | 'deadline';
export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled';

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  assignedUserIds: string[];
  location?: string;
  category: ScheduleCategory;
  status: ScheduleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  assignedUserIds: string[];
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
}
