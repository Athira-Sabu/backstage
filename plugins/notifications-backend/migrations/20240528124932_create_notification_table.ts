import { Knex } from 'knex';
import { Notification_Priority } from '@internal/backstage-plugin-notifications-common';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notification', table => {
    table.integer('id').primary();
    table.string('message', 500).notNullable();
    table.string('title', 100);
    table.string('origin').notNullable();
    table.enum('priority', Object.values(Notification_Priority));
    table.string('user').notNullable();
    table.boolean('read').defaultTo(false);
    table.timestamp('create_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));

    table.index(['user'], 'notification_user_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('notification');
}
