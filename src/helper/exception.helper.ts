/**
 * This clips the constructor invocation from the stack trace.
 * It's not absolutely essential, but it does make the stack trace a little nicer.
 * @see Node.js reference (bottom)
 * @param targetObject
 * @param constructorOpt
 */
// Disable eslint rule in order to keep same signature as built-in "Error.captureStackTrace"
// eslint-disable-next-line @typescript-eslint/ban-types
export const captureStackTrace = (targetObject: object, constructorOpt?: Function): void => {
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(targetObject, constructorOpt);
    }
}
