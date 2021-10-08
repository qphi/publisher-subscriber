import SubscriptionInterface from "../interfaces/subscription.interface";
import SubscriberInterface from "../interfaces/subscriber.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import NotificationRecord from "../interfaces/notification-record.interface";
import SubscriptionManager from "./subscription-manager.model";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";
import {findSubscriptionByRoleAndComponentId, ROLE} from "../helper/subscription-manager.helper";

let salt = 0;

class Subscriber extends SubscriptionManager implements SubscriberInterface {
    unsubscribeFromSubscriptionId(subscriptionId: string): void {
        const subscription = this.findSubscriptionById(subscriptionId);

        if (subscription === null) {
            throw new SubscriptionNotFoundException(subscriptionId, this.getId());
        }

        subscription.unsubscribe();
    }


    findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[] {
        return findSubscriptionByRoleAndComponentId(
            this,
            ROLE.PUBLISHER_ID,
            publisherId
        );
    }

    unsubscribeFromPublisherId(publisherId: string): void {
        const subscriptions = this.findSubscriptionByPublisherId(publisherId);

        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    unsubscribeFromNotification(notification: string): void {
        const subscriptions = this.findSubscriptionsByNotification(notification);
        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    subscribe(publisher: PublisherInterface, notification: string, handler: Function): void {
        const nbSubscriptions = this.getNbSubscriptions();
        const subscription_id =  `sub_${this.getId()}_to_${publisher.getId()}_salt_${nbSubscriptions}`;

        const subscription: SubscriptionInterface = {
            id: subscription_id,
            subscriber_id: this.getId(),
            publisher_id: publisher.getId(),
            unsubscribe: () => {
                publisher.removeSubscriber(subscription_id);
                this.removeSubscription(subscription_id);
            },
            handler
        };

        this.addSubscription(notification, subscription);
        publisher.addSubscriber(notification, subscription);
    }

    getNbSubscriptions(): number {
        return this.nbSubscriptionRecorded;
    }

    removeSubscription(subscription_id: string): void {
        this.clearSubscription(subscription_id);
    }

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        const dedicatedSubSubscriber = new Subscriber(`wait-until-${notifications.map(item => item.name).join('-and-')}-salt_${salt++}`);
        return new Promise((resolve: Function) => {
            Promise.all(
                notifications.map(notification  => {
                    return new Promise((resolve1: Function) => {
                        dedicatedSubSubscriber.subscribe(
                            notification.from,
                            notification.name,
                            () => {
                                resolve1();
                            }
                        );
                    });
                })
            ).then((data: Array<any>) => {
                // destroy to avoid memory leak with unused references to PublisherInterface from `notification.from`
                dedicatedSubSubscriber.destroy();

                resolve(data);
            });
        });
    }

    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[] {
        const subscriptions = this.findSubscriptionsByNotification(notification);

        return subscriptions.filter(subscription => {
            return subscription.publisher_id === publisherId
        });
    }
}

export default Subscriber;