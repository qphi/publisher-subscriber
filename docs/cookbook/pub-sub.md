# Pattern in Nutshell

## PubSub

This is the classical "publisher/subscriber" pattern. In order to avoid confusions, *pub* and *sub* terms will refers to
this pattern and *publisher* / *subscriber* refers to related component role.

> **Pub/Sub** is a messaging pattern where senders of messages, called **pub**, do not program the messages to be sent directly to specific receivers, called **sub**, but instead categorize published messages into classes without knowledge of which **subs**, if any, there may be. Similarly, **subs** express interest in one or more classes and only receive messages that are of interest, without knowledge of which **pub**, if any, there are.
> <br/>- [https://en.wikipedia.org/wiki/Publish-subscribe_pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) (with reword)

It is possible to implement this communication scheme using ``@qphi/publisher-subscriber``:

* `subs` are **subscriber** subscribed to a *topic*
* `pubs` are object that can interact with *topic*
* `topic` is a **publisher**

```ts
import {Publisher, Subscriber} from "./index";

class Sub extends Subscriber {};

class Pub {
    constructor(topic) {
        this.topic = topic;
    }

    publish(notification, data) {
        this.topic.publish(notification, data);
    }
}

const topic = new Publisher('topic');

const sub = new Sub('sub');
const pub = new Pub(topic);

sub.subscribe('messageA', topic, () => { /* ... */ });
pub.publish('messageA', 'some-data');

// sub is trigger due to pub/sub mechanism
// sub hasn't any dependcy to pub
```