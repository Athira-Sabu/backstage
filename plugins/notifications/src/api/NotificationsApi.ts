import {createApiRef} from "@backstage/core-plugin-api";
import {Notification, NotificationFetchOptions} from "../types";

export const notificationsApiRef = createApiRef<NotificationsApi>({
    id: 'plugin.notifications.service',
});
export interface NotificationsApi {
    getNotifications(options?: NotificationFetchOptions): Promise<Notification[]>;
}
