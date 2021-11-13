<br />
<div align="center">
<h3 align="center">Publisher-Subscriber</h3>

  <p align="center">
      Let your vanilla components work together by publishing or subscribing notifications!
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

```@qphi/publisher-subscriber``` is a module built with Typescript as UMD module. It aims to implement most *event / messaging* patterns in your js or ts projects.

This module provides two main interfaces:``PublisherInterface`` and ``SubscriberInterface`` that describe how your vanilla object could share **notification** in order be reactive and work together.

👉 <i><u>Note that it is not an academical **pubsub pattern**</u></i>.


<!-- GETTING STARTED -->
## Getting Started 🚀

### Prerequisites

* Adding the module to your project 
  ```sh
  npm install qpi/publisher-subscriber --save
  ```

That's it! Now you can start to play with the notification system!

### Send your first notification

```js
import {Publisher, Subscriber} from "@qphi/publisher-subscriber";

const publisher = new Publisher('publisher-id');
const subscriber = new Subscriber('subscriber-id');

subscriber.subscribe(publisher, 'notification-string-example', () => {
    console.log("Hello world! I'm a happy handler!");
});

publisher.publish('notification-string-example');
// => "Hello world! I'm a happy handler!"

// clear your component properly
publisher.destroy();
subscriber.destroy();
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

// clear your component properly
publisher.destroy();
subscriber.destroy();
```

### Combine Publisher and Subscriber roles 

An instance of ``PublisherSubscriber`` implements ``PublisherInterface`` and ``SubscriberInterface``. That means it can ``subscribe`` to some notifications and also ``publish``.

This kind of instance is helpful when you have to manage several components or implement a workflow.
```js
import { PublisherSubscriber } from "@qphi/publisher-subscriber";

const worker = new PublisherSubscriber('worker');
const manager = new PublisherSubscriber('manager');

worker.subscribe(manager, 'new-mission-available', jobId => {
   console.log(`${worker.getId()}: "${manager.getId()}" asks somebody to do the job "${jobId}".`);
   // some business logic here
   console.log(`${worker.getId()}: job "${jobId}" is done.`);
   worker.publish('job-done', jobId); 
});

manager.subscribe(worker, 'job-done', jobId => {
    // some business logic here
    console.log(`${manager.getId()}: "${worker.getId()}" notices me that job "${jobId}" was done.`);
});


manager.publish('new-mission-available', 'foo');
// => worker: "manager" asks somebody to do the job "foo".
// => worker: job "foo" id done.
// => manager: "worker" notices me that job "foo" was done.

// clear your component properly
manager.destroy();
worker.destroy();
```
<!-- DOCUMENTAION -->
## Documentation

TODO 

<!-- ROADMAP -->
## Roadmap


See the [roadmap](https://github.com/qphi/publisher-subscriber/projects) section for a full list features already planed.<br>
See the [issues](https://github.com/qphi/publisher-subscriber/issues) section for a full list of proposed features (and known issues).

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