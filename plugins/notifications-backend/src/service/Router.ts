import {errorHandler} from '@backstage/backend-common';
import {HttpAuthService, LoggerService, UserInfoService} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {SignalsService} from '@backstage/plugin-signals-node';
import {
    handleDeleteNotifications,
    handleGetNotifications,
    handlePostNotification,
    handleUpdateNotificationStatus
} from './NotificationHandler'
import {NotificationStoreInterface} from "../database/NotificationStoreInterface";


export interface RouterOptions {
    notificationsStore: NotificationStoreInterface;
    logger: LoggerService;
    signals: SignalsService;
    userInfo: UserInfoService;
    httpAuth: HttpAuthService;
}

export async function createRouter(
    options: RouterOptions,
): Promise<express.Router> {
    const router = Router();
    router.use(express.json());

    router.get('/health', (_: express.Request, res: express.Response): void => {
        res.json({status: 'ok'});
    });

    router.get('/', (req, res) =>
        handleGetNotifications(req, res, options)
    );

    router.post('/', async (req: express.Request, res: express.Response): Promise<void> =>
        handlePostNotification(req, res, options));

    router.put('/status', async (req: express.Request, res: express.Response): Promise<void> =>
        handleUpdateNotificationStatus(req, res, options));

    router.delete('/', async (req: express.Request, res: express.Response): Promise<void> =>
        handleDeleteNotifications(req, res, options));

    router.use(errorHandler());
    return router;
}

