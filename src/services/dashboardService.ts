import {DashboardMetrics} from '@types/index';
import {companiesService} from './companiesService';
import {remindersService} from './remindersService';
import {tasksService} from './tasksService';

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const [companies, reminders, tasks] = await Promise.all([
        companiesService.getAll(),
        remindersService.getAll(),
        tasksService.getAll(),
      ]);

      const now = new Date();
      const pendingReminders = reminders.filter(r => !r.completed);
      const overdueReminders = pendingReminders.filter(r => new Date(r.dueDate) < now);
      const upcomingReminders = pendingReminders.filter(
        r => {
          const dueDate = new Date(r.dueDate);
          const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff > 0 && daysDiff <= 7;
        }
      );

      const completedTasks = tasks.filter(t => t.completed);

      return {
        totalCompanies: companies.length,
        pendingReminders: pendingReminders.length,
        overdueReminders: overdueReminders.length,
        upcomingReminders: upcomingReminders.length,
        totalPersonalTasks: tasks.length,
        completedPersonalTasks: completedTasks.length,
        upcomingEvents: 0, // TODO: Calculate from calendar events
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {
        totalCompanies: 0,
        pendingReminders: 0,
        overdueReminders: 0,
        upcomingReminders: 0,
        totalPersonalTasks: 0,
        completedPersonalTasks: 0,
        upcomingEvents: 0,
      };
    }
  },
};

