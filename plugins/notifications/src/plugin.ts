import {
    createApiFactory, createApiRef,
    createPlugin,
    createRoutableExtension, discoveryApiRef, fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import {NotificationsClient} from "./api/NotificationsClient";
import {notificationsApiRef} from "./api/NotificationsApi";

export const notificationsPlugin = createPlugin({
    id: 'notifications',
    routes: {
        root: rootRouteRef,
    },
    apis: [
        createApiFactory({
            api: notificationsApiRef,
            deps: {discoveryApi: discoveryApiRef, fetchApi: fetchApiRef},
            factory: ({discoveryApi, fetchApi}) =>
                new NotificationsClient({discoveryApi, fetchApi}),
        }),
    ],
});

export const NotificationsPage = notificationsPlugin.provide(
  createRoutableExtension({
    name: 'NotificationsPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
