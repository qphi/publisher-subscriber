import {captureStackTrace} from "../helper/exception.helper";

/**
 * Thrown when we try to add multiple time same subscription and when duplications are forbidden
 */
export default class SubscriptionAlreadyExistsException extends Error {
    constructor(subscriptionId: string, componentId: string) {
        super(
            `Unable to add subscription "${subscriptionId}" to component "${componentId}" because it already manage a subscription with same id.`
        );

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}
