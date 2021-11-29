import {describe, it} from 'mocha';
import {expect} from 'chai';
import PublisherSubscriber from "../src/model/publisher-subscriber.model";
import Publisher from "../src/model/publisher.model";
import Subscriber from "../src/model/subscriber.model";
import SubscriptionAlreadyExistsException from "../src/exception/subscription-already-exists.exception";
import SubscriptionInterface from "../src/interfaces/subscription.interface";
import SubscriptionNotFoundException from "../src/exception/subscription-not-found.exception";
import {
    DEFAULT_PRIORITY,
    findSubscriptionByRoleAndComponentId,
    HIGH_PRIORITY,
    LOW_PRIORITY
} from "../src/helper/subscription-manager.helper";
import InvalidArgumentException from "../src/exception/invalid-argument.exception";
import SubscriptionManager from "../src/model/subscription-manager.model";

const Message = {
    INVALID_SUBSCRIBER_NUMBER: 'invalid number of subscribers',
    INVALID_SUBSCRIPTION_NUMBER: 'invalid number of subscriptions',
};

describe('PubSub test suite', () => {
    describe('Subscription behavior', () => {
        it('increase subscription counter when adding new subscription', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);

            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
        });
        it('trigger subscriber handler each time that publisher publish a subscribed notification', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let counter = 0;
            subscriber.subscribe(publisher, 'foo', () => {
                counter++
            });
            for (let i = 0; i < 20; ++i) {
                expect(counter).to.equals(i);
                publisher.publish('foo');
                expect(counter).to.equals(i + 1);
            }
        });
        it('allows subscriber to subscribe more than once to same notification published by same publisher', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let aCounter = 0;
            let bCounter = 0;
            let cCounter = 0;
            subscriber.subscribe(publisher, 'foo', () => {
                aCounter++
            });
            subscriber.subscribe(publisher, 'foo', () => {
                bCounter += 2;
                cCounter = bCounter + aCounter
            });
            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(i);
                expect(bCounter).to.equals(2 * i);
                expect(cCounter).to.equals(aCounter + bCounter);
                publisher.publish('foo');
                expect(aCounter).to.equals(i + 1);
                expect(bCounter).to.equals(2 * (i + 1));
                expect(cCounter).to.equals(aCounter + bCounter);
            }
        });
        it('can subscribe to several publisher with same notification name and trigger the right one at each publish', () => {
            let aPublisher = new Publisher('aPublisher');
            let bPublisher = new Publisher('bPublisher');

            let subscriber = new Subscriber('subscriber');

            let aCounter = 0;
            let bCounter = 0;
            subscriber.subscribe(aPublisher, 'foo', () => {
                aCounter++
            });
            subscriber.subscribe(bPublisher, 'foo', () => {
                bCounter++
            });


            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(aPublisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
            expect(bPublisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(i);
                expect(bCounter).to.equals(0);
                aPublisher.publish('foo');

                expect(aCounter).to.equals(i + 1);
                expect(bCounter).to.equals(0);
            }


            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(20);
                expect(bCounter).to.equals(i);
                bPublisher.publish('foo');

                expect(aCounter).to.equals(20);
                expect(bCounter).to.equals(i + 1);
            }
        });
        it('can subscribe to multiples notifications from same publisher', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let fooCounter = 0;
            let barCounter = 0;

            subscriber.subscribe(publisher, 'foo', () => {
                fooCounter++
            });
            subscriber.subscribe(publisher, 'bar', () => {
                barCounter++
            });

            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(0);

            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(1);
        });
        describe('can wait until one notification before run a callback', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let trigger = false;

            it('does not add new subscriptions to subscriber using waitUntil', () => {
                subscriber.waitUntil([
                    {
                        from: publisher,
                        name: 'foo'
                    }
                ]).then(() => {
                    trigger = true;
                });

                expect(subscriber.getNbSubscriptions()).to.equals(0);
            });

            it('add a new subscriptions to publisher', () => {
                expect(publisher.getNbSubscriptions()).to.equals(1);
            });

            it('does not run handler method on declaration', () => {
                expect(trigger).to.be.false;
            });

            it('properly trigger handler and clear additionnals subscriptions', (done) => {
                publisher.publish('foo');

                setTimeout(() => {
                    expect(trigger).to.equals(true);
                    expect(subscriber.getNbSubscriptions()).to.equals(0);
                    expect(publisher.getNbSubscriptions()).to.equals(0);
                    done();
                }, 20);

                // set a short delay, waitUntil might not be so long
            });

            it('works with async/await', async () => {
                // if waitUntil is never resolved, mocha timeout will be triggered and test will fails
                setTimeout(() => {
                    publisher.publish('bar');
                }, 200);
                await subscriber.waitUntil([{
                    from: publisher,
                    name: 'bar'
                }]);
            });
        });
        it('can wait until several notifications from several publisher', (done) => {
            let publisher = new Publisher('publisher');
            let pubsub = new PublisherSubscriber('pubsub');
            let subscriber = new PublisherSubscriber('subscriber');

            let trigger = false;

            subscriber.waitUntil([
                {
                    from: pubsub,
                    name: 'foo'
                },
                {
                    from: pubsub,
                    name: 'bar'
                },
                {
                    from: publisher,
                    name: 'foo'
                }
            ]).then(() => {
                trigger = true;
            });

            publisher.publish('foo');
            pubsub.publish('foo');

            setTimeout(() => {
                expect(trigger).to.be.false;
                pubsub.publish('bar');
                setTimeout(() => {
                    expect(trigger).to.be.true;
                    done();
                }, 20);
            }, 100);
        })
        it('retrieves subscriptions with pubsub', () => {
            const publisher = new Publisher('pub');
            const subscriber = new Subscriber('sub');
            const pubsub = new PublisherSubscriber('pubsub');

            pubsub.subscribe(publisher, 'foo', () => {
            });
            subscriber.subscribe(pubsub, 'bar', () => {
            });

            const fooSub = publisher.getSubscriptions()[0];
            const barSub = subscriber.getSubscriptions()[0];

            expect(pubsub.hasSubscription(fooSub.id)).to.be.true;
            expect(pubsub.hasSubscription(barSub.id)).to.be.true;
        });
    });
    describe('retrieve subscription behavior', () => {
        it('find subscription by notification', () => {
            const s1 = new Subscriber('s1');
            const s2 = new Subscriber('s2');
            const p = new Publisher('p');

            s1.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'bar', () => {
            });


            const s1Foo = s1.findSubscriptionsByNotification('foo');
            const s1Bar = s1.findSubscriptionsByNotification('bar');
            expect(JSON.stringify(s1Foo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(s1Bar)).to.equals('[]');
            const s2Foo = s2.findSubscriptionsByNotification('foo');
            const s2Bar = s2.findSubscriptionsByNotification('bar');
            expect(JSON.stringify(s2Foo)).to.equals('[{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(s2Bar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p","priority":0}]');


            const pFoo = p.findSubscriptionsByNotification('foo');
            const pBar = p.findSubscriptionsByNotification('bar');
            expect(JSON.stringify(pFoo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p","priority":0},{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(pBar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p","priority":0}]');
        });
        it('return empty array if unknown notification is used with findSubscriptionByNotification', () => {
            const subscription = new Subscriber('subscription');
            const publisher = new Publisher('publisher');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(subscription.findSubscriptionsByNotification('nope'))).to.equals('[]');
            expect(JSON.stringify(publisher.findSubscriptionsByNotification('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionsByNotification('nope'))).to.equals('[]');
        });
        it('find subscription by publisher_id', () => {
            const p1 = new Publisher('p1');
            const p2 = new Publisher('p2');

            const subscriber = new Subscriber('subscriber');

            const pubsub = new PublisherSubscriber('pubsub')

            subscriber.subscribe(p1, 'foo', () => {
            });
            subscriber.subscribe(p1, 'bar', () => {
            });
            subscriber.subscribe(p2, 'foo', () => {
            });
            subscriber.subscribe(p2, 'bar', () => {
            });

            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('nope'))).to.equals('[]');
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('p1'))).to.equals('[{"id":"sub_subscriber_to_p1_salt_0","subscriber_id":"subscriber","publisher_id":"p1","priority":0},{"id":"sub_subscriber_to_p1_salt_1","subscriber_id":"subscriber","publisher_id":"p1","priority":0}]');
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('p2'))).to.equals('[{"id":"sub_subscriber_to_p2_salt_2","subscriber_id":"subscriber","publisher_id":"p2","priority":0},{"id":"sub_subscriber_to_p2_salt_3","subscriber_id":"subscriber","publisher_id":"p2","priority":0}]');

            pubsub.subscribe(p1, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('p1'))).to.equals('[{"id":"sub_pubsub_to_p1_salt_0","subscriber_id":"pubsub","publisher_id":"p1","priority":0}]');

            pubsub.subscribe(p2, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('p2'))).to.equals('[{"id":"sub_pubsub_to_p2_salt_1","subscriber_id":"pubsub","publisher_id":"p2","priority":0}]');

            pubsub.subscribe(pubsub, 'loop', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_pubsub_salt_2","subscriber_id":"pubsub","publisher_id":"pubsub","priority":0}]');

            subscriber.subscribe(pubsub, 'toto', () => {
            });
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('pubsub'))).to.equals('[{"id":"sub_subscriber_to_pubsub_salt_4","subscriber_id":"subscriber","publisher_id":"pubsub","priority":0}]');
        });
        it('return empty array if unknown publisher_id is used with findSubscriptionByPublisherId', () => {
            const subscription = new Subscriber('subscription');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(subscription.findSubscriptionByPublisherId('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('nope'))).to.equals('[]');
        });
        it('find subscriptions by notification and publisher_id', () => {
            const s1 = new Subscriber('s1');
            const s2 = new PublisherSubscriber('s2');
            const p = new Publisher('p');
            const p2 = new PublisherSubscriber('p2');

            s1.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'bar', () => {
            });
            s2.subscribe(p2, 'toto', () => {
            });

            const s1Foo = s1.findSubscriptionsByNotificationAndPublisherId('foo', 'p');
            const s1Bar = s1.findSubscriptionsByNotificationAndPublisherId('bar', 'p');
            expect(JSON.stringify(s1Foo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(s1Bar)).to.equals('[]');
            const s2Foo = s2.findSubscriptionsByNotificationAndPublisherId('foo', 'p');
            const s2Bar = s2.findSubscriptionsByNotificationAndPublisherId('bar', 'p');
            expect(JSON.stringify(s2Foo)).to.equals('[{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(s2Bar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p","priority":0}]');

            const s2TotoP = s2.findSubscriptionsByNotificationAndPublisherId('toto', 'p');
            const s2TotoP2 = s2.findSubscriptionsByNotificationAndPublisherId('toto', 'p2');

            expect(JSON.stringify(s2TotoP)).to.equals('[]');
            expect(JSON.stringify(s2TotoP2)).to.equals('[{"id":"sub_s2_to_p2_salt_2","subscriber_id":"s2","publisher_id":"p2","priority":0}]');
        });
        it('find subscriptions by notification and subscriber_id', () => {
            const s1 = new Subscriber('s1');
            const s2 = new PublisherSubscriber('s2');
            const p = new Publisher('p');
            const p2 = new PublisherSubscriber('p2');

            s1.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p2, 'foo', () => {
            });
            s2.subscribe(p2, 'bar', () => {
            });

            const pFoo = p.findSubscriptionsByNotificationAndSubscriberId('foo', 's1');
            const pBar = p.findSubscriptionsByNotificationAndSubscriberId('bar', 's1');

            expect(JSON.stringify(pFoo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p","priority":0}]');
            expect(JSON.stringify(pBar)).to.equals('[]');

            const p2Foo = p2.findSubscriptionsByNotificationAndSubscriberId('foo', 's2');
            const p2BarS1 = p2.findSubscriptionsByNotificationAndSubscriberId('bar', 's1');
            const p2BarS2 = p2.findSubscriptionsByNotificationAndSubscriberId('bar', 's2');

            expect(JSON.stringify(p2Foo)).to.equals('[{"id":"sub_s2_to_p2_salt_0","subscriber_id":"s2","publisher_id":"p2","priority":0}]');
            expect(JSON.stringify(p2BarS1)).to.equals('[]');
            expect(JSON.stringify(p2BarS2)).to.equals('[{"id":"sub_s2_to_p2_salt_1","subscriber_id":"s2","publisher_id":"p2","priority":0}]');
        });
        it('find subscription by subscriber_id', () => {
            const p1 = new Publisher('p1');
            const p2 = new Publisher('p2');

            const subscriber = new Subscriber('subscriber');

            const pubsub = new PublisherSubscriber('pubsub')

            subscriber.subscribe(p1, 'foo', () => {
            });
            subscriber.subscribe(p1, 'bar', () => {
            });
            subscriber.subscribe(p2, 'foo', () => {
            });
            subscriber.subscribe(p2, 'bar', () => {
            });

            expect(JSON.stringify(p1.findSubscriptionBySubscriberId('nope'))).to.equals('[]');

            expect(JSON.stringify(p1.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_p1_salt_0","subscriber_id":"subscriber","publisher_id":"p1","priority":0},{"id":"sub_subscriber_to_p1_salt_1","subscriber_id":"subscriber","publisher_id":"p1","priority":0}]');
            expect(JSON.stringify(p2.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_p2_salt_2","subscriber_id":"subscriber","publisher_id":"p2","priority":0},{"id":"sub_subscriber_to_p2_salt_3","subscriber_id":"subscriber","publisher_id":"p2","priority":0}]');

            subscriber.subscribe(pubsub, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_pubsub_salt_4","subscriber_id":"subscriber","publisher_id":"pubsub","priority":0}]');

            pubsub.subscribe(p2, 'foo', () => {
            });
            expect(JSON.stringify(p2.findSubscriptionBySubscriberId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_p2_salt_0","subscriber_id":"pubsub","publisher_id":"p2","priority":0}]');

            pubsub.subscribe(pubsub, 'loop', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_pubsub_salt_1","subscriber_id":"pubsub","publisher_id":"pubsub","priority":0},{"id":"sub_pubsub_to_p2_salt_0","subscriber_id":"pubsub","publisher_id":"p2","priority":0}]');
        });
        it('return empty array if unknown subscriber_id is used with findSubscriptionBySubscriberId', () => {
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('nope'))).to.equals('[]');
        });
        it('find subscription by subscription_id', () => {
            const subscriber = new Subscriber('subscriber');
            const publisher = new Publisher('publisher')

            subscriber.subscribe(publisher, 'foo', () => {
            });
            const subscription = subscriber.getSubscriptions()[0];

            expect(subscriber.findSubscriptionById(subscription.id)).to.equals(subscription);
            expect(publisher.findSubscriptionById(subscription.id)).to.equals(subscription);
        });
        it('returns null when we an unknown subscription is required by subscription_id', () => {
            const subscriber = new Subscriber('subscriber');
            const publisher = new Publisher('publisher')
            const pubsub = new PublisherSubscriber('publisher')

            expect(subscriber.findSubscriptionById('missing')).to.equals(null);
            expect(publisher.findSubscriptionById('missing')).to.equals(null);
            expect(pubsub.findSubscriptionById('missing')).to.equals(null);
        });
    });
    describe('Unsubscription behavior', () => {
        it('clears one subscription by id', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');


            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);


            const fooSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('foo')[0];
            subscriber.unsubscribeFromSubscriptionId(fooSubscription.id);


            expect(publisher.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);
            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
        });
        it('throws an exception on unsubscribe with unknown subscription id', () => {
            const subscriber = new Subscriber('subscriber');

            expect(subscriber.unsubscribeFromSubscriptionId.bind(subscriber, 'invalidSubscriptId')).to.throw(
                SubscriptionNotFoundException,
                'Unable to find subscription with id "invalidSubscriptId" in component "subscriber".'
            );

            const publisher = new Publisher('bar');
            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.unsubscribeFromSubscriptionId.bind(subscriber, 'bad-id')).to.throw(
                SubscriptionNotFoundException,
                'Unable to find subscription with id "bad-id" in component "subscriber".'
            );

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

        });
        it('removes only one subscription to unsubsribe by subscription id', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let fooCounter = 0;
            let barCounter = 0;

            subscriber.subscribe(publisher, 'foo', () => {
                fooCounter++
            });
            subscriber.subscribe(publisher, 'bar', () => {
                barCounter++
            });

            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(1);

            const fooSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('foo')[0];
            subscriber.unsubscribeFromSubscriptionId(fooSubscription.id);

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(2);

            const barSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('bar')[0];
            subscriber.unsubscribeFromSubscriptionId(barSubscription.id);

            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(2);
        });
        it('clears all subscriptions related to a publisher to unsubscribe by publisher id', () => {
            const pubone = new Publisher('pubone');
            const pubtwo = new Publisher('pubtwo');
            const sub = new Subscriber('sub');
            const pubsub = new PublisherSubscriber('pubsub');

            sub.subscribe(pubone, 'saperlipopette', () => {
            });

            pubsub.subscribe(pubone, 'saperlipopette', () => {
            });

            expect(sub.getNbSubscriptions()).to.equals(1);
            expect(pubone.getNbSubscriptions()).to.equals(2);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            // should does nothing
            sub.unsubscribeFromPublisherId(pubtwo.getId());

            expect(sub.getNbSubscriptions()).to.equals(1);
            expect(pubone.getNbSubscriptions()).to.equals(2);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            sub.subscribe(pubone, 'sacrebleu', () => {
            });
            sub.subscribe(pubtwo, 'fichtre', () => {
            });

            expect(sub.getNbSubscriptions()).to.equals(3);
            expect(pubone.getNbSubscriptions()).to.equals(3);
            expect(pubtwo.getNbSubscriptions()).to.equals(1);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            sub.unsubscribeFromPublisherId(pubone.getId());

            expect(sub.getNbSubscriptions()).to.equals(1);
            expect(pubone.getNbSubscriptions()).to.equals(1);
            expect(pubtwo.getNbSubscriptions()).to.equals(1);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            sub.unsubscribeFromPublisherId(pubtwo.getId());

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pubone.getNbSubscriptions()).to.equals(1);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            pubsub.unsubscribeFromPublisherId(pubone.getId());

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pubone.getNbSubscriptions()).to.equals(0);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(0);
        });
        it('clears all subscriptions relative to a notification', () => {
            const pubone = new Publisher('pubone');
            const pubtwo = new Publisher('pubtwo');
            const sub = new Subscriber('sub');
            const pubsub = new PublisherSubscriber('pubsub');

            sub.subscribe(pubone, 'saperlipopette', () => {
            });

            sub.subscribe(pubtwo, 'saperlipopette', () => {
            });

            pubsub.subscribe(pubone, 'saperlipopette', () => {
            });

            expect(sub.getNbSubscriptions()).to.equals(2);
            expect(pubone.getNbSubscriptions()).to.equals(2);
            expect(pubtwo.getNbSubscriptions()).to.equals(1);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            // should does nothing
            sub.unsubscribeFromNotification('foo');

            expect(sub.getNbSubscriptions()).to.equals(2);
            expect(pubone.getNbSubscriptions()).to.equals(2);
            expect(pubtwo.getNbSubscriptions()).to.equals(1);
            expect(pubsub.getNbSubscriptions()).to.equals(1);


            sub.unsubscribeFromNotification('saperlipopette');

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pubone.getNbSubscriptions()).to.equals(1);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(1);

            pubsub.unsubscribeFromNotification('saperlipopette');

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pubone.getNbSubscriptions()).to.equals(0);
            expect(pubtwo.getNbSubscriptions()).to.equals(0);
            expect(pubsub.getNbSubscriptions()).to.equals(0);
        });
    });
    describe('Publishing workflow', () => {
        it('handle subscription list as a fifo as default', () => {
            const publisher = new Publisher('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');

            let trace = '';

            subscribar.subscribe(publisher, 'foo', () => {
                trace += 'a';
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                trace += 'b';
            });

            publisher.publish('foo');

            expect(trace).to.equals('ab');
        });
        it('publication continues if one subscriber handler throw an error by default', () => {
            const publisher = new Publisher('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');

            let triggered = false;

            subscribar.subscribe(publisher, 'foo', () => {
                throw new Error();
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                triggered = true;
            });

            publisher.publish('foo');

            expect(triggered).to.be.true;
        });
        it('stop or remain publication workflow using stopPublicationOnException and continuePublicationOnException', () => {
            const publisher = new PublisherSubscriber('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');
            const subscribaba = new Subscriber('subscribaba');

            let first = false;
            let third = false;

            publisher.stopPublicationOnException();

            subscribar.subscribe(publisher, 'foo', () => {
                first = true;
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                throw new Error('expected error');
            });

            subscribaba.subscribe(publisher, 'foo', () => {
                third = true;
            });


            expect(publisher.publish.bind(publisher, 'foo')).to.throw(
                Error,
                'expected error'
            );

            expect(first).to.be.true;
            expect(third).to.be.false;

            first = false;

            publisher.continuePublicationOnException();

            publisher.publish('foo');

            expect(first).to.be.true;
            expect(third).to.be.true;
        });
        it('Notification with parameters', () => {
            const publisher = new Publisher('publisher');
            const subscriber = new Subscriber('subscriber');
            let receivedData: any = null;
            subscriber.subscribe(publisher, 'get-my-param', (data: any) => receivedData = data);
            publisher.publish('get-my-param', 'hello');

            expect(receivedData).to.equals('hello');

            publisher.publish('get-my-param', 1);
            expect(receivedData).to.equals(1);

            publisher.publish('get-my-param');
            expect(receivedData).to.be.undefined;

            publisher.publish('get-my-param', null);
            expect(receivedData).to.be.null;

            publisher.publish('get-my-param', NaN);
            expect(receivedData).to.be.NaN;

            publisher.publish('get-my-param', {value: 8});
            expect(receivedData.value).to.equals(8);
        })
        it('works with two pubsub', () => {
            let publisher = new PublisherSubscriber('publisher');
            let subscriber = new PublisherSubscriber('subscriber');
            let counter = 0;


            subscriber.subscribe(publisher, 'aNotification', () => {
                counter++
            });

            expect(subscriber.getNbSubscriptionsAsSubscriber()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(subscriber.getNbSubscriptionsAsPublisher()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);

            expect(publisher.getNbSubscriptionsAsSubscriber()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscriptionsAsPublisher()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('aNotification');
            expect(counter).to.equals(1);
        });
        it('send notification to subscribers according to priorities', function () {
            const sub1 = new Subscriber('sub1');
            const sub2 = new Subscriber('sub2');
            const sub3 = new Subscriber('sub3');
            const sub4 = new Subscriber('sub4');
            const pub = new Publisher('pub');

            let trace = '';

            sub1.subscribe(pub, 'foo', function () {
                trace += "d";
            }, LOW_PRIORITY);


            sub2.subscribe(pub, 'foo', function () {
                trace += "c";
            }, 1);

            sub3.subscribe(pub, 'foo', function () {
                trace += "a";
            }, HIGH_PRIORITY);

            sub4.subscribe(pub, 'foo', function () {
                trace += "b";
            }, DEFAULT_PRIORITY);

            pub.publish('foo');

            expect(trace).to.equals('acbd');
        });
        it('add/remove subscriptions implies reorder subscription list', function () {
            const sub = new Subscriber('sub');
            const sub2 = new Subscriber('sub2');
            const pub = new Publisher('pub');

            let trace = '';

            sub.subscribe(pub, 'foo', function () {
                trace += "d";
            }, LOW_PRIORITY);

            sub2.subscribe(pub, 'foo', function () {
                trace += "a";
            }, HIGH_PRIORITY);

            pub.publish('foo');
            expect(trace).to.equals('ad');

            trace = '';

            sub.subscribe(pub, 'foo', function () {
                trace += "c";
            }, 1);


            pub.publish('foo');
            expect(trace).to.equals('acd');
            trace = '';

            sub2.unsubscribeFromPublisherId('pub');

            sub.subscribe(pub, 'foo', function () {
                trace += "b";
            }, DEFAULT_PRIORITY);

            pub.publish('foo');
            expect(trace).to.equals('cbd');
        });

        it('throws InvalidArgumentException when priority is not a valid number', function () {
            const sub = new Subscriber('sub');
            const pub = new Publisher('pub');

            expect(
                sub.subscribe.bind(
                    sub,
                    pub,
                    'foo',
                    function () {
                        // assume empty callback
                    },
                    NaN
                )
            ).to.throw(
                InvalidArgumentException,
                'Unable to create a subscription with priority "NaN" (typed as "number"). Number value is expected.'
            );

            expect(
                // @ts-ignore
                sub.subscribe.bind(
                    sub,
                    pub,
                    'foo',
                    function () {
                        // assume empty callback
                    },
                    "1"
                )
            ).to.throw(
                InvalidArgumentException,
                'Unable to create a subscription with priority "1" (typed as "string"). Number value is expected.'
            );
        });
    });

    describe('Publisher-Subscriber detect exception and correctly trigger them', () => {
        it('dedupe subscription  by id', () => {
            const publisher = new Publisher('publisher');
            const subscriber = new Subscriber('subscriber');

            subscriber.subscribe(publisher, 'foo', () => {
            });

            const subscriptionInterfaces = subscriber.findSubscriptionsByNotification('foo');

            expect(publisher.addSubscriber.bind(publisher, 'foo', subscriptionInterfaces[0])).to.throw(
                SubscriptionAlreadyExistsException,
                'Unable to add subscription "sub_subscriber_to_publisher_salt_0" to component "publisher" because it already manage a subscription with same id.'
            );

            expect(subscriber.addSubscription.bind(subscriber, 'foo', subscriptionInterfaces[0])).to.throw(
                SubscriptionAlreadyExistsException,
                'Unable to add subscription "sub_subscriber_to_publisher_salt_0" to component "subscriber" because it already manage a subscription with same id.'
            );
        });
    });
    describe('Additionnal tests on subscription-manager.helper', () => {
        it('findSubscriptionByRoleAndComponentId throws an exception with invalid role', () => {
            const pubsub = new PublisherSubscriber('foo');

            expect(findSubscriptionByRoleAndComponentId.bind(
                this,
                pubsub,
                'invalid_role',
                'nevermind'
            )).to.throw(
                InvalidArgumentException,
                'Invalid argument given for "role" in "findSubscriptionByRoleAndComponentId". Values expected are "publisher_id" or "subscriber_id" but "invalid_role" was given.'
            );
        });
        it('clear all subscriptions property using destroy', () => {
            const pub = new Publisher('pub');
            const sub = new Subscriber('sub');

            sub.subscribe(pub, 'foo', () => {
            });
            sub.subscribe(pub, 'bar', () => {
            });

            expect(sub.getNbSubscriptions()).to.equals(2);
            expect(pub.getSubscriptions().length).to.equals(2);

            sub.destroy();

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pub.getSubscriptions().length).to.equals(0);
        });
        it('implements identifiable correctly', () => {
            const pub = new Publisher('pub');
            const sub = new Subscriber('sub');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(pub.getId()).to.equals('pub');
            expect(sub.getId()).to.equals('sub');
            expect(pubsub.getId()).to.equals('pubsub');

            expect(pub.is(sub.getId())).to.be.false;
            expect(pub.is(pubsub.getId())).to.be.false;
            expect(pub.is(pub.getId())).to.be.true;
            expect(sub.is(pub.getId())).to.be.false;
            expect(sub.is(pubsub.getId())).to.be.false;
            expect(sub.is(sub.getId())).to.be.true;
            expect(pubsub.is(pub.getId())).to.be.false;
            expect(pubsub.is(sub.getId())).to.be.false;
            expect(pubsub.is(pubsub.getId())).to.be.true;
        });
        it('throws an error when we try to clear an unknown subscription', () => {
            class TestSubscriptionManager extends SubscriptionManager {
                testClearSubscription(subscriptionId: string) {
                    this.clearSubscription(subscriptionId);
                }
            }

            const tsm = new TestSubscriptionManager('tsm');

            expect(
                tsm.testClearSubscription.bind(tsm, 'toto')
            ).to.throws(
                SubscriptionNotFoundException,
                'Unable to find subscription with id "toto" in component "tsm".'
            );
        });
    });
    describe('Additionnal tests for pubusb', () => {
        it('unsubscribe', () => {
            const foo = new PublisherSubscriber('foo');

            foo.subscribe(foo, 'zoo', () => {
            });
            foo.destroy();

            expect(foo.getSubscriptions().length).to.equals(0);


            foo.subscribe(foo, 'zoo', () => {
            });
            foo.unsubscribeFromNotification('zoo');

            expect(foo.getSubscriptions().length).to.equals(0);

            foo.subscribe(foo, 'zoo', () => {
            });
            foo.unsubscribeFromPublisherId(foo.getId());
            expect(foo.getSubscriptions().length).to.equals(0);

            foo.subscribe(foo, 'zoo', () => {
            });
            foo.unsubscribeFromSubscriptionId(foo.getSubscriptions()[0].id);
            expect(foo.getSubscriptions().length).to.equals(0);

            const bar = new PublisherSubscriber('bar');
            foo.subscribe(bar, 'hello', () => {
            });
            foo.unsubscribeFromPublisherId('bar');


            expect(foo.getSubscriptions().length).to.equals(0);
            expect(bar.getSubscriptions().length).to.equals(0);
        });
        it('works with wait until', () => {

        })
    });
});