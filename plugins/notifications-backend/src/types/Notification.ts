import {Notification_Priority} from "../constants";

export type Notification = {
    id: number;
    priority: Notification_Priority;
    title: string | null;
    message: string;
    origin: string;
    user: string;
    read: boolean;
    create_at: string;
}

export type NotificationId = Notification['id'];
