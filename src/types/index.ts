export interface Company {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  recurrence?: RecurrencePattern;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
}

export interface CalendarEvent {
  id: string;
  companyId?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'tax' | 'meeting' | 'deadline' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalCompanies: number;
  pendingReminders: number;
  overdueReminders: number;
  upcomingReminders: number;
  totalPersonalTasks: number;
  completedPersonalTasks: number;
  upcomingEvents: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type FilterType = 'all' | 'pending' | 'overdue' | 'completed' | 'upcoming';

