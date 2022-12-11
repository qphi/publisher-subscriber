import DomainException from "./domain.exception";
/**
 * Thrown when we try to add multiple time same subscription and when duplications are forbidden
 */
export default class SubscriptionAlreadyExistsException extends DomainException {
    constructor(subscriptionId: string, componentId: string);
}
//# sourceMappingURL=subscription-already-exists.exception.d.ts.map