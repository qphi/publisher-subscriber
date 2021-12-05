# 📦 Prerequisites 

* Add the module to your project
  ```sh
  npm install @qphi/publisher-subscriber --save
  ```

That's all! Now you can start to play with the notification system directly in your ts or js files!
<br/>
<br/>
# Ready to publish?

## Publish your first notification

```js
import {Publisher, Subscriber} from "@qphi/publisher-subscriber";

const publisher = new Publisher('publisher-id');
const subscriber = new Subscriber('subscriber-id');

subscriber.subscribe(publisher, 'notification-string-example', () => {
    console.log("Hello world! I am an happy handler!");
});

publisher.publish('notification-string-example');
// => "Hello world! I am an happy handler!"
```

# Give some extra information

`publish` method accept any values as second parameter. This parameter will be injected in subscription handler.

```js
import {Publisher, Subscriber} from "@qphi/publisher-subscriber";

const publisher = new Publisher('Paul');
const subscriber = new Subscriber('bar');

subscriber.subscribe(publisher, 'hi', name => {
    console.log(`Hi, my name is ${name}! Nice to meet you!`);
});

publisher.publish('hi', publisher.getId());
// => "Hi, my name is Paul! Nice to meet you!"
```