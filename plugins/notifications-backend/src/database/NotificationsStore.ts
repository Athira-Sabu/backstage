import {DatabaseService, LoggerService, resolvePackagePath} from "@backstage/backend-plugin-api";
import {Knex} from "knex";

import {Notification, NotificationFetchOptions, NotificationId} from "../types";
import {NotificationStoreInterface} from "./NotificationStoreInterface";

const migrationsDir = resolvePackagePath(
    '@internal/backstage-plugin-notifications-backend',
    'migrations',
);
const NOTIFICATION_TABLE = 'notification';

export class NotificationsStore implements NotificationStoreInterface {

    private constructor(private readonly client: Knex) {
    }

    static async create(database: DatabaseService, logger: LoggerService): Promise<NotificationsStore> {
        const client = await database.getClient();
        await client.migrate.latest({
            directory: migrationsDir,
        });

        logger.info('Migrations successfully ran for notifications plugin');
        return new NotificationsStore(client);
    }

    async getAll(options: NotificationFetchOptions): Promise<Notification[]> {
        let query = this.client(NOTIFICATION_TABLE)
            .select('*')
            .where('user', options.user);
        if (options.cursor) {
            query = query.where('id', '>', options.cursor);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.read !== undefined) {
            query = query.where('read', options.read);
        }

        if (options.createdAfter) {
            query = query.where('create_at', '>', options.createdAfter);
        }

        if (options.origin) {
            query = query.where('origin', options.origin);
        }

        return await query;
    }

    async insert(notification: Notification): Promise<NotificationId> {
       return await this.client(NOTIFICATION_TABLE).insert(notification).returning('id');
    }

    async updateStatus(ids: NotificationId[], status: Notification['read']): Promise<void> {
        await this.client(NOTIFICATION_TABLE).whereIn('id', ids).update('read', status);
    }

    async deleteAll(ids: NotificationId[]): Promise<void> {
        await this.client(NOTIFICATION_TABLE).whereIn('id', ids).delete();
    }
}
