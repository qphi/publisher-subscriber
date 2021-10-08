export default interface IdentifiableInterface {
    getId(): string;
    is(id: string): boolean;
}