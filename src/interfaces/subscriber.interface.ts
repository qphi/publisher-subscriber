import SubscriptionInterface from "./subscription.interface";
import PublisherInterface from "./publisher.interface";
import NotificationRecord from "./notification-record.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

interface SubscriberInterface extends SubscriptionManagerInterface {
    subscribe(publisher: PublisherInterface, notification: string, handler: Function):void
    unsubscribeFromSubscriptionId(subscriptionId: string):void;
    unsubscribeFromPublisherId(publisherId: string):void;
    unsubscribeFromNotification(notification: string):void;
    findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[];
    getNbSubscriptions(): number;

    addSubscription(notification: string, subscription: SubscriptionInterface):void;
    removeSubscription(subscription_id: string):void;

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>>;
    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[];
    hasSubscription(subscriptionId: string): boolean;
    getId(): string;
    destroy():void;
}

export default SubscriberInterface;