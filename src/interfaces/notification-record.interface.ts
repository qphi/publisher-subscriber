import PublisherInterface from "./publisher.interface";

/**
 * Definition of NotificationRecord
 */
export default interface NotificationRecord {
    from: PublisherInterface;
    name: string;
    handler?: (payload: any) => void
}
