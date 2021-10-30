# Build a voter system

Assume that you have to implement a voter system, or any pattern based on complex and independents rules.<br/>
A good solution may be to publish a `decision-required` notification to each rule. Each rule will resolve its complex
logic business, and add its vote to "decisionObject".

```js
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

?> Based on this example, you can adapt your voter system to use weight instead boolean value, or whatever you want !
