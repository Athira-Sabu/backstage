export type Notification = {
    id: number;
    priority: Notification_Priority;
    title: string;
    message: string;
    origin: string;
    createdAt: Date;
}
export enum Notification_Priority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
};
