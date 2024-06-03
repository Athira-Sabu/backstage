import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user-notification', table => {
        table.uuid('user_id')
        table.string('notification_id');
        table.boolean('unread');

        table.primary(['user_id', 'notification_id']);
    });

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user-notification');
}
