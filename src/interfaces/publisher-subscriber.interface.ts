import PublisherInterface from "./publisher.interface";
import SubscriberInterface from "./subscriber.interface";

interface PublisherSubscriberInterface extends PublisherInterface, SubscriberInterface {
    getNbSubscriptionsAsSubscriber(): number;
    getNbSubscriptionsAsPublisher(): number;
}

export default PublisherSubscriberInterface;