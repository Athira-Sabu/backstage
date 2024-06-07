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
import {Box, Button, Checkbox, IconButton, Link } from '@material-ui/core';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import Tooltip from '@mui/material/Tooltip';

type DenseTableProps = {
    notifications: Notification[];
    onLoadMore: () => void;
    onDelete: (ids: number[]) => void;
    updateStatus: (ids: number[], status: boolean) => void;
};


export const DenseTable = ({notifications, onLoadMore, onDelete, updateStatus}: DenseTableProps) => {
    const [showMore, setShowMore] = useState<Record<string, boolean>>({});
    const [selected, setSelected] = useState<number[]>([]);

    const handleSelect = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };
    const columns: TableColumn[] = [
        {
            title: '',
            field: 'delete',
            render: (rowData: any) => (
                <Checkbox checked={selected.includes(rowData.id)} onChange={() => handleSelect(rowData.id)}/>
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
        {
            title: 'Actions',
            field: 'actions',
            render: (rowData: any) => (
                <>
                    <IconButton onClick={() => updateStatus([rowData.id], !rowData.read)}>
                        {rowData.read ? <DoneAllIcon sx={{ color: '#0784c7' }}/> : <DoneIcon/>}
                    </IconButton>
                    <IconButton onClick={() => onDelete([rowData.id])}>
                        <DeleteOutlinedIcon/>
                    </IconButton>
                </>
            )
        },
    ];

    const data = notifications ? notifications.map(notification => {
        return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            origin: notification.origin,
            read: Boolean(notification.read),
            priority: notification.priority,
        };
    }) : [];

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
                            <>
                            <Tooltip title="Mark all selcted as read">
                                <IconButton onClick={() => updateStatus(selected, true)}>
                                    <ChecklistRtlIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete all selected">
                            <IconButton onClick={() => onDelete(selected)}>
                                <DeleteSweepIcon />
                            </IconButton>
                            </Tooltip>
                            </>
                        )}
                        <Link
                            component="button"
                            onClick={onLoadMore}
                            style={{minWidth: '100px'}}
                        >
                            Load more...
                        </Link>
                    </Box>
                }
                options={{search: false, padding: 'dense', paging: false}}
                columns={columns}
                data={data}
                filters={filters}
            />
            <Box display="flex" justifyContent="flex-end" marginTop={2}>
                <Button onClick={onLoadMore}>Load More</Button>
            </Box>

        </>
    );
};

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
        <DenseTable notifications={notifications || []} onLoadMore={ async() => await fetchNotifications(cursor)}
        onDelete={deleteNotifications} updateStatus={updateStatus}/>
    );
};
