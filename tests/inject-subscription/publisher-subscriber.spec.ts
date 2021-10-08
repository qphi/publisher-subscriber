import { describe, it } from 'mocha';
import { expect } from  'chai';
import PublisherSubscriber from "../../src/model/publisher-subscriber.model";
// import YamlLoader from "../../../../file-loader/yaml-loader";
import ObjectSubscriptions from './subscriptions/say-hello-subscription';
import { subscribeFromObject } from '../../src/helper/subscriber.helper';

// const loader = new YamlLoader();
// const content = loader.process(resolve(__dirname, './subscriptions/say-hello-subscription.yaml'));



class Prompter extends PublisherSubscriber {
    private counter = 0;
    prompt({ a, b }: {a: any, b: any}) {
        this.counter++;
    }

    getCounter(): number {
        return this.counter;
    }
}

describe('Can subscribe from standard object', () => {
    it('a', () => {
        let publisher = new PublisherSubscriber('publisher' );
        let subscriber = new Prompter('subscriber' );

        subscribeFromObject(subscriber, publisher, ObjectSubscriptions.handler);

        publisher.publish('say-hello', {
            param1: { a: 'abc'},
            param2: 'def'
        });

        expect(subscriber.getCounter()).to.be.equals(1);
    })
});