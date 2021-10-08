import FlexibleService from "../../lib/flexible.service";
import MixedInterface from "../../lib/mixed.interface";
import SubscriberInterface from "../interfaces/subscriber.interface";
import Publisher from "../model/publisher.model";
import PublisherInterface from "../interfaces/publisher.interface";
const flexible = new FlexibleService();

interface SubscriptionObjectEntryInterface {
    notification: string
    action: string,
    mapAttributes?: Record<string, any>
}

export function subscribeFromObject(
    subscriber: SubscriberInterface,
    publisher: PublisherInterface,
    subscriptions: SubscriptionObjectEntryInterface[]
) {
    Object.values(subscriptions).forEach((subscription: SubscriptionObjectEntryInterface) => {
        // @ts-ignore
        const action: any = subscriber[subscription.action];
        if (typeof action === 'function') {
            const callback = action.bind(subscriber);
            subscriber.subscribe(
                publisher,
                subscription.notification,
                (data: any) => {
                    let parameters: MixedInterface = {};
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