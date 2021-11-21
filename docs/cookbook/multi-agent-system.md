
# Multi Agent System

Inspired of agent oriented system, you can organize your component interactions by publishing/subscribing
notification.
<br/>
<br/>
In virtual societies, agents didn't know each others. However, they may perceive some contextual data from their own **environment**.

```js
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

``lion`` and ``cow`` are both agent and can adapt their behavior according to them world environment perception.

?> This approach based under agent perception is pretty robust and flexible. Each agent define its behavior according to what it *fear* or *desire*, and doesn't know anything about others component behaviors. As it didn't depend on any component, class, or event interface, only on notification, it respect one of our main credo [tell me only what i need to know](concept/philosophy.md#tell-me-what-i-need-to-know). 
