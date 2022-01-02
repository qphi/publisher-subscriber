import SubscriptionManagerInterface from "../interfaces/subscription-manager.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
/**
 * Find a set of subscriptions from a `subscriptionManager` using role and id of another component
 * @param subscriptionManager - subscription source
 * @param role - which role is used by the other component
 * @param componentId - component id
 * @throws InvalidArgumentException - If role is not valid (aka ROLE.PUBLISHER_ID or ROLE.SUBSCRIBER_ID)
 * @return SubscriptionInterface[] - set of subscriptions found
 */
export declare function findSubscriptionByRoleAndComponentId(subscriptionManager: SubscriptionManagerInterface, role: string, componentId: string): SubscriptionInterface[];
/**
 * Role available collection
 */
export declare const ROLE: {
    PUBLISHER_ID: string;
    SUBSCRIBER_ID: string;
};
export declare const LOW_PRIORITY = -100;
export declare const DEFAULT_PRIORITY = 0;
export declare const HIGH_PRIORITY = 100;
//# sourceMappingURL=subscription-manager.helper.d.ts.map