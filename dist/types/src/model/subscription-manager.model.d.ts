import SubscriptionManagerInterface from "../interfaces/subscription-manager.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
/**
 * Define instance that can manage subscription collection
 */
export default class SubscriptionManager implements SubscriptionManagerInterface {
    private subscriptionsList;
    protected notificationsCollection: Record<string, Array<SubscriptionInterface>>;
    protected nbSubscriptionRecorded: number;
    private readonly id;
    constructor(id: string);
    /**
     * @inheritDoc
     */
    getSubscriptions(): SubscriptionInterface[];
    /**
     * @inheritDoc
     */
    getNbSubscriptions(): number;
    /**
     * @inheritDoc
     */
    hasSubscription(subscriptionId: string): boolean;
    /**
     * Bind a subscription to a notification
     * @param subscriptionId - subscription id
     * @param notification - notification name
     */
    recordSubscription(subscriptionId: string, notification: string): void;
    private findSubscriptionIndexById;
    /**
     * @inheritDoc
     */
    findSubscriptionById(subscriptionId: string): SubscriptionInterface | null;
    /**
     * @inheritDoc
     */
    findSubscriptionsByNotification(notification: string): Array<SubscriptionInterface>;
    /**
     * Remove subscription from subscription list.
     * Cause subscription might involve memory leak you shouldn't invoke this method manually.
     * Let sub-class implements properly its own logic and prevent memory leak at this time.
     * @param subscriptionId
     * @throws SubscriptionNotFoundException - when subscription was not found
     * @internal
     */
    clearSubscription(subscriptionId: string): void;
    /**
     * Add properly a subscription to subscription collection
     * @param notification
     * @param subscription
     * @throws SubscriptionAlreadyExistsException - when a subscription with same id was already added
     */
    addSubscription(notification: string, subscription: SubscriptionInterface): void;
    /**
     * @inheritDoc
     */
    getId(): string;
    /**
     * @inheritDoc
     */
    is(id: string): boolean;
    /**
     * Clear all subscriptions properly
     */
    destroy(): void;
}
//# sourceMappingURL=subscription-manager.model.d.ts.map