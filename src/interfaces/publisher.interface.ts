import SubscriptionInterface from "./subscription.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

interface PublisherInterface extends SubscriptionManagerInterface {
    publish(notification: string, data?: any): void;

    addSubscriber(notification: string, subscription: SubscriptionInterface): void;
    removeSubscriber(subscription_id: string): void;

    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[];
    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[];

    stopPublicationOnException(): void;
    continuePublicationOnException(): void;

    destroy(): void;
}

export default PublisherInterface;