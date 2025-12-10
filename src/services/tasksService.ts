import {PersonalTask} from '../types/index';
import {apiService} from './api';
import {notificationsService} from './notificationsService';

export const tasksService = {
  getAll: async (): Promise<PersonalTask[]> => {
    // TODO: Replace with actual API call
    // return apiService.get<PersonalTask[]>('/tasks');
    return [];
  },

  getById: async (id: string): Promise<PersonalTask> => {
    // TODO: Replace with actual API call
    // return apiService.get<PersonalTask>(`/tasks/${id}`);
    throw new Error('Not implemented');
  },

  create: async (task: Omit<PersonalTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonalTask> => {
    // TODO: Replace with actual API call
    // const newTask = await apiService.post<PersonalTask>('/tasks', task);
    const newTask: PersonalTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Schedule notification
    if (!task.completed && task.dueDate) {
      const notificationId = await notificationsService.scheduleTaskNotification(newTask);
      newTask.notificationId = notificationId;
    }

    return newTask;
  },

  update: async (id: string, task: Partial<PersonalTask>): Promise<PersonalTask> => {
    // TODO: Replace with actual API call
    // const updatedTask = await apiService.put<PersonalTask>(`/tasks/${id}`, task);
    throw new Error('Not implemented');
  },

  delete: async (id: string, notificationId?: string): Promise<void> => {
    // TODO: Replace with actual API call
    // await apiService.delete<void>(`/tasks/${id}`);
    
    // Cancel notification if exists
    if (notificationId) {
      await notificationsService.cancelNotification(notificationId);
    }
  },

  markAsCompleted: async (id: string, completed: boolean): Promise<PersonalTask> => {
    // TODO: Replace with actual API call
    // return apiService.put<PersonalTask>(`/tasks/${id}`, {completed});
    throw new Error('Not implemented');
  },
};

