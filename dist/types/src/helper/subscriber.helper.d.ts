import SubscriberInterface from "../interfaces/subscriber.interface";
import PublisherInterface from "../interfaces/publisher.interface";
/**
 * Definition of a subscription, contain the notification name and handler configuration
 * @alpha
 */
interface SubscriptionObjectEntryInterface {
    notification: string;
    action: string;
    mapAttributes?: Record<string, any>;
}
/**
 * Create and add subscriptions between publisher and subscriber using a "subscription configuration object"
 * @param subscriber - the subscriber
 * @param publisher - the publisher
 * @param subscriptions - object containing definition of subscription aka notification and handler configuration
 * @alpha
 */
export declare function subscribeFromObject(subscriber: SubscriberInterface, publisher: PublisherInterface, subscriptions: SubscriptionObjectEntryInterface[]): void;
export {};
//# sourceMappingURL=subscriber.helper.d.ts.map