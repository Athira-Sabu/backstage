import React, {useEffect} from 'react';
import {useApi} from '@backstage/core-plugin-api';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel, TableFilter,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {notificationsApiRef} from "../../api/NotificationsApi";
import {useSignal} from '@backstage/plugin-signals-react';
import {Notification} from "../../types";



type DenseTableProps = {
  notifications: Notification[];
};


export const DenseTable = ({ notifications }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Subject', field: 'subject' },
    { title: 'Message', field: 'message' },
    { title: 'Origin', field: 'origin' },
    { title: 'Priority', field: 'priority'},
  ];

  const data = notifications? notifications.map(notification => {
    return {
      id: notification.id,
      subject: notification.title,
      message: notification.message,
      origin: notification.origin,
      priority: notification.priority,
    };
  }): [];

  const filters: TableFilter[] = [
    {
      column: 'Origin',
      type: 'multiple-select',
    },
    {
      column: 'Priority',
      type: 'select',
    }
  ];

  return (
      <Table
          key={notifications?.length}
          title="Notifications"
          options={{search: false, paging: false, padding: 'dense'}}
          columns={columns}
          data={data}
          filters={filters}
      />
  );
};

export const NotificationsFetchComponent = () => {
  const notificationApi = useApi(notificationsApiRef);
  const {lastSignal} = useSignal<Notification>('notifications:update');

  const {value : notifications, loading, error} = useAsync(async (): Promise<Notification[]> => {
    return await notificationApi.getNotifications();
  }, []);

  useEffect(() => {
    if (lastSignal) {
     notifications?.unshift(lastSignal)
    }
  }, [notifications,lastSignal]);

  if (loading) {
    return <Progress/>;
  } else if (error) {
    return <ResponseErrorPanel error={error}/>;
  }
  return (
        <DenseTable notifications={notifications || []}/>
  );
};