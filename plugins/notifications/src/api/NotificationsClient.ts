import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { NotificationsApi } from './NotificationsApi';
import {
  Notification,
  NotificationFetchOptions,
} from '@internal/backstage-plugin-notifications-common/';

export class NotificationsClient implements NotificationsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  public constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getNotifications(
    options?: NotificationFetchOptions,
  ): Promise<Notification[]> {
    const params = options || {};
    return await this.request<Notification[]>('notifications', {
      method: 'GET',
      params,
    });
  }

  async updateStatus(ids: number[], status: boolean): Promise<void> {
    await this.request<{ message: string }>('notifications/status', {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    });
  }

  async deleteNotifications(ids: number[]): Promise<void> {
    await this.request<{ message: string }>('notifications', {
      method: 'DELETE',
      body: JSON.stringify(ids),
    });
  }

  private async request<T>(
      path: string,
      init: RequestInit & { params?: Record<string, string> } = {},
  ): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('notifications')}`;
    const url = new URL(path, baseUrl);

    if (init.params) {
      const searchParams = new URLSearchParams(init.params);
      url.search = searchParams.toString();
    }

    init.headers = { 'Content-Type': 'application/json' };
    const response = await this.fetchApi.fetch(url.toString(), init);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as Promise<T>;
  }
}
