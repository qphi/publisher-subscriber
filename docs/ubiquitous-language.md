# 📖 Ubiquitous Language

In order to describe how `@qphi/publisher-subscriber` works, some words with a strong semantic will be used. This section provide the right meaning of each word for the followings documentations. 

## Subscriber
Instances that can subscribe to any *notifcation* from *publisher*. Subscriber is one of the two roles actually available in this communication pattern.
<br/>
<br/>
**implementation detail**: 
* `SubscriberInterface` and `PublisherSubscriberInterface` describe this role.
* `Subscriber` and `PublisherSubscriber` class implements this behavior.

## Publisher
Instances that can publish any *notifcation* to *subscriber*. Publisher is one of the two roles actually available in this communication pattern.
<br/>
<br/>
**implementation detail**:
* `PublisherInterface` and `PublisherSubscriberInterface` describe this role.
* `Publisher` and `PublisherSubscriber` class implements this behavior.

## Notification

Is the name given to the message published by publisher. When a subscriber subscribe to publisher, it subscribes to a notification publisher by this publisher.

**implementation detail**:
* it's just a string.

## Subscription

Contract between publisher and subscriber for a given notification. A subscription item contains a handler whose is trigger each time publisher publish the related notification.

**implementation detail**:
* `SubscriptionInterface` describe this data structure.
