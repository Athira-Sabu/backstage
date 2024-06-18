import {
  NotificationFetchOptions,
  Notification,
  NotificationId,
  UpdateStatusParams,
} from '@internal/backstage-plugin-notifications-common';

export interface NotificationStoreInterface {
  getNotifications(options: NotificationFetchOptions): Promise<Notification[]>;
  saveNotification(notification: Notification): Promise<NotificationId>;
  updateStatus(updateParams: UpdateStatusParams): Promise<void>;
  deleteNotifications(ids: NotificationId[]): Promise<void>;
}
