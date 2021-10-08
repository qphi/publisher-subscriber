import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import SubscriptionManager from "./subscription-manager.model";
import {findSubscriptionByRoleAndComponentId, ROLE} from "../helper/subscription-manager.helper";

class Publisher extends SubscriptionManager implements PublisherInterface {
    private shouldIStopPublicationOnException: boolean = false;

    stopPublicationOnException(): void {
        this.shouldIStopPublicationOnException = true;
    }

    continuePublicationOnException(): void {
        this.shouldIStopPublicationOnException = false;
    }

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

    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[] {
        return findSubscriptionByRoleAndComponentId(
            this,
            ROLE.SUBSCRIBER_ID,
            subscriberId
        );
    }

    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[] {
        return this.findSubscriptionsByNotification(notification).filter(subscription => {
            return subscription.subscriber_id === subscriberId;
        })
    }

    addSubscriber(notification: string, subscription: SubscriptionInterface): void {
        this.addSubscription(notification, subscription);
    }

    removeSubscriber(subscription_id: string): void {
        this.clearSubscription(subscription_id);
    }
}

export default Publisher;