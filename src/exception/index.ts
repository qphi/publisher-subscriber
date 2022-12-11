export class DomainException extends Error {}

import {captureStackTrace} from "../helper/exception.helper";


/**
 * Thrown when an argument is not formatted as expected or has forbidden value
 */
export class InvalidArgumentException extends DomainException {
    constructor(message: string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}

/**
 * Thrown when we try to add multiple time same subscription and when duplications are forbidden
 */
export class SubscriptionAlreadyExistsException extends DomainException {
    constructor(subscriptionId: string, componentId: string) {
        super(
            `Unable to add subscription "${subscriptionId}" to component "${componentId}" because it already manage a subscription with same id.`
        );

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}

export class SubscriptionNotFoundException extends DomainException {
    constructor(subscriptionId: string, componentId: string) {
        super(
            `Unable to find subscription with id "${subscriptionId}" in component "${componentId}".`
        );

        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}
