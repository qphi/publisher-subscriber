import DomainException from "./domain.exception";
/**
 * Thrown when fail to found a required subscription
 */
export default class SubscriptionNotFoundException extends DomainException {
    constructor(subscriptionId: string, componentId: string);
}
//# sourceMappingURL=subscription-not-found.exception.d.ts.map