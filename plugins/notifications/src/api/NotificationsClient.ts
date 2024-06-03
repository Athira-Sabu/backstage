import {DiscoveryApi, FetchApi} from "@backstage/core-plugin-api";
import {NotificationsApi} from "./NotificationsApi";

export class NotificationsClient  implements NotificationsApi{  // TODO change
    private readonly discoveryApi: DiscoveryApi;
    private readonly fetchApi: FetchApi;

    public constructor(options: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
    }) {
        this.discoveryApi = options.discoveryApi;
        this.fetchApi = options.fetchApi;
    }

    async getNotifications(): Promise<Notification[]> {
        return await this.request<Notification[]>('notifications');
    }

    private async request<T>(path: string, init?: any): Promise<T> {
        const baseUrl = `${await this.discoveryApi.getBaseUrl('notifications')}/`;
        console.log("Base url>>>>>>", baseUrl)
        const url = new URL(path, baseUrl);

        const response = await this.fetchApi.fetch(url.toString(), init);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    }
}
