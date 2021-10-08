import PublisherInterface from "./publisher.interface";

export default interface NotificationRecord {
    from: PublisherInterface;
    name: string;
    handler?: Function
};