export const CHANNEL_NEW_NOTIFICATION = 'notifications:newNotification';
export const DEFAULT_NOTIFICATION_LIMIT = 10;

export type Notification = {
  id: number;
  priority: Notification_Priority;
  title: string;
  user: string;
  message: string;
  origin: string;
  read: boolean;
  createdAt?: string;
};

export type NotificationId = Notification['id'];

export enum Notification_Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export type NotificationFetchOptions = {
  user: string;
  cursor?: number;
  limit?: number;
  read?: boolean;
  createdAfter?: string;
  origin?: string;
};
