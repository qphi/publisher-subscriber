import PublisherSubscriberInterface from "../interfaces/publisher-subscriber.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import Publisher from "./publisher.model";
import Subscriber from "./subscriber.model";
import SubscriberInterface from "../interfaces/subscriber.interface";
import NotificationRecord from "../interfaces/notification-record.interface";
import {findSubscriptionByRoleAndComponentId, ROLE} from "../helper/subscription-manager.helper";
import { SubscriptionNotFoundException } from "../exception/index";
import PublisherProxyInterface from "../interfaces/publisher-proxy.interface";

/**
 * Define instance that can publish notification and handle notification from publisher
 */
class PublisherSubscriber implements PublisherSubscriberInterface, PublisherProxyInterface {
    private readonly id: string;
    private readonly publisher: PublisherInterface;
    private readonly subscriber: SubscriberInterface;
    /**
     * Map<publisherId, subscriptionId[]>
     * @private
     */
    private readonly proxies: Map<string, Set<string>> = new Map<string, Set<string>>();

    private readonly removedSelfSubscription = new Set<string>();

    constructor(id: string) {
        this.id = id;

        this.publisher = new Publisher(id);
        this.subscriber = new Subscriber(id);
    }

    /**
     * @inheritDoc
     */
    public hasSubscription(subscriptionId: string): boolean {
        return (
            this.subscriber.hasSubscription(subscriptionId) ||
            this.publisher.hasSubscription(subscriptionId)
        );
    }

    /**
     * @inheritDoc
     */
    public addSubscriber(notification: string, subscription: SubscriptionInterface): void {
        this.publisher.addSubscriber(notification, subscription);
    }

    /**
     * @inheritDoc
     */
    public removeSubscriber(subscriptionId: string): void {
        this.publisher.removeSubscriber(subscriptionId);
    }

    /**
     * @inheritDoc
     */
    public getNbSubscriptionsAsPublisher(): number {
        return this.publisher.getNbSubscriptions();
    }

    /**
     * @inheritDoc
     */
    public getNbSubscriptionsAsSubscriber(): number {
        return this.subscriber.getNbSubscriptions();
    }

    /**
     * @inheritDoc
     */
    public publish(notification: string, data?: any): void {
        this.publisher.publish(notification, data);
    }

    /**
     * @inheritDoc
     */
    public getId(): string {
        return this.id;
    }

    /**
     * @inheritDoc
     */
    public subscribe(
        publisher: PublisherInterface,
        notification: string,
        handler: (payload: any) => void,
        priority?: number
    ): SubscriptionInterface {
        return this.subscriber.subscribe.apply(this, [publisher, notification, handler, priority]);
    }

    /**
     * @inheritDoc
     */
    public getNbSubscriptions(): number {
        return this.subscriber.getNbSubscriptions();
    }

    /**
     * @inheritDoc
     */
    public removeSubscription(subscriptionId: string): void {
        this.subscriber.removeSubscription(subscriptionId);
    }

    /**
     * @inheritDoc
     */
    public addSubscription(notification: string, subscription: SubscriptionInterface): void {
        this.subscriber.addSubscription(notification, subscription);
    }

    /**
     * @inheritDoc
     */
    public waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        return this.subscriber.waitUntil(notifications);
    }

    /**
     * @inheritDoc
     */
    public destroy(): void {
        this.publisher.destroy();
        this.subscriber.destroy();
    }

    /**
     * @inheritDoc
     */
    public is(id: string): boolean {
        return this.id === id;
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionById(subscriptionId: string): SubscriptionInterface | null {
        return (
            this.subscriber.findSubscriptionById(subscriptionId) ||
            this.publisher.findSubscriptionById(subscriptionId)
        );
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[] {
        return this.subscriber.findSubscriptionsByNotificationAndPublisherId(notification, publisherId);
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionsByNotification(notification: string): SubscriptionInterface[] {
        return this.subscriber.findSubscriptionsByNotification(notification).concat(
            this.publisher.findSubscriptionsByNotification(notification)
        );
    }

    /**
     * @inheritDoc
     */
    public getSubscriptions(): SubscriptionInterface[] {
        return this.subscriber.getSubscriptions().concat(this.publisher.getSubscriptions());
    }

    /**
     * @inheritDoc
     */
    public unsubscribeFromNotification(notification: string): void {
        this.subscriber.unsubscribeFromNotification(notification);
    }

    /**
     * @inheritDoc
     */
    public unsubscribeFromPublisherId(publisherId: string): void {
        this.subscriber.unsubscribeFromPublisherId(publisherId);
    }

    /**
     * @inheritDoc
     */
    public unsubscribeFromSubscriptionId(subscriptionId: string): void {
        this.subscriber.unsubscribeFromSubscriptionId(subscriptionId);
    }

    /**
     * @inheritDoc
     */
    public continuePublicationOnException(): void {
        this.publisher.continuePublicationOnException();
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[] {
        const subscriptions = this.subscriber.findSubscriptionByPublisherId(publisherId).concat(
            findSubscriptionByRoleAndComponentId(
                this.publisher,
                ROLE.PUBLISHER_ID,
                publisherId
            )
        );

        if (publisherId === this.getId()) {
            return Array.from(new Set(subscriptions));
        }

        // Cause a PubSub can subscribe to itself, we have to dedupe the following subscriptions
        return subscriptions;
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[] {
        return this.publisher.findSubscriptionsByNotificationAndSubscriberId(notification, subscriberId);
    }

    /**
     * @inheritDoc
     */
    public findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[] {
        const subscriptions = this.publisher.findSubscriptionBySubscriberId(subscriberId).concat(
            findSubscriptionByRoleAndComponentId(
                this.subscriber,
                ROLE.SUBSCRIBER_ID,
                subscriberId
            )
        );

        if (subscriberId === this.getId()) {
            return Array.from(new Set(subscriptions));
        }

        // Cause a PubSub can subscribe to itself, we have to dedupe the following subscriptions
        return subscriptions;
    }

    /**
     * @inheritDoc
     */
    public stopPublicationOnException(): void {
        this.publisher.stopPublicationOnException();
    }

    /**
     * @inheritDoc
     */
    public clearSubscription(subscriptionId: string): void {
        // due to symmetric unsubscribe process, a self-subscribed-pub/sub will call clearSubscription twice
        // this mechanism prevent SubscriptionNotFoundError
        if (this.removedSelfSubscription.has(subscriptionId)) {
            this.removedSelfSubscription.delete(subscriptionId);
            return;
        }

        const subscription = this.findSubscriptionById(subscriptionId);

        if (subscription === null) {
            throw new SubscriptionNotFoundException(subscriptionId, this.getId());
        }

        if (subscription?.subscriber_id === this.subscriber.getId()) {
            this.subscriber.clearSubscription(subscriptionId);
        }

        if (subscription?.publisher_id === this.publisher.getId()) {
            this.publisher.clearSubscription(subscriptionId);
        }

        if (subscription?.publisher_id === subscription?.subscriber_id) {
            this.removedSelfSubscription.add(subscriptionId);
        }
    }

    public addProxy(publisher: PublisherInterface, notification: string, hook: (payload: any) => any = payload => {
        return payload
    }): this {
        const publisherProxies = this.getPublisherProxies(publisher.getId());
        const subscription = this.subscribe(
            publisher,
            notification,
            payload => {
                this.publish(notification, hook(payload));
            }
        );

        publisherProxies.add(subscription.id);

        this.proxies.set(
            publisher.getId(),
            publisherProxies
        );

        return this;
    }

    private getPublisherProxies(publisherId: string): Set<string> {
        return  this.proxies.get(publisherId) ?? new Set<string>();
    }

    public removeProxy(publisher: PublisherInterface, notification: string): this {
        const potentialProxies = this.findSubscriptionsByNotificationAndPublisherId(notification, publisher.getId());
        const publisherProxies = this.getPublisherProxies(publisher.getId());
        const proxyIds = potentialProxies.filter(subscription => publisherProxies.has(subscription.id));

        proxyIds.forEach(subscriptionProxy => {
            this.unsubscribeFromSubscriptionId(subscriptionProxy.id);
            publisherProxies.delete(subscriptionProxy.id);
        });

        return this;
    }

}

export default PublisherSubscriber;
