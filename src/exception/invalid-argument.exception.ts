import {captureStackTrace} from "../helper/exception.helper";

/**
 * Thrown when an argument is not formatted as expected or has forbidden value
 */
export default class InvalidArgumentException extends Error {
    constructor(message: string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        captureStackTrace(this, this.constructor);
    }
}
