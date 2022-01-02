/**
 * Thrown when we try to add multiple time same subscription and when duplications are forbidden
 */
export default class SubscriptionAlreadyExistsException extends Error {
    constructor(subscriptionId: string, componentId: string);
}
//# sourceMappingURL=subscription-already-exists.exception.d.ts.map