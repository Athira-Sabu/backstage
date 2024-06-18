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
import { UpdateStatusParams } from '@internal/backstage-plugin-notifications-common/';

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
    const notifications = await options.notificationsStore.getNotifications(
      fetchOptions,
    );
    res.send(notifications);
    return;
  } catch (error) {
    options.logger.error(`Failed to get the notifications: ${error}`);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching notifications.' });
    return;
  }
};
export const handleCreateNotification = async (
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
    const id = await options.notificationsStore.saveNotification(
      validNotification,
    );
    await publishSignals(
      options.signals,
      { ...validNotification, id },
      options.logger,
    );
    res.status(201).end();
    return;
  } catch (error) {
    options.logger.error(`Failed to save notification: ${error}`);
    res.status(500).json({ error: 'Failed to save notification' });
    return;
  }
};

export const handleUpdateNotificationStatus = async (
  req: express.Request,
  res: express.Response,
  options: RouterOptions,
): Promise<void> => {
  const updateStatusParams = req.body as UpdateStatusParams;
  if (!Array.isArray(updateStatusParams.ids)) {
    res.status(400).json({ error: 'ids must be an array' });
    return;
  }
  try {
    await options.notificationsStore.updateStatus(updateStatusParams);
    res
      .status(200)
      .json({ message: 'Notification status updated successfully' });
    return;
  } catch (error) {
    options.logger.error(`Failed to update notification status: ${error}`);
    res.status(500).json({ error: 'Failed to update notification status' });
    return;
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
    await options.notificationsStore.deleteNotifications(ids);
    res.status(200).json({ message: 'Notifications deleted successfully' });
    return;
  } catch (error) {
    options.logger.error(`Failed to delete notification ${error}`);
    res.status(500).json({ error: 'Failed to delete notification' });
    return;
  }
};
