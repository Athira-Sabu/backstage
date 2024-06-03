import {createApiRef} from "@backstage/core-plugin-api";

export const notificationsApiRef = createApiRef<NotificationsApi>({
    id: 'plugin.notifications.service',
});
export interface NotificationsApi {
    getNotifications(): Promise<Notification[]>;
}
