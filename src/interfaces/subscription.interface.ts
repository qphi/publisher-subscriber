interface SubscriptionInterface {
    id: string;
    publisher_id: string;
    subscriber_id: string;
    handler: Function;
    unsubscribe: Function;
}


export default SubscriptionInterface;