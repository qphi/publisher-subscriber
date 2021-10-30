# 🧙‍️Philosophy

## Don't build class, build component

**Component** term is very famous due to amazing job done by modern UI framework as React, Vue or Angular. But component aren't only ui-widget! 
<br/>
<br/>
When you build applicative work, keep in mind that your classes can be design as a reusable loosely coupled component. A component should hava only one concern, and be focus on it.

Read more about [Component Based Software Engineering](https://en.wikipedia.org/wiki/Component-based_software_engineering).

## Message Based Approach

All components that interact with others contains dependencies to these components, directly or not. 
With message based approach, one of our goals is to increase component reusability by reducing dependencies only to necessary: what a component need to know to start working.


### Don't tell me who you are

Components shouldn't depend on any other components type (or class that describe who they are) to do its own job.

### Don't tell me what you do

Components shouldn't depend on any other interfaces (that describe what they do) implemented by others component to do its own job.

### Tell me what I need to know

Notifications and parameters are the only information that a component need to know to do its own job. 

?> If you build some agent oriented system, component must know which agent send it message and subscribe to it explicitly


```js 
agent.subscribe('message', anotherAgent, () => {/* ... */ });
```

!> In case that component shouldn't depend explicitly to another component, you can remove publisher dependency by implementing  a [classical Pub/Sub pattern](cookbook/pub-sub.md)