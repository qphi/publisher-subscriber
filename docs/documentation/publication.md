# Publish in depth

## Synchronous first

When a publisher publish a notification, it will retrieve all subscriptions bound to this notification and invoke them handler synchronously.
<br/>
<br/>
It is possible to make some async stuff into handler, but conceptually publisher shouldn't wait until a subscriber end its own handler execution before notify another subscriber.

```ts
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

## Asynchronous workflow

Sometimes, you could want to bind async behavior to a subscription and wait until this job is done before notify next subscriber.

```ts
imageService.subscribe('user.profile.picture.updated', userService, async (user) => {
    await imageService.generateThumbnail(user.getProfilePicture());
});

imageCacheService.subscribe('user.profile.picture.updated', userService, user => {
    imageCacheService.purgeProfileThumbnail(user.getId())
});

userService.publish('user.profile.picture.updated', user);
```

In this scenario, we want generate a new picture thumbnail when a user update its profile picture and then purge the related cache.<br/>
<br/>
Due to strictly synchronous nature of ``publish`` method, this code won't work as expected. Indeed, even if ``imageService`` is notified before `imageCacheService`, purge method could be performed before the end of thumb generation. Depending on your implementation, this scenario could throw error or re-cache some outdated thumb version.
<br/>
<br/>
To build this kind of solution, the better way is to decoupling the underlying event in two distincts notifications: 
* User has updated new profile picture or ``user.profile.picture.updated``
* New thumb is available for this user or ``image.updated``

<br/>

```ts
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