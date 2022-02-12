import PublisherInterface from "./publisher.interface";
/**
 * Interface describing a publisher that can repeat notification published by another publisher
 */
export default interface PublisherProxyInterface extends PublisherInterface {
    addProxy(publisher: PublisherInterface, notification: string, hook: (payload: any) => any): this;
    removeProxy(publisher: PublisherInterface, notification: string): this;
}
//# sourceMappingURL=publisher-proxy.interface.d.ts.map