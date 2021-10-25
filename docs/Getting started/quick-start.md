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

# Build a voter system

Assume that you have to implement a voter system, or any pattern based on complex and independents rules.<br/>
A good solution may be to "publish" a `decision-required` notification to each rule. Each rule will resolve its complex
logic business, and add its vote to "decisionObject".

```ts
import {Publisher, Subscriber} from "./index";

const mainProcess = new Publisher('process');

const rule1 = new Subscriber('rule-1');
// ...
const rule99 = new Subscriber('rule-99');

rule1.subscribe(mainProcess, 'decision-required', decisionObject => {
    let ruleDecision; // boolean
    // ... do some complex stuff 
    decisionObject.finalVote = ruleDecision.finalVote && ruleDecision;
});

// ...

rule99.subscribe(mainProcess, 'decision-required', decisionObject => {
    let ruleDecision; // boolean
    // ... do some complex stuff 
    decisionObject.finalVote = ruleDecision.finalVote && ruleDecision;
});

const decisionItem = {finalVote: true};
mainProcess.publish('decision-required', decisionItem);

if (decisionItem.finalVote) {
    // ok rules are all valid
} else {
    // one or more rules are not ok
}

```

Based on this example, you can adapt your voter system to use weight instead boolean value, or whatever you want !

# Component cooperation

Inspired of agent oriented system, you can organize your "components" interaction by publishing/subscribing
notification.

```ts
import {Publisher, PublisherSubscriber} from "./index";

const cow = new PublisherSubscriber('cow');
const lion = new PublisherSubscriber('lion');

const world = new PublisherSubscriber('world');

cow.subscribe(world, 'roar', direction => {
    cow.runAway(direction.getOpposite());
});

world.subscribe(lion, 'roar', predatorPosition => {
    const nearbyPreys = world.searchPreyInCircle(predatorPosition, 10);
    nearbyPreys.forEach(prey => {
        world.publish('roar');
    });
});

lion.publish('roar', lion.getPosition());
```

In virtual societies, agents didn't know each others. However, they may perceive some contextual data from their own environment. According to this model, lion and cow are both agent and adapt their behavior according to world environment which can be saw as a service dedicated to coordinate each system's component. This approach is pretty robust and flexible cause each component define its behavior depending of what it percept, and not based under any behavior described bv a dependant component. It didn't depend on any component, class, or event interface, only on notification.
<br/>
<br/>
In some complex project, reusing component could be difficult and require to instantiate multiples component even if only one piece of code are really reach by your new context. 
Using ``@qphi/publisher-subscriber`` instantiate "zombie-component" is not required anymore. Your code won't broke if nobody publish message.