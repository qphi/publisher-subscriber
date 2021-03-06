# Publish in depth
 

## Synchronous first

When a publisher publish a notification, it will retrieve all subscriptions bound to this notification and invoke them handler synchronously.
<br/>
<br/>
You can add a subscription at any time by calling `subscribe` method over any subscriber.
```ts
public subscribe(
    publisher: PublisherInterface,
    notification: string,
    handler: (payload: any) => void,
    priority: number = DEFAULT_PRIORITY
): void;
```
It is possible to make some async stuff into handler, but conceptually publisher shouldn't wait until a subscriber end its own handler execution before notify another subscriber.

```js
foo.subscribe('ping', publisher, () => {
    console.log('foo-sync ping')
    setTimeout(() => {
        console.log('foo-async ping');
    }, 1000);
});

bar.subscribe('ping', publisher, () => {
    console.log('bar ping');
});

publisher.publish('ping');

// => foo-sync ping
// => bar-sync ping
// => foo-async ping
```

[comment]: <> (## Scheduling subscriber)

[comment]: <> (A complex application might publish a lot of notifications. Each component can subscribe to theses notifications and plug any piece of code.<br/>)

[comment]: <> (<br/>)

## Using priority

If different subscriber listen to the same notification (published by same publisher), their order is defined by the **priority** parameter of `subscribe` method. This value is a positive or negative integer which defaults to `0`. The higher the number, the earlier the method is called.

```ts 
const pub = new Publisher('pub');
const subfoo = new Subscriber('subfoo');
const subbar = new Subscriber('subbar');

let trace = '';

subbar.subscribe(pub, 'hello', () => {
    trace += 'bar';
}, 10);

subfoo.subscribe(pub, 'hello', () => {
    trace += 'foo';
}, 20);

pub.publish('hello');
// console.log(trace) ==> "foobar"
```
## Build Asynchronous Workflow

Sometimes, you could want to bind async behavior to a subscription and wait until this job is done before notify next subscriber.


?> In this scenario, we want generate a new picture thumbnail when a user update its profile picture and then purge the related cache.

```js
imageService.subscribe('user.profile.picture.updated', userService, async (user) => {
    await imageService.generateThumbnail(user.getProfilePicture());
});

imageCacheService.subscribe('user.profile.picture.updated', userService, user => {
    imageCacheService.purgeProfileThumbnail(user.getId())
});

userService.publish('user.profile.picture.updated', user);
```
<br/>

Due to strictly synchronous nature of ``publish`` method, this code won't work as expected. Indeed, even if ``imageService`` is notified before `imageCacheService`, purge method could be performed before the end of thumb generation. Depending on your implementation, this scenario could throw error or re-cache some outdated thumb version.
<br/>
<br/>
To build this kind of solution, the better way is to decoupling the underlying event in two distincts notifications: 
* User has updated new profile picture or ``user.profile.picture.updated``
* New thumb is available for this user or ``image.updated``

<br/>

```js
imageService.subscribe('user.profile.picture.updated', userService, async (user) => {
    await imageService.generateThumbnail(user.getProfilePicture());
    imageService.publish('image.updated', user.getId());
});

imageCacheService.subscribe('image.updated', imageService, imageId => {
    imageCacheService.purgeProfileThumbnail(imageId)
});

userService.publish('user.profile.picture.updated', user);
```

Note that decoupling event involve service decoupling. Indeed, ``imageCacheService`` has now no reason to depends on ``userService`` .

## Waiting for multiples notifications

Building complex workflow, you may wait for multiples notifications from multiples publisher. In this case you should use ``waitUntil`` method and specify notifications as an array.

```js
subscriber.waitUntil([
    {
        from: publisher,
        name: 'foo'
    },

    {
        from: anotherPublisher,
        name: 'bar'
    }
]).then(parameters => {
    console.log(parameters);
})

publisher.publish('foo', 'hello');
// ==> nothing happen yet

anotherPublisher.publish('bar', 'world');
// ==> [ 'hello', 'world' ]
```
`waitUntil` returns a `Promise` and use `Promise.all` under the hood. The order of parameters depends on notification array order.
?> Note that subscriptions added by waitUntil are automatically clear once handler is trigger.

## Deal With Errors

If a subscription handle throw an error, publisher will catch and mute it by default. According to the sequential publication constraint and separation of concern principle, an exception into subscription's handler shouldn't impact other subscribers job.
<br/>
<br/>
You can change this behavior at any time using ``stopPublicationOnException`` or ``continuePublicationOnException`` methods.
<br/>
<br/>

Once ``stopPublicationOnException()`` was called, exceptions will still be catched by publisher, but automatically rethrow then.

```js
subscriberA.subscribe('foo', publisher, () => {
    console.log('hello');
    throw new Error();
});

subscriberB.subscribe('foo', publisher, () => {
    console.log('world');
});

publisher.publish('foo');

// by default error are muted.
// console prompt: hello world

publisher.stopPublicationOnException();

publisher.publish('foo');
// console prompt: hello
// => error is thrown !
```
?> To customize error handling behavior with more specific job, you can extend ``publisher`` class and overwrite ``publish`` method.

?> Once you change default behavior with ``stopPublicationOnException`` you can restore default behavior with ``continuePublicationOnException``.
