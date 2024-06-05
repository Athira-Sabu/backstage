export type NotificationFetchOptions = {
    cursor?: number;
    limit?: number;
    read?: boolean;
    createdAfter?: Date;
    origin?: string;
};
