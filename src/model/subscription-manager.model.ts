import SubscriptionManagerInterface from "../interfaces/subscription-manager.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
import SubscriptionAlreadyExistsException from "../exception/subscription-already-exists.exception";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";

/**
 * Define instance that can manage subscription collection
 */
export default class SubscriptionManager implements SubscriptionManagerInterface {
    private subscriptionsList: Record<string, string> = {};
    protected notificationsCollection: Record<string, Array<SubscriptionInterface>> = {};
    protected nbSubscriptionRecorded: number = 0;
    private readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    /**
     * @inheritDoc
     */
    getSubscriptions(): SubscriptionInterface[] {
        // flatten all subscriptions
        return [].concat.apply([], Object.values(this.notificationsCollection))
    }

    /**
     * @inheritDoc
     */
    getNbSubscriptions(): number {
        return this.nbSubscriptionRecorded;
    }

    /**
     * @inheritDoc
     */
    hasSubscription(subscriptionId: string): boolean {
        return typeof this.subscriptionsList[subscriptionId] !== 'undefined';
    }

    /**
     * Bind a subscription to a notification
     * @param subscriptionId - subscription id
     * @param notification - notification name
     */
    recordSubscription(subscriptionId: string, notification: string): void {
        this.subscriptionsList[subscriptionId] = notification;
    }


    private findSubscriptionIndexById(subscriptionId: string): {index: number, notification: string } {
        const notificationName = this.subscriptionsList[subscriptionId];
        let subscriptionIndex = {
            index: -1,
            notification: notificationName ?? ''
        };


        if (typeof notificationName === 'undefined') {
            return subscriptionIndex;
        }

        const notifications = this.notificationsCollection[notificationName];

        if (Array.isArray(notifications)) {
            subscriptionIndex.index = notifications.findIndex(
                (recordedSubscription: SubscriptionInterface) => {
                    return recordedSubscription.id = subscriptionId;
                }
            );
        }

        return subscriptionIndex;
    }

    /**
     * @inheritDoc
     */
    findSubscriptionById(subscriptionId: string): SubscriptionInterface | null {
        const subscriptionIndex = this.findSubscriptionIndexById(subscriptionId);

        if (subscriptionIndex.index < 0) {
            return  null;
        }

        else {
            return this.notificationsCollection[subscriptionIndex.notification][subscriptionIndex.index];
        }
    }

    /**
     * @inheritDoc
     */
    findSubscriptionsByNotification(notification: string): Array<SubscriptionInterface> {
        return this.notificationsCollection[notification] || [];
    }

    /**
     * Remove subscription from subscription list. Cause subscription might involve memory leak you shouldn't invoke this method manually. Let sub-class implements properly its own logic and prevent memory leak at this time.
     * @param subscriptionId
     * @throws SubscriptionNotFoundException - when subscription was not found
     * @protected
     */
    protected clearSubscription(subscriptionId: string):void {
        const subscriptionIndex = this.findSubscriptionIndexById(subscriptionId);

        if (subscriptionIndex.index < 0) {
            throw new SubscriptionNotFoundException(subscriptionId, this.getId());
        }
        else {
            const notifications = this.notificationsCollection[subscriptionIndex.notification];
            const removedSubscription: SubscriptionInterface = notifications.splice(
                subscriptionIndex.index,
                1
            )[0];

            // // handler may contains some references to existing objects.
            // // by deleting reference to this function, all reference into function will be destroyed
            // // it could prevent some memory leaks
            if (typeof removedSubscription.handler === 'function') {
                // @ts-ignore
                delete removedSubscription.handler;
            }

            delete this.subscriptionsList[subscriptionId];
            this.nbSubscriptionRecorded--;

            if (this.notificationsCollection[subscriptionIndex.notification].length === 0) {
                delete this.notificationsCollection[subscriptionIndex.notification];
            }
        }
    }

    /**
     * Add properly a subscription to subscription collection
     * @param notification
     * @param subscription
     * @throws SubscriptionAlreadyExistsException - when a subscription with same id was already added
     */
    addSubscription(notification: string, subscription: SubscriptionInterface): void {
        if (Array.isArray(this.notificationsCollection[notification]) !== true) {
            this.notificationsCollection[notification] = [];
        }

        if (!this.hasSubscription(subscription.id)) {
            this.notificationsCollection[notification].push(subscription);
            this.recordSubscription(subscription.id, notification);
            this.nbSubscriptionRecorded++;
        }

        else {
            throw new SubscriptionAlreadyExistsException(subscription.id, this.getId());
        }
    }

    /**
     * @inheritDoc
     */
    getId(): string {
        return this.id;
    }

    /**
     * @inheritDoc
     */
    is(id: string): boolean {
        return id === this.getId();
    }

    /**
     * Clear all subscriptions properly
     */
    destroy(): void {
        Object.values(this.notificationsCollection).forEach(subscriptionsType => {
            subscriptionsType.forEach(
                (subscription: SubscriptionInterface) => subscription.unsubscribe()
            )
        });
    }
}