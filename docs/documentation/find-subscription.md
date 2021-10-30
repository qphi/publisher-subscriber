# How to find a subscription?

When a subscriber subscribe to publisher, a subscription (aka an instance of `SubscriptionInterface`)  will be created under the hood.<br/>
Retrieve these subscriptions is possible at any time. It could be useful if you want, for example, prevent susbcribing multiple times to same publisher with a given notification.

## Get all subscriptions

`getSubscriptions` returns an array with a reference to all subscriptions bound to your publisher or subscriber.

```js
const subscriptions = publisherSubscriber.getSubscriptions();
```
This method is available with instance of `PublisherInterface` and `SubscriberInterface`.


## Using notification

As publisher or subscriber can contract several subscriptions for a given notification, `findSubscriptionsByNotification` returns an array of subscriptions (eventually empty).
```js
const subscriptions = publisherSubscriber.findSubscriptionsByNotification('a-notification');
```
This method is available with instance of `PublisherInterface` and `SubscriberInterface`.
<br/>

## Using subscription id

When you only know the subscription id and want to find the related subscription object, consider `findSusbsciptionById`. It returns a subscription object or null if no subscription was found.<br/>
<br/>
```js
const subscription = publisherSubscriber.findSubscriptionById('some-subscription-id');
```
This method is available with instance of `PublisherInterface` and `SubscriberInterface`.
<br/>

## Using publisher id

`findSubscriptionByPublisherId` finds all subscription between a subscriber and a publisher and returns an array of subscription (eventually empty)`.

```js
const subscriptions = subscriber.findSubscriptionByPublisherId(publisher.getId());
```

This method is available with instance of `SubscriberInterface`.
<br/>

## Using subscriber id

`findSubscriptionBySubscriberId` finds all subscription between a subscriber and a publisher and returns an array of subscription (eventually empty)`.

```js
const subscriptions = publisher.findSubscriptionBySubscriberId(publisher.getId());
```

This method is available with instance of `PublisherInterface`.
<br/>

## Using publisher id and notification together 

Combine the behavior of `findSubscriptionsByNotification` and `findSubscriptionsByPublisherId`.

```js
const subscriptions = subscriber.findSubscriptionsByNotificationAndPublisherId('notification', publisher.getId());
```
This method is available with instance of `SubscriberInterface`.
<br/>

## Using subscriber id and notification together 

Combine the behavior of `findSubscriptionsByNotification` and `findSubscriptionsBySubscriberId`.

```js
const subscriptions = publisher.findSubscriptionsByNotificationAndSubscriberId('notification', subscriber.getId());
```

This method is available with instance of `PublisherInterface`.