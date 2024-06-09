import {Box, Checkbox, IconButton, Link} from '@material-ui/core';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import Tooltip from '@mui/material/Tooltip';
import {useCallback, useState} from 'react';
import {Notification} from "@internal/backstage-plugin-notifications-common/";

import {
    Table,
    TableColumn,
    TableFilter,
} from '@backstage/core-components';
import React from 'react';

interface NotificationsTableProps {
    notifications: Notification[];
    loadMore?: () => void;
    onDelete: (ids: number[]) => void;
    onUpdateStatus: (ids: number[], status: boolean) => void;
};

interface TitleProps {
    title: string;
    message: string;
}

interface SelectedActionsProps {
    selected: number[];
    onUpdateStatus: (ids: number[], status: boolean) => void;
    onDelete: (ids: number[]) => void;
}

interface LoadMoreProps {
    loadMore: () => void;
}

const Title = ({title, message}: TitleProps) => {
    const [showMore, setShowMore] = useState(false);

    return (
        <>
            <strong>{title}</strong>
            <p>
                {showMore ? message : message.substring(0, 100)}
                {message.length > 100 && (
                    <div
                        onClick={() => setShowMore(!showMore)}
                        style={{color: '#0784c7', textDecoration: 'underline', cursor: 'pointer', marginTop: 5}}
                    >
                        {showMore ? 'Show less' : 'Show more'}
                    </div>
                )}
            </p>
        </>
    );
};

const SelectedActions = ({selected, onUpdateStatus, onDelete}: SelectedActionsProps) => (
    <Box display="flex" alignItems="center">
        {selected.length > 0 && (
            <>
                <Tooltip title="Mark all selected as read">
                    <IconButton onClick={() => onUpdateStatus(selected, true)}>
                        <ChecklistRtlIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete all selected">
                    <IconButton onClick={() => onDelete(selected)}>
                        <DeleteSweepIcon/>
                    </IconButton>
                </Tooltip>
            </>
        )}
    </Box>
);

const LoadMore = ({loadMore}: LoadMoreProps) => (
    <Box display="flex" justifyContent="flex-end" marginTop={2}>
        <Link
            component="button"
            onClick={loadMore}
            style={{minWidth: '100px'}}
        >
            Load more...
        </Link>
    </Box>
);

export const NotificationsTable = ({notifications, loadMore, onDelete, onUpdateStatus}: NotificationsTableProps) => {
    const [selected, setSelected] = useState<number[]>([]);

    const handleSelect = useCallback((id: number) => {
        setSelected(prevSelected => prevSelected.includes(id)
            ? prevSelected.filter(item => item !== id) : [...prevSelected, id]);
    }, []);

    const renderActions = (rowData: Notification) => (
        <>
            <IconButton onClick={() => onUpdateStatus([rowData.id], !rowData.read)}>
                {rowData.read ? <DoneAllIcon sx={{color: '#0784c7'}}/> : <DoneIcon/>}
            </IconButton>
            <IconButton onClick={() => onDelete([rowData.id])}>
                <DeleteOutlinedIcon/>
            </IconButton>
        </>
    );

    const columns: TableColumn<Notification>[] = [
        {
            title: '',
            field: 'checkbox',
            render: (rowData: Notification) => (
                <Checkbox color= 'primary' checked={selected.includes(rowData.id)} onChange={() => handleSelect(rowData.id)}/>
            )
        },
        {
            title: 'Title',
            field: 'title',
            render: (rowData: Notification) => <Title title={rowData.title} message={rowData.message}/>
        },
        {
            title: 'Origin',
            field: 'origin'
        },
        {
            title: 'Priority',
            field: 'priority'
        },
        {
            title: 'Actions',
            field: 'actions',
            render: renderActions,
        },
    ];
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
                title={<SelectedActions selected={selected} onUpdateStatus={onUpdateStatus} onDelete={onDelete}/>}
                options={{search: false, padding: 'dense', paging: false}}
                columns={columns}
                data={notifications}
                filters={filters}
            />
            {loadMore &&<LoadMore loadMore={loadMore}/>}
        </>
    );
};
