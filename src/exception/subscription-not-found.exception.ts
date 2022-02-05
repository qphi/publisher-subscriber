import {captureStackTrace} from "../helper/exception.helper";

/**
 * Thrown when fail to found a required subscription
 */
export default class SubscriptionNotFoundException extends Error {
    constructor(subscriptionId: string, componentId: string) {
        super(
            `Unable to find subscription with id "${subscriptionId}" in component "${componentId}".`
        );

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}
