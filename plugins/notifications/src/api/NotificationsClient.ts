import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { NotificationsApi } from './NotificationsApi';
import {
  Notification,
  NotificationFetchOptions,
  HttpMethod,
  UpdateStatusParams,
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
      method: HttpMethod.GET,
      params,
    });
  }

  async updateStatus(params: UpdateStatusParams): Promise<void> {
    await this.request<{ message: string }>('notifications/status', {
      method: HttpMethod.PUT,
      body: JSON.stringify(params),
    });
  }

  async deleteNotifications(ids: number[]): Promise<void> {
    await this.request<{ message: string }>('notifications', {
      method: HttpMethod.DELETE,
      body: JSON.stringify(ids),
    });
  }

  private async request<T>(
    path: string,
    requestOptions: RequestInit & { params?: Record<string, string> } = {},
  ): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('notifications')}`;
    const url = new URL(path, baseUrl);

    if (requestOptions.params) {
      const searchParams = new URLSearchParams(requestOptions.params);
      url.search = searchParams.toString();
    }

    requestOptions.headers = requestOptions.headers || {
      'Content-Type': 'application/json',
    };
    const response = await this.fetchApi.fetch(url.toString(), requestOptions);

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as Promise<T>;
  }
}
