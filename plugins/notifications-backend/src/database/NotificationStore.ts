import {
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';

import {
  Notification,
  NotificationFetchOptions,
  NotificationId,
  UpdateStatusParams,
} from '@internal/backstage-plugin-notifications-common';
import { NotificationStoreInterface } from './NotificationStoreInterface';
import { PluginDatabaseManager } from '@backstage/backend-common';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-notifications-backend',
  'migrations',
);
const NOTIFICATION_TABLE = 'notification';
const NOTIFICATION_COLUMNS = {
  ID: 'id',
  PRIORITY: 'priority',
  TITLE: 'title',
  USER: 'user',
  MESSAGE: 'message',
  ORIGIN: 'origin',
  READ: 'read',
  CREATED_AT: 'create_at',
};

export class NotificationStore implements NotificationStoreInterface {
  private static instance: NotificationStore | null = null;

  private constructor(private readonly client: Knex) {}

  static async getInstance(
      database: PluginDatabaseManager,
      logger: LoggerService,
  ): Promise<NotificationStoreInterface> {
    if (!NotificationStore.instance) {
      try {
        const client = await database.getClient();
        await client.migrate.latest({
          directory: migrationsDir,
        });

        logger.info('Migrations successfully ran for notifications plugin');
        NotificationStore.instance = new NotificationStore(client);
      } catch (error) {
        logger.error('Failed to initialize NotificationStore');
        throw error;
      }
    }
    return NotificationStore.instance;
  }

  async getNotifications(
    options: NotificationFetchOptions,
  ): Promise<Notification[]> {
    let query = this.client(NOTIFICATION_TABLE)
      .select(
        NOTIFICATION_COLUMNS.ID,
        NOTIFICATION_COLUMNS.PRIORITY,
        NOTIFICATION_COLUMNS.TITLE,
        NOTIFICATION_COLUMNS.USER,
        NOTIFICATION_COLUMNS.MESSAGE,
        NOTIFICATION_COLUMNS.ORIGIN,
        NOTIFICATION_COLUMNS.READ,
        NOTIFICATION_COLUMNS.CREATED_AT,
      )
      .where(NOTIFICATION_COLUMNS.USER, options.user);
    if (options.cursor) {
      query = query.where(NOTIFICATION_COLUMNS.ID, '<', options.cursor);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.read !== undefined) {
      query = query.where(NOTIFICATION_COLUMNS.READ, options.read);
    }

    if (options.createdAfter) {
      query = query.where(
        NOTIFICATION_COLUMNS.CREATED_AT,
        '>',
        options.createdAfter,
      );
    }

    if (options.origin) {
      query = query.where(NOTIFICATION_COLUMNS.ORIGIN, options.origin);
    }
    query.orderBy(NOTIFICATION_COLUMNS.ID, 'desc');

    const notifications = await query;
    return notifications?.map(notification => ({
      ...notification,
      read: Boolean(notification.read), // Converts 1 to true and 0 to false
    }));
  }

  async saveNotification(notification: Notification): Promise<NotificationId> {
    const insertedIds = await this.client(NOTIFICATION_TABLE)
      .insert(notification)
      .returning(NOTIFICATION_COLUMNS.ID);
    return insertedIds?.[0].id;
  }

  async updateStatus(updateParams: UpdateStatusParams): Promise<void> {
    await this.client(NOTIFICATION_TABLE)
      .whereIn(NOTIFICATION_COLUMNS.ID, updateParams.ids)
      .update(NOTIFICATION_COLUMNS.READ, updateParams.status);
  }

  async deleteNotifications(ids: NotificationId[]): Promise<void> {
    await this.client(NOTIFICATION_TABLE)
      .whereIn(NOTIFICATION_COLUMNS.ID, ids)
      .delete();
  }
}
