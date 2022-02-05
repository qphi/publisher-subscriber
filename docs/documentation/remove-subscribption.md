# How to remove a subscription?

Removing a subscription is possible at any time. As subscriptions are recorded by both subscriber and publisher you have to be carefull to remove it on each side.
<br/>
That's why instances of `SubscriptionInterface` implement a `unsubscribe()` method which removes subscription from publisher and subscriber in the same time.

Thanks to `SubscriberInterface` it is not necessary to find any `SubscriptionInterface` to remove a subscription. `Subscriber` and `PublisherSubscriber` provide some methods that make the job under the hook.

## One side is enough

Due to `unsubscribe` implementation, you haven't to remove subscription from publisher after called a `subscriber.unsubscribeFrom***`  method.
## Using notification

Assume that you want to remove all subscription from that matches with a specified notification name.
<br/>
<br/>
If subscriber has subscribed with this notification to several publishers all subscription will be removed.
```js
subscriber.subscribe(publisherA, 'some-notification', () => { /* ... */ });
subscriber.subscribe(publisherB, 'some-notification', () => { /* ... */ });
// ...
subscriber.subscribe(publisherZ, 'some-notification', () => { /* ... */ });
subscriber.unsubscribeFromNotification('some-notification');

console.log(subscriber.findSubscriptionsByNotification('some-notification'));
// => []
```

## Using publisher id

It removes all subscription between a subscriber and a publisher.

```js
subscriber.subscribe(publisher, 'some-notification', () => { /* ... */ });
subscriber.subscribe(publisher, 'other-notification', () => { /* ... */ });

subscriber.unsubscribeFromPublisherId(publisher.getId());

console.log(subscriber.findSubscriptionByPublisherId(publisher.getId()));
// => []
```


## Using subscriber id

It removes all subscription between a subscriber and a publisher.

```js
subscriber.subscribe(publisher, 'some-notification', () => { /* ... */ });
subscriber.subscribe(publisher, 'other-notification', () => { /* ... */ });

publisher.removeSubscriber(subscriber.getId());

console.log(subscriber.findSubscriptionByPublisherId(publisher.getId()));
// => []
```

## Using subscription id

In case you know directly the subscription id, you can directly unsubscribe using `unsubscribeFromSubscriptionId`.
```js
const subscriptionId:string = 'your subscription id';
subscriber.unsubscribeFromSubscriptionId(subscriptionId);
```

## Clear all subscriptions

One way to remove all subscriptions from a publisher or subscriber is call ``destroy()`` method. This method should be call each time a publisher or subscriber should be killed. (#see best practices).

```js
// do subscription stuff
subscriber.subscribe(/* ... */);

// subscriber live its own life...

// now it's time to say good-bye
subscriber.destroy(); // => will properly clear all subscriptions!
```
