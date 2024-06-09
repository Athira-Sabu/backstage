import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationsPanel } from './NotificationsPanel';
import {notificationsApiRef} from "../../api/NotificationsApi";
import {errorApiRef} from "@backstage/core-plugin-api";
import {ApiProvider, ErrorApiForwarder} from "@backstage/core-app-api";
import {TestApiRegistry} from "@backstage/test-utils";

const mockNotificationsApi = {
  getNotifications: jest.fn(),
  deleteNotifications: jest.fn(),
  updateStatus: jest.fn(),
};

// Create an API registry for the test
// const apis = TestApiRegistry.from([
//   [notificationsApiRef, mockNotificationsApi]
//   [errorApiRef, new ErrorApiForwarder()],
// ]);

describe('NotificationsFetchComponent', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockNotificationsApi.getNotifications.mockReset();
    mockNotificationsApi.deleteNotifications.mockReset();
    mockNotificationsApi.updateStatus.mockReset();
  });
  it('renders progress indicator while loading', async () => {
    // Mock the API call to delay the response
    mockNotificationsApi.getNotifications.mockReturnValue(new Promise(() => {}));
    render(
        <ApiProvider apis={apis}>
          <NotificationsPanel />
        </ApiProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display data on fetch', () => {});
});
