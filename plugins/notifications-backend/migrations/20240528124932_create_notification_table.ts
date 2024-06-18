import { Knex } from 'knex';
import { Notification_Priority } from '@internal/backstage-plugin-notifications-common';
import { NOTIFICATION_COLUMNS, NOTIFICATION_TABLE } from './constants';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(NOTIFICATION_TABLE, table => {
    table.integer(NOTIFICATION_COLUMNS.ID).primary();
    table.string(NOTIFICATION_COLUMNS.MESSAGE, 500).notNullable();
    table.string(NOTIFICATION_COLUMNS.TITLE, 100);
    table.string(NOTIFICATION_COLUMNS.ORIGIN).notNullable();
    table.enum(
      NOTIFICATION_COLUMNS.PRIORITY,
      Object.values(Notification_Priority),
    );
    table.string(NOTIFICATION_COLUMNS.USER).notNullable();
    table.boolean(NOTIFICATION_COLUMNS.READ).defaultTo(false);
    table
      .timestamp(NOTIFICATION_COLUMNS.CREATE_AT)
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

    table.index(['user'], 'notification_user_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('notification');
}
