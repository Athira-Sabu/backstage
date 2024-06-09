import { createApiRef } from '@backstage/core-plugin-api';
import {
  Notification,
  NotificationFetchOptions,
} from '@internal/backstage-plugin-notifications-common';

export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications.service',
});
export interface NotificationsApi {
  getNotifications(
    options?: Omit<NotificationFetchOptions, 'user'>,
  ): Promise<Notification[]>;
  updateStatus(ids: number[], status: boolean): Promise<void>;
  deleteNotifications(ids: number[]): Promise<void>;
}
