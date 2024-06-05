import {DiscoveryApi, FetchApi} from "@backstage/core-plugin-api";
import {NotificationsApi} from "./NotificationsApi";
import {Notification, NotificationFetchOptions} from "../types";

export class NotificationsClient  implements NotificationsApi {  // TODO change
    private readonly discoveryApi: DiscoveryApi;
    private readonly fetchApi: FetchApi;

    public constructor(options: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
    }) {
        this.discoveryApi = options.discoveryApi;
        this.fetchApi = options.fetchApi;
    }

    async getNotifications(options?: NotificationFetchOptions): Promise<Notification[]> {
        const params = options ? options : {};
        return await this.request<Notification[]>('notifications', { method: 'GET', params });

    }

    private async request<T>(path: string, init?: any): Promise<T> {
        const baseUrl = `${await this.discoveryApi.getBaseUrl('notifications')}`;
        const url = new URL(path, baseUrl);

        if (init.params) {
            Object.keys(init.params).forEach(key => url.searchParams.append(key, init.params[key]));
        }
        const response = await this.fetchApi.fetch(url.toString(), init);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }
}
