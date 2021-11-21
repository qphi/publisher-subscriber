# Pattern in Nutshell

## Observer

> The observer pattern is a software design pattern in which an object, named the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes, usually by calling one of their methods.
> <br/>- [https://en.wikipedia.org/wiki/Observer_pattern](https://en.wikipedia.org/wiki/Observer_pattern)

It is possible to implement this communication scheme using ``@qphi/publisher-subscriber``:

* `subject` are **subscriber**
* `observable` are **publisher**

```js
import {Publisher, Subscriber} from "./index";

class Subject extends Publisher {
    notify() {
        this.publish('notify', 'some-data');
    }

    attach(observable) {
        observable.subscribe('notify', this, data => {
            observable.update(data);
        });
    }

    detach(observable) {
        observable.unsubscribeFromPublisherId(this.getId());
    }
}

class Observable extends Subscriber {
    update(data) {
        // ... observable business logic ...
    }
}

const observer = new Observable('observer');
const subject = new Subject('subject');

subject.attach(observer);
subject.notify();

// observer.update is trigger !
```

Or directly

```js
import {Subscriber, Publisher} from "./index";

const observer = new Subscriber('observer');
const subject = new Publisher('subject');

observer.subscribe('notify', subject, data => {
    // ... observable business logic ...
});

subject.publish('notify', 'some-data')
```