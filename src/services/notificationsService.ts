import notifee, {AndroidImportance, TriggerType} from '@notifee/react-native';
import {Reminder, PersonalTask} from '@types/index';
import {ENV} from '@config/env';

const CHANNEL_ID = 'mvpnotification-reminders';
const CHANNEL_NAME = 'MVP Notification Reminders';

class NotificationsService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized || !ENV.ENABLE_NOTIFICATIONS) {
      return;
    }

    try {
      // Request permissions
      await notifee.requestPermission();

      // Create Android channel
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: CHANNEL_NAME,
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async scheduleReminderNotification(reminder: Reminder): Promise<string> {
    await this.initialize();

    if (!reminder.dueDate) {
      throw new Error('Reminder must have a dueDate');
    }

    const dueDate = new Date(reminder.dueDate);
    const now = new Date();

    // Schedule notification 1 hour before due date
    const triggerDate = new Date(dueDate.getTime() - 60 * 60 * 1000);

    if (triggerDate <= now) {
      // If due date is less than 1 hour away, schedule for 5 minutes from now
      triggerDate.setTime(now.getTime() + 5 * 60 * 1000);
    }

    const notificationId = await notifee.createTriggerNotification(
      {
        title: `Reminder: ${reminder.title}`,
        body: reminder.description || `Due on ${dueDate.toLocaleDateString()}`,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      },
    );

    return notificationId;
  }

  async scheduleTaskNotification(task: PersonalTask): Promise<string> {
    await this.initialize();

    if (!task.dueDate) {
      throw new Error('Task must have a dueDate');
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    // Schedule notification 30 minutes before due date
    const triggerDate = new Date(dueDate.getTime() - 30 * 60 * 1000);

    if (triggerDate <= now) {
      // If due date is less than 30 minutes away, schedule for 5 minutes from now
      triggerDate.setTime(now.getTime() + 5 * 60 * 1000);
    }

    const notificationId = await notifee.createTriggerNotification(
      {
        title: `Task: ${task.title}`,
        body: task.description || `Due on ${dueDate.toLocaleDateString()}`,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      },
    );

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }
}

export const notificationsService = new NotificationsService();

