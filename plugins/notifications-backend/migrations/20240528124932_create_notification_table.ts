import { Knex } from "knex";
import {Notification_Priority} from "../src/constants";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('notification', table => {
        table.uuid('id').primary();
        table.string('message', 500).notNullable();
        table.string('title', 100);
        table.string('origin').notNullable();
        table.enum('priority', Object.values(Notification_Priority));
        table.timestamp('create_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    });

}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('notification');
}

