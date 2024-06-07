import {errorHandler} from '@backstage/backend-common';
import {DatabaseService, HttpAuthService, LoggerService, UserInfoService} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {NotificationsStore} from "../database/NotificationsStore";
import {SignalsService} from '@backstage/plugin-signals-node';
import {Notification, NotificationFetchOptions} from "../types";
import {getUser} from "./user";
import {CHANNEL_NEW_NOTIFICATION} from "../constants";


export interface RouterOptions {
    logger: LoggerService;
    database: DatabaseService;
    signals: SignalsService;
    userInfo: UserInfoService;
    httpAuth: HttpAuthService;
}

const publishSignals = async (signals: SignalsService, notification: Notification, logger: LoggerService, user: string): Promise<void> => {
    try {
        await signals.publish<Notification>({
            recipients: {type: 'user', entityRef: [user]},
            channel: CHANNEL_NEW_NOTIFICATION,
            message: notification,
        });
    } catch (e) {
        logger.error(`Failed to send signal: ${e}`);
    }
}

export async function createRouter(
    options: RouterOptions,
): Promise<express.Router> {
    const {logger, database, signals, userInfo, httpAuth} = options;
    const notificationsStore = await NotificationsStore.create(database, logger);

    const router = Router();
    router.use(express.json());

    router.get('/health', (_: express.Request, res: express.Response): void => {
        res.json({status: 'ok'});
    });

    router.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
        const user = await getUser(req, httpAuth, userInfo);

        const fetchOptions: NotificationFetchOptions = {
            user,
            cursor: req.query.cursor ? Number(req.query.cursor) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            read: req.query.read ? req.query.read === 'true' : undefined,
            createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter) : undefined,
            origin: req.query.origin ? String(req.query.origin) : undefined,
        };
        const notifications = await notificationsStore.getAll(fetchOptions);
        res.send(notifications);
    });


    router.post('/', async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const notification = req.body;
            // TODO how to handle user auth in scenario of inset
            // const user = await getUser(req, httpAuth, userInfo);
            //
            // if (!user) {
            //     logger.error('Invalid user');
            //     res.status(400).json({error: 'Invalid user'});
            //     return;
            // }
            await notificationsStore.insert(notification);
            await publishSignals(signals, notification, logger, notification.user);
            res.status(201).end();
        } catch (error) {
            logger.error(`Failed to save notification: ${error}`);
            res.status(500).json({error: 'Failed to save notification'});
        }
    });

    router.put('/status', async (req: express.Request, res: express.Response): Promise<void> => {
        const {ids, status} = req.body;
        if (!Array.isArray(ids)) {
            res.status(400).json({error: 'ids must be an array'});
        }
        try {
            await notificationsStore.updateStatus(ids, status);
            res.status(200).json({message: 'Notification status updated successfully'});
        } catch (error) {
            logger.error(`Failed to update notification status: ${error}`);
            res.status(500).json({error: 'Failed to update notification status'});
        }
    });

    router.delete('/', async (req: express.Request, res: express.Response): Promise<void> => {
        const ids = req.body;
        if (!Array.isArray(ids)) {
            res.status(400).json({error: 'ids must be an array'});
            return;
        }
        try {
            await notificationsStore.deleteAll(ids);
            res.status(200).json({message: 'Notifications deleted successfully'}); // TODO 204 or 200
        } catch (error) {
            logger.error(`Failed to delete notification ${error}`);
            res.status(500).json({error: 'Failed to delete notification'});
        }
    });
    router.use(errorHandler());
    return router;
}

