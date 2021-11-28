import SubscriptionManagerInterface from "../interfaces/subscription-manager.interface";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import SubscriptionInterface from "../interfaces/subscription.interface";

/**
 * Find a set of subscriptions from a `subscriptionManager` using role and id of another component
 * @param subscriptionManager - subscription source
 * @param role - which role is used by the other component
 * @param componentId - component id
 * @throws InvalidArgumentException - If role is not valid (aka ROLE.PUBLISHER_ID or ROLE.SUBSCRIBER_ID)
 * @return SubscriptionInterface[] - set of subscriptions found
 */
export function findSubscriptionByRoleAndComponentId(
    subscriptionManager: SubscriptionManagerInterface,
    role: string,
    componentId: string
): SubscriptionInterface[] {
    if (role !== ROLE.PUBLISHER_ID && role !== ROLE.SUBSCRIBER_ID) {
        throw new InvalidArgumentException(
            `Invalid argument given for "role" in "findSubscriptionByRoleAndComponentId". Values expected are "publisher_id" or "subscriber_id" but "${role}" was given.`
        );
    }

    return subscriptionManager.getSubscriptions().filter((subscription: SubscriptionInterface) => {
        const id = role === ROLE.PUBLISHER_ID ? subscription.publisher_id : subscription.subscriber_id;
        return id === componentId;
    });
}

/**
 * Role available collection
 */
export const ROLE = {
    PUBLISHER_ID: 'publisher_id',
    SUBSCRIBER_ID: 'subscriber_id',
}
