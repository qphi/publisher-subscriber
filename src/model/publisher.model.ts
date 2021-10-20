import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import SubscriptionManager from "./subscription-manager.model";
import {findSubscriptionByRoleAndComponentId, ROLE} from "../helper/subscription-manager.helper";

/**
 * Define instance that can publish notification
 */
class Publisher extends SubscriptionManager implements PublisherInterface {
    private shouldIStopPublicationOnException: boolean = false;

    /**
     * @inheritDoc
     */
    stopPublicationOnException(): void {
        this.shouldIStopPublicationOnException = true;
    }

    /**
     * @inheritDoc
     */
    continuePublicationOnException(): void {
        this.shouldIStopPublicationOnException = false;
    }

    /**
     * @inheritDoc
     */
    publish(notification: string, data?: any): void {
        const subscriptions = this.notificationsCollection[notification];

        if (Array.isArray(subscriptions)) {
            // shallow copy in order to avoid iteration on modifiable collection
            subscriptions.slice(0).forEach(
                (subscription: SubscriptionInterface) => {
                    try {
                        subscription.handler(data);
                    }
                    catch (error) {
                        if (this.shouldIStopPublicationOnException) {
                            throw error;
                        }
                    }
                }
            );
        }
    }

    /**
     * @inheritDoc
     */
    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[] {
        return findSubscriptionByRoleAndComponentId(
            this,
            ROLE.SUBSCRIBER_ID,
            subscriberId
        );
    }

    /**
     * @inheritDoc
     */
    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[] {
        return this.findSubscriptionsByNotification(notification).filter(subscription => {
            return subscription.subscriber_id === subscriberId;
        })
    }

    /**
     * @inheritDoc
     */
    addSubscriber(notification: string, subscription: SubscriptionInterface): void {
        this.addSubscription(notification, subscription);
    }

    /**
     * @inheritDoc
     */
    removeSubscriber(subscription_id: string): void {
        this.clearSubscription(subscription_id);
    }
}

export default Publisher;