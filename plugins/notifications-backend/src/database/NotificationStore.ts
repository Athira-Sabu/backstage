import {
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';

import {
  Notification,
  NotificationFetchOptions,
  NotificationId,
} from '@internal/backstage-plugin-notifications-common';
import { NotificationStoreInterface } from './NotificationStoreInterface';
import { PluginDatabaseManager } from '@backstage/backend-common';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-notifications-backend',
  'migrations',
);
const NOTIFICATION_TABLE = 'notification';

export class NotificationStore implements NotificationStoreInterface {
  private constructor(private readonly client: Knex) {}

  static async create(
    database: PluginDatabaseManager,
    logger: LoggerService,
  ): Promise<NotificationStoreInterface> {
    const client = await database.getClient();
    await client.migrate.latest({
      directory: migrationsDir,
    });

    logger.info('Migrations successfully ran for notifications plugin');
    return new NotificationStore(client);
  }

  async getAll(options: NotificationFetchOptions): Promise<Notification[]> {
    let query = this.client(NOTIFICATION_TABLE)
      .select('*')
      .where('user', options.user);
    if (options.cursor) {
      query = query.where('id', '<', options.cursor);
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
    query.orderBy('id', 'desc');

    const notifications = await query;
    return notifications?.map(notification => ({
      ...notification,
      read: !!notification.read, // Converts 1 to true and 0 to false
    }));
  }

  async insert(notification: Notification): Promise<NotificationId> {
    return await this.client(NOTIFICATION_TABLE)
      .insert(notification)
      .returning('id');
  }

  async updateStatus(
    ids: NotificationId[],
    status: Notification['read'],
  ): Promise<void> {
    await this.client(NOTIFICATION_TABLE)
      .whereIn('id', ids)
      .update('read', status);
  }

  async deleteAll(ids: NotificationId[]): Promise<void> {
    await this.client(NOTIFICATION_TABLE).whereIn('id', ids).delete();
  }
}
