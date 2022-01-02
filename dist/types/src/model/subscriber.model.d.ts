import type SubscriptionInterface from "../interfaces/subscription.interface";
import type SubscriberInterface from "../interfaces/subscriber.interface";
import type PublisherInterface from "../interfaces/publisher.interface";
import type NotificationRecord from "../interfaces/notification-record.interface";
import SubscriptionManager from "./subscription-manager.model";
/**
 * Define instance that can handle notification from publisher
 */
declare class Subscriber extends SubscriptionManager implements SubscriberInterface {
    /**
     * @inheritDoc
     */
    unsubscribeFromSubscriptionId(subscriptionId: string): void;
    /**
     * @inheritDoc
     */
    findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[];
    /**
     * @inheritDoc
     */
    unsubscribeFromPublisherId(publisherId: string): void;
    /**
     * @inheritDoc
     */
    unsubscribeFromNotification(notification: string): void;
    /**
     * @inheritDoc
     */
    subscribe(publisher: PublisherInterface, notification: string, handler: (payload: any) => void, priority?: number): void;
    /**
     * @inheritDoc
     */
    getNbSubscriptions(): number;
    /**
     * @inheritDoc
     */
    removeSubscription(subscriptionId: string): void;
    /**
     * @inheritDoc
     */
    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>>;
    /**
     * @inheritDoc
     */
    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[];
}
export default Subscriber;
//# sourceMappingURL=subscriber.model.d.ts.map