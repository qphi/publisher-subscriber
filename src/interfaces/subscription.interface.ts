/**
 * Definition of a subscription
 */
interface SubscriptionInterface {
    id: string;
    publisher_id: string;
    subscriber_id: string;

    /** callback to trigger each time publisher publish the right notification */
    handler: (payload: any) => void;

    /** call it to properly remove a subscription */
    unsubscribe: () => void;
}


export default SubscriptionInterface;