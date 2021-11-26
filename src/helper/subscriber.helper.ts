import FlexibleService from "../../lib/flexible.service";
import MixedInterface from "../../lib/mixed.interface";
import SubscriberInterface from "../interfaces/subscriber.interface";
import PublisherInterface from "../interfaces/publisher.interface";
const flexible = new FlexibleService();

/**
 * Definition of a subscription, contain the notification name and handler configuration
 * @alpha
 */
interface SubscriptionObjectEntryInterface {
    notification: string
    action: string,
    mapAttributes?: Record<string, any>
}

/**
 * Create and add subscriptions between publisher and subscriber using a "subscription configuration object"
 * @param subscriber - the subscriber
 * @param publisher - the publisher
 * @param subscriptions - object containing definition of subscription aka notification and handler configuration
 * @alpha
 */
export function subscribeFromObject(
    subscriber: SubscriberInterface,
    publisher: PublisherInterface,
    subscriptions: SubscriptionObjectEntryInterface[]
) {
    Object.values(subscriptions).forEach((subscription: SubscriptionObjectEntryInterface) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const action: any = subscriber[subscription.action];
        if (typeof action === 'function') {
            const callback = action.bind(subscriber);
            subscriber.subscribe(
                publisher,
                subscription.notification,
                // don't need to know the typeof data cause we'll pick only properties specified by the SubscriptionObjectEntryInterface
                (data: any) => {
                    const parameters: MixedInterface = {};
                    if (typeof subscription.mapAttributes !== 'undefined') {
                        const mappage =  subscription.mapAttributes;
                        Object.keys(mappage).forEach(attributeName => {
                            const propertyToRetrieve: string = mappage[attributeName] ?? '';
                            parameters[attributeName] = flexible.get(
                                propertyToRetrieve,
                                data
                            );
                        });


                        callback(parameters);
                    }

                    else {
                        callback(data);
                    }
                }

            )
        }

    });
}