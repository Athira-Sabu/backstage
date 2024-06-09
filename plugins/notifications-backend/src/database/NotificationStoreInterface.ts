import {
  NotificationFetchOptions,
  Notification,
  NotificationId,
} from '@internal/backstage-plugin-notifications-common';

export interface NotificationStoreInterface {
  getAll(options: NotificationFetchOptions): Promise<Notification[]>;
  insert(notification: Notification): Promise<NotificationId>;
  updateStatus(
    ids: NotificationId[],
    status: Notification['read'],
  ): Promise<void>;
  deleteAll(ids: NotificationId[]): Promise<void>;
}
