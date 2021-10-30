# Best practices

## Always clear your component properly

As suscription keep references both to publisher and subscriber and other object referenced in subscription handler, be sure to clear your component properly by invoking ``destroy()``  method in order to avoid any memory leaks issues.

```js
const compoment = new PublisherSubcriber('foo');

// component live its own life
compoment.subscribe(/* ... */);
compoment.publish(/* ... */);

// it's time to die

compoment.destroy();
```

?> ``destroy()`` clear all subscriptions from your component and automatically update subscription from related publisher or subscriber.

!> We advise to manually call ``destroy`` method under a ``publisher`` or a ``subscriber`` as soon as you know that it won't be used anymore. In some context, it is not critical cause your instance will automatically be cleared (browser context reset by new navigation).


## Don't speak for others
In subscription handler, you shouldn't let another publisher publish a new notification.
```js
// Naive example of stack-overflow 
// In real world it could be happen when a subscriber handler involve another publication
subscriber.subscribe(publisher, 'hello', () => {
    publisher.publish('hello');    
});

publisher.publish('hello'); 
```

!> Avoid to publish in handler, unless your component implements ``PublisherSubscriberInterface``.

If component is a publisher and subscriber, publishing in subscription handle where it is a subscriber is allowed.

```js
component.subscribe('a-notification', anotherPublisher, () => {
    // ... component own logic ...
    component.publish('my-state-was-upaded');
});
```

?> Publishing new notification in ``PublisherSubscriberInterface``'s subscription handler is a good way to [Build Asynchronous Workflow](documentation/publication#build-asynchronous-workflow).