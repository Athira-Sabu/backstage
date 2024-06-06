import React, {useEffect, useState} from 'react';
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
import {Box, Button, Checkbox, } from '@material-ui/core';

type DenseTableProps = {
  notifications: Notification[];
};


export const DenseTable = ({ notifications }: DenseTableProps) => {
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  const handleDelete = () => {
    // Delete the selected notifications
    // This is just a placeholder, replace it with your actual delete logic
    console.log('Deleting notifications:', selected);
  };
  const columns: TableColumn[] = [
    {
      title: '',
      field: 'delete',
      render: (rowData: any) => (
          <Checkbox checked={selected.includes(rowData.id)} onChange={() => handleSelect(rowData.id)} />
      )
    },
    {
      title: 'Title',
      field: 'title',
      render: (rowData: any) => (
          <>
            <strong>{rowData.title}</strong>
            <p>
              {showMore[rowData.id] ? rowData.message : rowData.message.substring(0, 100)}
              {rowData.message.length > 100 && (
                  <div
                      onClick={() => setShowMore(prev => ({...prev, [rowData.id]: !prev[rowData.id]}))}
                      style={{color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginTop: 5}}
                  >
                    {showMore[rowData.id] ? 'Show less' : 'Show more'}
                  </div>
              )}
            </p>
          </>
      )
    },
    {title: 'Origin', field: 'origin'},
    {title: 'Priority', field: 'priority'},
  ];

  const data = notifications ? notifications.map(notification => {
    return {
      id: notification.id,
      title: notification.title,
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
      <>
        <Table
            key={notifications?.length}
            title={
              <Box display="flex" alignItems="center">
                {selected.length > 0 && (
                    <Box><Button onClick={handleDelete}>Delete</Button></Box>
                )}
              </Box>
            }
            options={{search: false, padding: 'dense'}}
            columns={columns}
            data={data}
            filters={filters}
            onRowSelected={(x) => {console.log('row selected', x)}}
        />
      {/*  TODO : load more click fetrch data wi th new curser*/}
      <a>load more</a>
      </>
  );
};

export const NotificationsFetchComponent = () => {
  const notificationApi = useApi(notificationsApiRef);
  const {lastSignal} = useSignal<Notification>('notifications:newNotification');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const {loading, error} = useAsync(async (): Promise<void> => {
    const fetchedNotifications = await notificationApi.getNotifications();
    setNotifications(fetchedNotifications.sort((a, b) => b.id - a.id));
  }, []);

  useEffect(() => {
    if (lastSignal) {
      console.log('lastSignal', lastSignal);
      setNotifications(prevNotifications => [lastSignal, ...prevNotifications]);
    }
  }, [lastSignal]);

  if (loading) {
    return <Progress/>;
  } else if (error) {
    return <ResponseErrorPanel error={error}/>;
  }
  return (
        <DenseTable notifications={notifications || []}/>
  );
};
