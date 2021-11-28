/**
 * An object with an id
 */
export default interface IdentifiableInterface {
    /**
     * @return id - the instance id
     */
    getId(): string;

    /**
     * Check if a given id is equals to its own instance id
     * @param id id to check
     * @return true - if id is equals to its own instance id
     */
    is(id: string): boolean;
}
