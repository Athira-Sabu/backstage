export type NotificationFetchOptions = {
    user: string;
    cursor?: number;
    limit?: number;
    read?: boolean;
    createdAfter?: Date;
    origin?: string;
};
