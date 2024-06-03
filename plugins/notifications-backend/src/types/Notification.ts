import {Notification_Priority} from "../constants";

export type Notification = {
    id: number;
    priority: Notification_Priority;
    title: string;
    message: string;
    timestamp: Date;
}
