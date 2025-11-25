import {Reminder} from '@types/index';
import {apiService} from './api';
import {notificationsService} from './notificationsService';

export const remindersService = {
  getAll: async (companyId?: string): Promise<Reminder[]> => {
    // TODO: Replace with actual API call
    // const endpoint = companyId ? `/reminders?companyId=${companyId}` : '/reminders';
    // return apiService.get<Reminder[]>(endpoint);
    return [];
  },

  getById: async (id: string): Promise<Reminder> => {
    // TODO: Replace with actual API call
    // return apiService.get<Reminder>(`/reminders/${id}`);
    throw new Error('Not implemented');
  },

  create: async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> => {
    // TODO: Replace with actual API call
    // const newReminder = await apiService.post<Reminder>('/reminders', reminder);
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Schedule notification
    if (!reminder.completed && reminder.dueDate) {
      const notificationId = await notificationsService.scheduleReminderNotification(newReminder);
      newReminder.notificationId = notificationId;
    }

    return newReminder;
  },

  update: async (id: string, reminder: Partial<Reminder>): Promise<Reminder> => {
    // TODO: Replace with actual API call
    // const updatedReminder = await apiService.put<Reminder>(`/reminders/${id}`, reminder);
    throw new Error('Not implemented');
  },

  delete: async (id: string, notificationId?: string): Promise<void> => {
    // TODO: Replace with actual API call
    // await apiService.delete<void>(`/reminders/${id}`);
    
    // Cancel notification if exists
    if (notificationId) {
      await notificationsService.cancelNotification(notificationId);
    }
  },

  markAsCompleted: async (id: string, completed: boolean): Promise<Reminder> => {
    // TODO: Replace with actual API call
    // return apiService.put<Reminder>(`/reminders/${id}`, {completed});
    throw new Error('Not implemented');
  },
};

