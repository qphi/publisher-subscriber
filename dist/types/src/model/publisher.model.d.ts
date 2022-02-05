import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import SubscriptionManager from "./subscription-manager.model";
/**
 * Define instance that can publish notification
 */
declare class Publisher extends SubscriptionManager implements PublisherInterface {
    private shouldIStopPublicationOnException;
    /**
     * @inheritDoc
     */
    stopPublicationOnException(): void;
    /**
     * @inheritDoc
     */
    continuePublicationOnException(): void;
    /**
     * @inheritDoc
     */
    publish(notification: string, data?: any): void;
    /**
     * @inheritDoc
     */
    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[];
    /**
     * @inheritDoc
     */
    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[];
    /**
     * @inheritDoc
     */
    addSubscriber(notification: string, subscription: SubscriptionInterface): void;
    /**
     * @inheritDoc
     */
    removeSubscriber(subscriberId: string): void;
}
export default Publisher;
//# sourceMappingURL=publisher.model.d.ts.map