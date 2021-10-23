<br />
<div align="center">
<h3 align="center">Publisher-Subscriber</h3>

  <p align="center">
    Let yours vanilla components works togethers by publishing or subscribing notifications!
    <br />
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template">View Demo</a>
    ·
    <a href="https://github.com/qphi/publisher-subscriber/issues">Report Bug</a>
    ·
    <a href="https://github.com/qphi/publisher-subscriber/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#send-your-first-notification">Send your first notification</a></li>
        <li><a href="#send-parameters-on-publish">Send parameters on publish</a></li>
        <li><a href="#combine-publisher-and-subscriber-roles">Combine Publisher and Subscriber roles</a></li>
      </ul>
    </li>
    <li><a href="#documentation">Documentation</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

```@qphi/publisher-subscriber``` is a module built with Typescript as UMD module. It aims to implement most event / messaging patterns in your js or ts projects.

This module provide two main interfaces:``PublisherInterface`` and ``SubscriberInterface`` that describe how your vanilla object could share **notification** in order be reactive and work together.

👉 <i><u>Note that it is not an academical **pubsub pattern**</u></i>.


<!-- GETTING STARTED -->
## Getting Started 🚀

### Prerequisites

* Add the module to your project 
  ```sh
  npm install qpi/publisher-subscriber --save
  ```

That's all! Now you can start to play with the notification system!

### Send your first notification

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


### Send parameters on publish 

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

### Combine Publisher and Subscriber roles 

An instance of ``PublisherSubscriber`` implements ``PublisherInterface`` and ``SubscriberInterface``. That mean that it can ``subscribe`` to some notifications and ``publish`` too.

This kind of instance is helpful when you have to manage several components or implements a workflow.
```js
import { PublisherSubscriber } from "@qphi/publisher-subscriber";

const worker = new PublisherSubscriber('worker');
const manager = new PublisherSubscriber('manager');

worker.subscribe(manager, 'new-mission-available', jobId => {
   console.log(`${worker.getId()}: "${manager.getId()}" ask somebody to do the job "${jobId}".`);
   // some business logic here
   console.log(`${worker.getId()}: job "${jobId}" is done.`);
   worker.publish('job-done', jobId); 
});

manager.subscribe(worker, 'job-done', jobId => {
    // some business logic here
    console.log(`${manager.getId()}: "${worker.getId()}" notice me that job "${jobId}" was done.`);
});


manager.publish('new-mission-available', 'foo');
// => worker: "manager" ask somebody to do the job "foo".
// => worker: job "foo" id done.
// => manager: "worker" notice me that job "foo" was done.
```

### Best Practices

#### Kill your component properly
Cause a subscription might keep a references to some object (according to the handler), memory leak could occur if you didn't clear properly subscriptions. That's why we advise to manually call ``destroy`` method under a ``publisher`` or a ``subscriber`` as soon as you know that it won't be used anymore. In some context, it is not critical cause your instance will automatically be cleared (browser context reset by new navigation). 
  
#### Avoid publish in handler, unless you implements PublisherSubscriberInterface
In subscription handler you should not let another publisher publish a new notification. Unless ``subscriber``implements ``PublisherSubscriberInterface`` avoid to publishing in handler at all. 
```js
// Naive example of stack-overflow 
// In real world it could be happen when a subscriber handler involve another publication
subscriber.subscribe(publisher, 'hello', () => {
    publisher.publish('hello');    
});

publisher.publish('hello'); 
```
<!-- DOCUMENTAION -->
## Documentation

TODO 

<!-- ROADMAP -->
## Roadmap


See the [roadmap](https://github.com/qphi/publisher-subscriber/projects) for a full list features already planed.<br>
See the [issues](https://github.com/qphi/publisher-subscriber/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the GPL License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Quentin Philippot - qphi-developper@gmail.com

Project Link: [https://github.com/qphi/publisher-subscriber](https://github.com/qphi/publisher-subscriber)

<p align="right">(<a href="#top">back to top</a>)</p>