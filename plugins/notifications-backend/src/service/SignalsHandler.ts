import {SignalsService} from "@backstage/plugin-signals-node";
import {Notification} from "@internal/backstage-plugin-notifications-common";
import {LoggerService} from "@backstage/backend-plugin-api";
import {CHANNEL_NEW_NOTIFICATION} from "@internal/backstage-plugin-notifications-common";

export const publishSignals = async (signals: SignalsService, notification: Notification, logger: LoggerService): Promise<void> => {
    try {
        await signals.publish<Notification>({
            recipients: {type: 'user', entityRef: [notification.user]},
            channel: CHANNEL_NEW_NOTIFICATION,
            message: notification,
        });
    } catch (e) {
        logger.error(`Failed to send signal: ${e}`);
    }
}
