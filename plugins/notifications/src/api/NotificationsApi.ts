import { createApiRef } from '@backstage/core-plugin-api';
import {
  Notification,
  NotificationFetchOptions,
  UpdateStatusParams,
} from '@internal/backstage-plugin-notifications-common';

export const notificationsApiRef = createApiRef<NotificationsApi>({
  id: 'plugin.notifications.service',
});
export interface NotificationsApi {
  getNotifications(
    options?: Omit<NotificationFetchOptions, 'user'>,
  ): Promise<Notification[]>;
  updateStatus(params: UpdateStatusParams): Promise<void>;
  deleteNotifications(ids: number[]): Promise<void>;
}
