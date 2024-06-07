import React, {useEffect, useState} from 'react';
import {useApi} from '@backstage/core-plugin-api';
import {
    Progress,
    ResponseErrorPanel
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {notificationsApiRef} from "../../api/NotificationsApi";
import {useSignal} from '@backstage/plugin-signals-react';
import {Notification} from "../../types";
import { NotificationsTable } from './NotificationsTable';

export const NotificationsFetchComponent = () => {
    const notificationApi = useApi(notificationsApiRef);
    const {lastSignal} = useSignal<Notification>('notifications:newNotification');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [cursor, setCursor] = useState<number| undefined>(undefined);

    const fetchNotifications = async (cursor: number | undefined) => {
        const fetchedNotifications = await notificationApi.getNotifications({cursor, limit: 10});
        setNotifications(prevNotifications => [...prevNotifications, ...fetchedNotifications]);
        setCursor(fetchedNotifications[fetchedNotifications.length - 1]?.id);
    };

    const {loading, error} = useAsync(async (): Promise<void> => {
        await fetchNotifications(cursor);
    }, []);

    useEffect(() => {
        if (lastSignal) {
            console.log('lastSignal', lastSignal);
            setNotifications(prevNotifications => [lastSignal, ...prevNotifications]);
        }
    }, [lastSignal]);

    const deleteNotifications = async (ids: number[]) => {
        await notificationApi.deleteNotifications(ids)
        setNotifications(prevNotifications => prevNotifications.filter(notification => !ids.includes(notification.id)));
    }
    const updateStatus = async (ids: number[], status: boolean) => {
        await notificationApi.updateStatus(ids, status);
        setNotifications(prevNotifications => prevNotifications.map(notification => {
            if (ids.includes(notification.id)) {
                return {...notification, read: status};
            }
            return notification;
        }));
    }
    if (loading) {
        return <Progress/>;
    } else if (error) {
        return <ResponseErrorPanel error={error}/>;
    }
    return (
        <NotificationsTable notifications={notifications || []} loadMore={ async() => await fetchNotifications(cursor)}
        onDelete={deleteNotifications} updateStatus={updateStatus}/>
    );
};
