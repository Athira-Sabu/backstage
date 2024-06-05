import {errorHandler} from '@backstage/backend-common';
import {DatabaseService, HttpAuthService, LoggerService, UserInfoService} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {NotificationsStore} from "../database/NotificationsStore";
import {SignalsService} from '@backstage/plugin-signals-node';
import {NotificationFetchOptions} from "../types";
import {getUser} from "./user";


export interface RouterOptions {
    logger: LoggerService;
    database: DatabaseService;
    signals: SignalsService;
    userInfo: UserInfoService;
    httpAuth: HttpAuthService;
}

export async function createRouter(
    options: RouterOptions,
): Promise<express.Router> {
    const {logger, database, signals, userInfo, httpAuth} = options;
    const notificationsStore = await NotificationsStore.create(database, logger);

    const router = Router();
    router.use(express.json());

    router.get('/health', (_, response) => {
        logger.info('PONG!');
        response.json({status: 'ok'});
    });

    router.get('/', async (req: express.Request, res) => {
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


    router.post('/', async (req, res) => {
        try {
            const notification = req.body;
            const user = await getUser(req, httpAuth, userInfo);

            if (!user) {
                logger.error('Invalid user');
                res.status(400).json({error: 'Invalid user'});
                return;
            }

            notification.user = user;
            await notificationsStore.insert(notification);
            res.status(201).end();
        } catch (error) {
            logger.error(`Failed to save notification: ${error}`);
            res.status(500).json({error: 'Failed to save notification'});
        }
    });

    router.put('/status', async (req, res) => {
        const {ids, status} = req.body;
        if (!Array.isArray(ids)) {
            res.status(400).json({error: 'ids must be an array'});
        }
        try {
            await notificationsStore.updateStatus(ids, status);
            res.status(200).end();
        } catch (error) {
            logger.error(`Failed to update notification status: ${error}`);
            res.status(500).json({error: 'Failed to update notification status'});
        }
    });

    router.delete('/', async (req, res) => {
        const {ids} = req.body;
        if (!Array.isArray(ids)) {
            res.status(400).json({error: 'ids must be an array'});
            return;
        }
        try {
            await notificationsStore.deleteAll(ids);
            res.status(204).end();
        } catch (error) {
            logger.error(`Failed to delete notification ${error}`);
            res.status(500).json({error: 'Failed to delete notification'});
        }
    });


    // setInterval(async () => {
    //   // Fetch the latest notification
    //   const notifications = await notificationsStore.getAll();
    //   if(!notifications.length) {
    //     console.log('No notifications found');
    //       return;
    //   }
    //   const latestNotification = notifications[notifications.length - 1];
    //
    //   const message = {
    //     id: latestNotification?.id,
    //     priority: latestNotification?.priority,
    //     title: latestNotification?.title,
    //     message: latestNotification?.message,
    //   };
    //   try{
    //       await signals.publish({
    //           recipients: { type: 'broadcast' },
    //           channel: 'notifications:update',
    //           message: message,
    //       });
    //   } catch (e) {
    //     logger.error(`Failed to send signal: ${e}`);
    //   }
    // }, 20000);
    router.use(errorHandler());
    return router;
}
