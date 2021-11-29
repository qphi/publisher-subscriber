import type SubscriptionInterface from "../interfaces/subscription.interface";
import type SubscriberInterface from "../interfaces/subscriber.interface";
import type PublisherInterface from "../interfaces/publisher.interface";
import type NotificationRecord from "../interfaces/notification-record.interface";
import SubscriptionManager from "./subscription-manager.model";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";
import {
    findSubscriptionByRoleAndComponentId,
    ROLE,
    DEFAULT_PRIORITY
} from "../helper/subscription-manager.helper";
import InvalidArgumentException from "../exception/invalid-argument.exception";

let salt = 0;

/**
 * Define instance that can handle notification from publisher
 */
class Subscriber extends SubscriptionManager implements SubscriberInterface {
    /**
     * @inheritDoc
     */
    public unsubscribeFromSubscriptionId(subscriptionId: string): void {
        const subscription = this.findSubscriptionById(subscriptionId);

        if (subscription === null) {
            throw new SubscriptionNotFoundException(subscriptionId, this.getId());
        }

        subscription.unsubscribe();
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[] {
        return findSubscriptionByRoleAndComponentId(
            this,
            ROLE.PUBLISHER_ID,
            publisherId
        );
    }

    /**
     * @inheritDoc
     */
    public unsubscribeFromPublisherId(publisherId: string): void {
        const subscriptions = this.findSubscriptionByPublisherId(publisherId);

        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    /**
     * @inheritDoc
     */
    public unsubscribeFromNotification(notification: string): void {
        const subscriptions = this.findSubscriptionsByNotification(notification);
        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    /**
     * @inheritDoc
     */
    public subscribe(
        publisher: PublisherInterface,
        notification: string,
        handler: (payload: any) => void,
        priority: number = DEFAULT_PRIORITY
    ): void {
        const nbSubscriptions = this.getNbSubscriptions();
        const subscriptionId = `sub_${this.getId()}_to_${publisher.getId()}_salt_${nbSubscriptions}`;

        // assume type-checking cause script may run in js context or third project using ts-ignore decorator
        if (isNaN(priority) || typeof priority !== 'number') {
            throw new InvalidArgumentException(
                `Unable to create a subscription with priority "${priority}" (typed as "${typeof priority}"). Number value is expected.`
            );
        }

        const subscription: SubscriptionInterface = {
            id: subscriptionId,
            subscriber_id: this.getId(),
            publisher_id: publisher.getId(),
            unsubscribe: () => {
                publisher.removeSubscriber(subscriptionId);
                this.removeSubscription(subscriptionId);
            },
            priority,
            handler
        };

        this.addSubscription(notification, subscription);
        publisher.addSubscriber(notification, subscription);
    }

    /**
     * @inheritDoc
     */
    public override getNbSubscriptions(): number {
        return this.nbSubscriptionRecorded;
    }

    /**
     * @inheritDoc
     */
    public removeSubscription(subscriptionId: string): void {
        this.clearSubscription(subscriptionId);
    }

    /**
     * @inheritDoc
     */
    public waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        const dedicatedSubSubscriber = new Subscriber(
            `wait-until-${notifications.map(item => item.name).join('-and-')}-salt_${salt++}`
        );
        return new Promise((resolve) => {
            Promise.all(
                notifications.map(notification => {
                    const promise: Promise<void> = new Promise((resolve1) => {
                        dedicatedSubSubscriber.subscribe(
                            notification.from,
                            notification.name,
                            () => {
                                resolve1();
                            }
                        );
                    });

                    return promise;
                })
            ).then((data: Array<any>) => {
                // destroy to avoid memory leak with unused references to PublisherInterface from `notification.from`
                dedicatedSubSubscriber.destroy();

                resolve(data);
            });
        });
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[] {
        const subscriptions = this.findSubscriptionsByNotification(notification);

        return subscriptions.filter(subscription => {
            return subscription.publisher_id === publisherId
        });
    }
}

export default Subscriber;
