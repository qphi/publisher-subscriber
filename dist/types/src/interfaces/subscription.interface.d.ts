/**
 * Definition of a subscription
 */
interface SubscriptionInterface {
    id: string;
    publisher_id: string;
    subscriber_id: string;
    /** callback to trigger each time publisher publish the right notification */
    handler: (payload: any) => void;
    priority: number;
    /** call it to properly remove a subscription */
    unsubscribe: () => void;
}
export default SubscriptionInterface;
//# sourceMappingURL=subscription.interface.d.ts.map