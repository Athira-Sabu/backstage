import React, {useEffect, useState} from 'react';
import {useApi} from '@backstage/core-plugin-api';
import {
    Progress,
    ResponseErrorPanel
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import {notificationsApiRef} from "../../api/NotificationsApi";
import {useSignal} from '@backstage/plugin-signals-react';
import {NotificationsTable} from './NotificationsTable';
import {Notification, CHANNEL_NEW_NOTIFICATION, DEFAULT_NOTIFICATION_LIMIT} from "@internal/backstage-plugin-notifications-common/";


export const NotificationsFetchComponent = () => {
    const notificationApi = useApi(notificationsApiRef);
    const {lastSignal} = useSignal<Notification>(CHANNEL_NEW_NOTIFICATION);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [cursor, setCursor] = useState<number | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);

    const updateNotifications = (updateFunc: (prevNotifications: Notification[]) => Notification[]) => {
        setNotifications(updateFunc);
    };
    const fetchNotifications = async () => {
        const fetchedNotifications = await notificationApi.getNotifications({
            cursor,
            limit: DEFAULT_NOTIFICATION_LIMIT
        });
        updateNotifications(prevNotifications => [...prevNotifications, ...fetchedNotifications]);
        setCursor(fetchedNotifications[fetchedNotifications.length - 1]?.id);
        setHasMore(fetchedNotifications.length === DEFAULT_NOTIFICATION_LIMIT);

    };


    const {loading, error} = useAsync(async (): Promise<void> => {
        await fetchNotifications();
    }, []);
    
    useEffect(() => {
        if (lastSignal) {
            updateNotifications(prevNotifications => [lastSignal, ...prevNotifications]);
        }
    }, [lastSignal]);

    const deleteNotifications = async (ids: number[]) => {
        await notificationApi.deleteNotifications(ids)
        updateNotifications(prevNotifications => prevNotifications
            .filter(notification => !ids.includes(notification.id)));
    }
    const updateStatus = async (ids: number[], status: boolean) => {
        await notificationApi.updateStatus(ids, status);
        updateNotifications(prevNotifications => prevNotifications.map(notification => {
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
        <NotificationsTable notifications={notifications || []}
                            loadMore={hasMore ? async () => await fetchNotifications() : undefined}
                            onDelete={deleteNotifications} onUpdateStatus={updateStatus}/>
    );
};
