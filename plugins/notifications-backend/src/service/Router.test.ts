import {DatabaseManager, PluginDatabaseManager} from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';

import {createRouter} from './Router';
import {ConfigReader} from "@backstage/config";
import {mockServices} from "@backstage/backend-test-utils";
import {SignalsService} from "@backstage/plugin-signals-node";
import {NotificationStore} from "../database/NotificationStore";
import {NotificationStoreInterface} from "../database/NotificationStoreInterface";
import {Notification} from "../types";
import {CHANNEL_NEW_NOTIFICATION, Notification_Priority} from "../constants";
import {Knex} from "knex";

function createDatabase(): PluginDatabaseManager {
    return DatabaseManager.fromConfig(
        new ConfigReader({
            backend: {
                database: {
                    client: 'sqlite3',
                    connection: ':memory:',
                },
            },
        }),
    ).forPlugin('notifications');
}

const testNotifications: Notification[] = [
    {
        id: 1,
        message: 'Notification 1',
        title: 'Title 1',
        user: 'user:default/mock',
        read: false,
        priority: Notification_Priority.LOW,
        origin: 'test'
    } as Notification,
    {
        id: 2,
        message: 'Notification 2',
        title: 'Title 2',
        priority: Notification_Priority.HIGH,
        user: 'user:default/mock',
        read: false,
        origin: 'test'
    } as Notification,
    {
        id: 3,
        message: 'Notification 3',
        title: 'Title 2',
        priority: Notification_Priority.HIGH,
        user: 'user:default/mock',
        read: false,
        origin: 'test'
    } as Notification
];
const otherUserNotification: Notification = {
    id: 4,
    message: 'Notification 2',
    title: 'Title 2',
    priority: Notification_Priority.HIGH,
    user: 'user:default/other-user',
    read: false,
    origin: 'test'
} as Notification
const user = 'user:default/mock';

describe('createRouter', () => {
    let app: express.Express;
    let notificationsStore: NotificationStoreInterface;
    let knex: Knex

    const userInfo = mockServices.userInfo();
    const httpAuth = mockServices.httpAuth();
    const signalService: jest.Mocked<SignalsService> = {
        publish: jest.fn(),
    };
    const logger = mockServices.logger.mock()
    beforeAll(async () => {
        const db = createDatabase();
        knex = await db.getClient();
        notificationsStore = await NotificationStore.create(db, logger);
        const router = await createRouter({
            notificationsStore,
            logger: logger,
            signals: signalService,
            userInfo,
            httpAuth,
        });
        app = express().use(router);
    });

    beforeEach(async () => {
        jest.resetAllMocks();
        await knex('notification').del();
    });

    describe('GET /health', () => {
        it('returns ok', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toEqual(200);
            expect(response.body).toEqual({status: 'ok'});
        });
    });
    describe('GET /', () => {

        it('should return all notifications', async () => {
            for (const notification of testNotifications) {
                await notificationsStore.insert(notification);
            }
            const response = await request(app).get('/');
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(testNotifications.length);
            const expectedIds = testNotifications.map((n) => n.id).sort();
            const responseIds = response.body.map((n: { id: any; }) => n.id).sort();
            expect(responseIds).toEqual(expectedIds);
        });
        it('should return notifications for a specific user', async () => {
            const currentUserNotification = testNotifications[0];
            await notificationsStore.insert(currentUserNotification);
            await notificationsStore.insert(otherUserNotification);
            const response = await request(app).get('/');
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(1);
            expect(response.body[0].id).toEqual(currentUserNotification.id);
            expect(response.body[0].user).toEqual(user);
        });
        it('should works for cursor pagination', async () => {
            for (const notification of testNotifications) {
                await notificationsStore.insert(notification);
            }
            const response = await request(app).get('/').query({cursor: 2, limit: 1});
            expect(response.status).toEqual(200);
            expect(response.body.length).toEqual(1);
        });
    });
    describe('POST /', () => {
        it('should create a notification and publish signals', async () => {

            const response = await request(app).post('/').send(testNotifications[0]);
            expect(response.status).toEqual(201);
            expect(signalService.publish).toHaveBeenCalledWith(expect.objectContaining({
                recipients: {type: 'user', entityRef: [user]},
                channel: CHANNEL_NEW_NOTIFICATION,
                message: expect.objectContaining({id: testNotifications[0].id})
            }));
            await notificationsStore.getAll({user: user}).then((notifications) => {
                expect(notifications.length).toEqual(1);
                expect(notifications[0].id).toEqual(testNotifications[0].id);
            });
        });
        it('should return 400 for invalid notification data', async () => {
            const invalidNotification = {
                id: 1,
                message: 'Notification 1',
                title: 'Title 1',
            }
            const response = await request(app).post('/').send(invalidNotification);
            expect(response.status).toEqual(400);
        });
    });

    describe('PUT /status', () => {
        it('should update the read status of notifications', async () => {
            await notificationsStore.insert(testNotifications[0]);
            const response = await request(app).put('/status').send({
                ids: [testNotifications[0].id],
                status: true
            });
            expect(response.status).toEqual(200);
            const updatedNotification = await notificationsStore.getAll({user: user});
            expect(updatedNotification[0].read).toBe(true);
        });
    });

    describe('DELETE /', () => {
        it('should delete specified notifications', async () => {
            for (const notification of testNotifications) {
                await notificationsStore.insert(notification);
            }
            const idsToDelete = [testNotifications[0].id, testNotifications[1].id];
            const response = await request(app).delete('/').send(idsToDelete);
            expect(response.status).toEqual(200);
            const remainingNotifications = await notificationsStore.getAll({user: user});
            expect(remainingNotifications).toHaveLength(testNotifications.length - idsToDelete.length);
        });
    });
});


