import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { NotificationsPanel } from './NotificationsPanel';
import { notificationsApiRef } from '../../api/NotificationsApi';
import { errorApiRef } from '@backstage/core-plugin-api';
import { ErrorApiForwarder } from '@backstage/core-app-api';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { Notification_Priority } from '@internal/backstage-plugin-notifications-common/';

const mockNotificationsApi = {
  getNotifications: jest.fn(),
  deleteNotifications: jest.fn(),
  updateStatus: jest.fn(),
};
const renderWrapped = async (children: React.ReactNode) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [notificationsApiRef, mockNotificationsApi],
        [errorApiRef, new ErrorApiForwarder()],
      ]}
    >
      {children}
    </TestApiProvider>,
  );

describe('NotificationsPanel', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockNotificationsApi.getNotifications.mockReset();
    mockNotificationsApi.deleteNotifications.mockReset();
    mockNotificationsApi.updateStatus.mockReset();
  });

  it('should display fetched data', async () => {
    mockNotificationsApi.getNotifications.mockResolvedValue([
      {
        id: 1,
        message: 'Notification 1',
        title: 'Title 1',
        priority: Notification_Priority.HIGH,
        user: 'user:default/mock-user',
        read: false,
        origin: 'test',
      },
    ]);
    const component = await renderWrapped(<NotificationsPanel />);

    expect(mockNotificationsApi.getNotifications).toHaveBeenCalled();
    expect(component.getByText('Notification 1')).toBeInTheDocument();
    expect(component.getByText('Title 1')).toBeInTheDocument();
  });

  it('should call delete API on delete', async () => {
    mockNotificationsApi.getNotifications.mockResolvedValue([
      {
        id: 1,
        message: 'Notification 1',
        title: 'Title 1',
        priority: Notification_Priority.HIGH,
        user: 'user:default/mock-user',
        read: false,
        origin: 'test',
      },
    ]);
    mockNotificationsApi.deleteNotifications.mockResolvedValue({
      message: 'Notifications deleted successfully',
    });
    const component = await renderWrapped(<NotificationsPanel />);
    fireEvent.click(component.getByTestId('delete-btn'));

    expect(mockNotificationsApi.deleteNotifications).toHaveBeenCalledWith([1]);
    await waitFor(() =>
      expect(component.queryByText('Notification 1')).not.toBeInTheDocument(),
    );
  });

  it('should call updateStatus API on update', async () => {
    mockNotificationsApi.getNotifications.mockResolvedValue([
      {
        id: 1,
        message: 'Notification 1',
        title: 'Title 1',
        priority: Notification_Priority.HIGH,
        user: 'user:default/mock-user',
        read: false,
        origin: 'test',
      },
    ]);
    mockNotificationsApi.updateStatus.mockResolvedValue({
      message: 'Notification status updated successfully',
    });
    const component = await renderWrapped(<NotificationsPanel />);
    fireEvent.click(component.getByTestId('mark-read-btn'));
    expect(mockNotificationsApi.updateStatus).toHaveBeenCalledWith({
      ids: [1],
      status: true,
    });
  });
});
