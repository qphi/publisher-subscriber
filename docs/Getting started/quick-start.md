# Prerequisites

* Add the module to your project
  ```sh
  npm install qpi/publisher-subscriber --save
  ```

That's all! Now you can start to play with the notification system directly in your ts or js files!

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

#