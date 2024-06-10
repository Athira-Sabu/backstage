import { getUser } from './User';
import {
  Notification,
  NotificationFetchOptions,
} from '@internal/backstage-plugin-notifications-common';
import { RouterOptions } from './Router';
import express from 'express';
import { publishSignals } from './SignalsHandler';
import Ajv from 'ajv';
import notificationSchema from '../schema/NotificationSchema.json';

const validate = new Ajv().compile(notificationSchema);

export const handleGetNotifications = async (
  req: express.Request,
  res: express.Response,
  options: RouterOptions,
): Promise<void> => {
  try {
    const user = await getUser(req, options.httpAuth, options.userInfo);
    const fetchOptions: NotificationFetchOptions = {
      user,
      cursor: req.query.cursor ? Number(req.query.cursor) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      read: req.query.read ? req.query.read === 'true' : undefined,
      createdAfter: req.query.createdAfter
        ? String(req.query.createdAfter)
        : undefined,
      origin: req.query.origin ? String(req.query.origin) : undefined,
    };
    const notifications = await options.notificationsStore.getAll(fetchOptions);
    res.send(notifications);
  } catch (error) {
    options.logger.error(`Failed to get the notifications: ${error}`);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching notifications.' });
  }
};

export const handlePostNotification = async (
  req: express.Request,
  res: express.Response,
  options: RouterOptions,
): Promise<void> => {
  try {
    const notification = req.body;
    const valid = validate(notification);

    if (!valid) {
      options.logger.error(`Validation error: ${validate.errors}`);
      res
        .status(400)
        .json({ error: 'Invalid notification data', details: validate.errors });
      return;
    }
    const validNotification = notification as Notification;
    const id = await options.notificationsStore.insert(validNotification);
    await publishSignals(
      options.signals,
      { ...validNotification, id },
      options.logger,
    );
    res.status(201).end();
  } catch (error) {
    options.logger.error(`Failed to save notification: ${error}`);
    res.status(500).json({ error: 'Failed to save notification' });
  }
};

export const handleUpdateNotificationStatus = async (
  req: express.Request,
  res: express.Response,
  options: RouterOptions,
): Promise<void> => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids)) {
    res.status(400).json({ error: 'ids must be an array' });
  }
  try {
    await options.notificationsStore.updateStatus(ids, status);
    res
      .status(200)
      .json({ message: 'Notification status updated successfully' });
  } catch (error) {
    options.logger.error(`Failed to update notification status: ${error}`);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
};

export const handleDeleteNotifications = async (
  req: express.Request,
  res: express.Response,
  options: RouterOptions,
): Promise<void> => {
  const ids = req.body;
  if (!Array.isArray(ids)) {
    res.status(400).json({ error: 'ids must be an array' });
    return;
  }
  try {
    await options.notificationsStore.deleteAll(ids);
    res.status(200).json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    options.logger.error(`Failed to delete notification ${error}`);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
