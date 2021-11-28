import SubscriptionInterface from "./subscription.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

/**
 * Behavior expected by an instance who's publish some notification to subscribers
 */
interface PublisherInterface extends SubscriptionManagerInterface {
    /**
     * Publish a notification to subscribers
     * @param notification - notification name
     * @param data - additional data to send on publish
     */
    publish(notification: string, data?: any): void;

    /**
     * Add a subscription whose handler will be triggered when publisher will publish expected notification
     * @param notification - notification name whose trigger handler
     * @param subscription - subscription including the handler to trigger
     */
    addSubscriber(notification: string, subscription: SubscriptionInterface): void;

    /**
     * Remove all subscriptions between publisher and the subscriber with id `subscription_id`
     * @param subscriptionId - id of a potential subscriber
     */
    removeSubscriber(subscriptionId: string): void;

    /**
     * Find all subscriptions between publisher and the subscriber with id `subscription_id`
     * @param subscriberId  - id of a potential subscriber
     * @return SubscriptionInterface[] - all subscriptions found
     */
    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[];


    /**
     * Find all subscriptions between publisher and the subscriber with id `subscription_id` for a specified notification
     * @param notification  - notification name
     * @param subscriberId  - id of a potential subscriber
     * @return SubscriptionInterface[] - all subscriptions found
     */
    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[];

    /**
     * Update the behavior of publisher in order to stop publication workflow if one exception is thrown by a subscriber
     */
    stopPublicationOnException(): void;

    /**
     * Update the behavior of publisher in order to continue publication workflow if one exception is thrown by a subscriber. Note it is the default behavior.
     */
    continuePublicationOnException(): void;

    /**
     * Properly clear all subscriptions. Always use it before delete your instance in order to avoid memory leaks.
     */
    destroy(): void;
}

export default PublisherInterface;
