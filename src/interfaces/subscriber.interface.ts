import SubscriptionInterface from "./subscription.interface";
import PublisherInterface from "./publisher.interface";
import NotificationRecord from "./notification-record.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

/**
 * Define how any subscriber should behave
 */
interface SubscriberInterface extends SubscriptionManagerInterface {
    /**
     * Add a subscription between subscriber and publisher
     * @param publisher - publisher to subscribe
     * @param notification - notification whose trigger subscription handler
     * @param handler - callback to handle when publisher publish the right notification
     */
    subscribe(publisher: PublisherInterface, notification: string, handler: Function):void

    /**
     * Remove a subscription by id
     * @param subscriptionId - subscription id
     */
    unsubscribeFromSubscriptionId(subscriptionId: string):void;

    /**
     * Remove all subscription from a publisher
     * @param publisherId - publisher id
     */
    unsubscribeFromPublisherId(publisherId: string):void;

    /**
     * Remove all subscription bind to the following notification name
     * @param notification - notification name
     */
    unsubscribeFromNotification(notification: string):void;

    /**
     * Find all subscriptions from a publisher
     * @param publisherId - publisher id
     * @return  SubscriptionInterface[] - subscriptions found
     */
    findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[];

    /**
     * @return number - number of subscription as subscriber
     */
    getNbSubscriptions(): number;

    /**
     * Add a subscription to subscription list
     * @param notification - notification name
     * @param subscription
     */
    addSubscription(notification: string, subscription: SubscriptionInterface):void;

    /**
     * Remove subscription from subscriber's subscription list. Note that this method won't remove subscription to publisher's subscription list. That's why you shouldn't call it manually. To properly remove a subscription, prefer {@link unsubscribeFromSubscriptionId}
     * @param subscription_id
     * @internal
     */
    removeSubscription(subscription_id: string):void;

    /**
     * Wait until one or several notications are published. If only one notification publication is pending, it is equivalent to "subscribeOnce".
     * Subscription will be removed after first trigger.
     * @param notifications - List of notifications that must be published to trigger handler
     * @return Promise
     */
    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>>;

    /**
     * Find all subscriptions with a publisher and a specified notification
     * @param notification
     * @param publisherId
     */
    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[];


    /**
     * Properly clear all subscriptions. Always use it before delete your instance in order to avoid memory leaks.
     */
    destroy(): void;
}

export default SubscriberInterface;