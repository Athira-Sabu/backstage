import {errorHandler} from '@backstage/backend-common';
import {DatabaseService, LoggerService} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import {NotificationsStore} from "../database/NotificationsStore";
import {SignalsService} from '@backstage/plugin-signals-node';


export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
  signals: SignalsService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, signals } = options;
  const notificationsStore = await NotificationsStore.create(database);
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });
//TODO correct the endpoint names
  router.get('/notifications', async (req, res) => {
    const notifications = await notificationsStore.getAll();
    res.json(notifications);
  }); // TODO get notifications for user

  router.post('/notifications', async (req, res) => {
    const notification = req.body;
    await notificationsStore.insert(notification);
    res.status(201).end();
  });
  router.put('/notifications', async (req, res) => {
    const notification = req.body;
    await notificationsStore.update(notification);
    res.status(200).end();
  }); // TODO PUT or Patch

    router.delete('/notifications/:id', async (req, res) => {
        const { id } = req.params;
        await notificationsStore.delete(Number(id));
        res.status(204).end();
    });

  // setInterval(async () => {
  //   console.log("inside signals send>>>>>>>>>")
  //   await signals.publish({
  //     recipients: { type: 'user', entityRef: ['user:development/guest'] },
  //     channel: 'notifications-channel',
  //     message: {
  //       message: 'hello world',
  //     },
  //   });
  // }, 5000);
  setInterval(async () => {
    // Fetch the latest notification
    const notifications = await notificationsStore.getAll();
    const latestNotification = notifications[notifications.length - 1];

    const message = {
      id: latestNotification.id,
      priority: latestNotification.priority,
      title: latestNotification.title,
      message: latestNotification.message,
    };

    // Send the latest notification as the message
    try{
        await signals.publish({
            recipients: { type: 'broadcast' },
            channel: '@internal/backstage-plugin-notifications-backend:update',
            message: message,
        });
    } catch (e) {
      logger.error(`Failed to send signal: ${e}`);
    }
  }, 5000);

  router.use(errorHandler());
  return router;
}
