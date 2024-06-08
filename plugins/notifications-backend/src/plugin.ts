import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/Router';
import { signalsServiceRef } from '@backstage/plugin-signals-node';
import {NotificationStore} from "./database/NotificationStore";

/**
 * notificationsPlugin backend plugin
 *
 * @public
 */
export const notificationsPlugin = createBackendPlugin({
  pluginId: 'notifications',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        database: coreServices.database,
        signals: signalsServiceRef,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
      },
      async init({
        httpRouter,
        logger,
        database,
        signals,
        httpAuth,
        userInfo,
      }) {
        const notificationsStore = await NotificationStore.create(database, logger);

        httpRouter.use(
          await createRouter({
            notificationsStore,
            logger,
            signals,
            httpAuth,
            userInfo,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
