import {DatabaseService, resolvePackagePath} from "@backstage/backend-plugin-api";
import {Knex} from "knex";

import {Notification} from "../types";
import {Notification_Priority} from "../constants";

const migrationsDir = resolvePackagePath(
    '@internal/backstage-plugin-notifications-backend',
    'migrations',
);
const TABLE_NAME = 'notification';
export class NotificationsStore {


    private constructor(private readonly client: Knex) {
    }

    static async create(database: DatabaseService): Promise<NotificationsStore> {
        console.log("inside create>>>>>", migrationsDir)

        const client = await database.getClient();
        await client.migrate.latest({
            directory: migrationsDir,
        });

        console.log("Migartion run successfully>>>>")
        return new NotificationsStore(client);
    }

    async getAll(): Promise<Notification[]> { // TODO fetch notifications by UserId
        const rows = await this.client(TABLE_NAME)
            .select(['*']);
        if (!rows.length) {
            console.log("No notifications found");
            // now returning dummy data, later to be [] array
            // return [];
            return [{id: 1, title: "Dummy Notification", priority: Notification_Priority.NORMAL, message: "some message", timestamp: new Date()}];
        }
        return rows;
    }
    async insert(notification: Notification): Promise<void> {
        await this.client(TABLE_NAME).insert(notification); // TODO do we need to return any thing for post
    }

    async delete(id: number): Promise<void> {
        await this.client(TABLE_NAME).where({id}).delete();
    }
    async update(notification: Notification): Promise<void> {
        await this.client(TABLE_NAME).where({id: notification.id}).update(notification);
    }
}
