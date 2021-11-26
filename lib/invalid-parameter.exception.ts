export default class InvalidParameterException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParameterException';
    }
}