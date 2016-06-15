# The `__generator` helper

The `__generator` helper is a function designed to support TypeScript's down-level emit for
async functions when targeting ES5 and earlier. But how, exactly, does it work?

Here's the body of the `__generator` helper:
```js
    __generator = function (body) {
        var _ = { label: 0, sent: function() { if (sent[0] === 1) throw sent[1]; return sent[1]; }, trys: [], stack: [] }, sent, f;
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (1) {
                if (_.done) switch (op[0]) {
                    case 0: return { value: void 0, done: true };
                    case 1: case 6: throw op[1];
                    case 2: return { value: op[1], done: true };
                }
                try {
                    switch (f = 1, op[0]) {
                        case 0: case 1: sent = op; break;
                        case 4: return _.label++, { value: op[1], done: false };
                        case 7: op = _.stack.pop(), _.trys.pop(); continue;
                        default:
                            var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
                            if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
                            if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
                            if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
                            if (r[2]) { _.stack.pop(); }
                            _.trys.pop();
                            continue;
                    }
                    op = body(_);
                }
                catch (e) { op = [6, e]; }
                finally { f = 0, sent = void 0; }
            }
        }
        return {
            next: function (v) { return step([0, v]); },
            "throw": function (v) { return step([1, v]); },
            "return": function (v) { return step([2, v]); }
        };
    };
```

And here's an example of it in use:

```ts
// source:
async function func(x) {
    try {
        await x;
    }
    catch (e) {
        console.error(e);
    }
    finally {
        console.log("finally");
    }
}

// generated
function func(x) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 1, 3, 4]);
                    return [4 /*yield*/, x];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 4];
                case 3:
                    console.log("finally");
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    });
}
```

There is a lot going on in this function, so the following will break down what each part of the
`__generator` helper does and how it works.

## Opcodes

The `__generator` helper uses opcodes which represent various operations that are interpreted by
the helper to affect its internal state. The following table lists the various opcodes, their
arguments, and their purpose:

| Opcode         | Arguments | Purpose                                                                                                                        |
|----------------|-----------|--------------------------------------------------------------------------------------------------------------------------------|
| 0 (next)       | *value*   | Starts the generator, or resumes the generator with *value* as the result of the `AwaitExpression` where execution was paused. |
| 1 (throw)      | *value*   | Resumes the generator, throwing *value* at `AwaitExpression` where execution was paused.                                       |
| 2 (return)     | *value*   | Exits the generator, executing any `finally` blocks starting at the `AwaitExpression` where execution was paused.              |
| 3 (break)      | *label*   | Performs an unconditional jump to the specified label, executing any `finally` between the current instruction and the label.  |
| 4 (yield)      | *value*   | Suspends the generator, setting the resume point at the next label and yielding the value.                                     |
| 5 (reserved)   |           | *Reserved for future use.*                                                                                                     |
| 6 (catch)      | *error*   | An internal instruction used to indicate an exception that was thrown from the body of the generator.                          |
| 7 (endfinally) |           | Exits a finally block, resuming any previous operation (such as a break, return, throw, etc.)                                  |

## State
The `_`, `sent`, and `f` variables make up the persistent state of the `__generator` function. Each variable
has a specific purpose, as described in the following sections:

### The `_` variable
The `__generator` helper must share state between its internal `step` orchestration function and
the `body` function passed to the helper.

```ts
var _ = {
    label: 0,
    sent: function() {
        if (sent[0] === 1)
            throw sent[1];
        return sent[1];
    },
    trys: [],
    stack: []
};
```

The following table describes the members of the `_` state object and their purpose:

| Name    | Description                                                                                                               |
|---------|---------------------------------------------------------------------------------------------------------------------------|
| `label` | Specifies the next switch case to execute in the `body` function.                                                         |
| `sent`  | Handles the completion result passed to the generator.                                                                    |
| `trys`  | A stack of **Protected Regions**, which are 4-tuples that describe the labels that make up a `try..catch..finally` block. |
| `stack` | A stack of pending operations used for `try..finally` blocks.                                                             |

The `__generator` helper passes this state object to the `body` function for use with switching
between switch cases in the body, handling completions from `AwaitExpression`, etc.

### The `sent` variable
The `sent` variable stores the current operation that results in a completion of some kind in
the `body` function.

### The `f` variable
The `f` variable indicates whether the generator is currently executing, to prevent re-entry of
the same generator during its execution.

## Protected Regions
A **Protected Region** is a region within the `body` function that indicates a
`try..catch..finally` statement. It consists of a 4-tuple that contains 4 labels:

| Offset | Description                                                                             |
|--------|-----------------------------------------------------------------------------------------|
| 0      | *Required* The label that indicates the beginning of a `try..catch..finally` statement. |
| 1      | *Optional* The label that indicates the beginning of a `catch` clause.                  |
| 2      | *Optional* The label that indicates the beginning of a `finally` clause.                |
| 3      | *Required* The label that indicates the end of the `try..catch..finally` statement.     |

## Orchestration
The `step` function is the main orechestration mechanism for the `__generator` helper. It
interprets opcodes, handles **protected regions**, and communicates results back to the caller.

Here's a closer look at the `step` function:

```ts
function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (1) {
        if (_.done) switch (op[0]) {
            case 0: return { value: void 0, done: true };
            case 1: case 6: throw op[1];
            case 2: return { value: op[1], done: true };
        }
        try {
            switch (f = 1, op[0]) {
                case 0: case 1: sent = op; break;
                case 4: return _.label++, { value: op[1], done: false };
                case 7: op = _.stack.pop(), _.trys.pop(); continue;
                default:
                    var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
                    if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
                    if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
                    if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
                    if (r[2]) { _.stack.pop(); }
                    _.trys.pop();
                    continue;
            }
            op = body(_);
        }
        catch (e) { op = [6, e]; }
        finally { f = 0, sent = void 0; }
    }
}
```

The main body of `step` exists in a `while` loop. This allows us to continually interpret
operations until we have reached some completion, be it a `return`, `await`, or `throw`.

### Handling a completed generator
The first part of the `while` loop handles the behavior of the generator when it has completed
execution:

```ts
if (_.done) switch (op[0]) {
    case 0: return { value: void 0, done: true };
    case 1: case 6: throw op[1];
    case 2: return { value: op[1], done: true };
}
```

If the caller calls `next` on the generator, it will send Opcode 0 ("next"). As the generator has
completed, it returns an `IteratorResult` where `value` is `undefined` and `done` is true.

If the caller calls `throw` on the generator it will send Opcode 1 ("throw"). If an exception
is uncaught within the body of the generator, it will send Opcode 6 ("catch"). As the generator has
completed, it throws the exception.

If the caller calls `return` on the generator, it will send Opcode 2 ("return"). As the generator
has completed, it returns an `IteratorResult` where `value` is the value provided to `return`, and
`done` is true.

### Handling operations
The second part of the `while` loop handles the behavior of the generator while it is still
evaluating the body:

```ts
switch (f = 1, op[0]) {
    case 0: case 1: sent = op; break;
    case 4: return _.label++, { value: op[1], done: false };
    case 7: op = _.stack.pop(), _.trys.pop(); continue;
    default:
        var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
        if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
        if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
        if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
        if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
        if (r[2]) { _.stack.pop(); }
        _.trys.pop();
        continue;
}
op = body(_);
```

Here, we set the `f` variable to a truthy value, and switch on the current opcode.

#### Opcode 0 ("next") and Opcode 1 ("throw")
```ts
switch (f = 1, op[0]) {
    case 0: case 1: sent = op; break;
    ...
}
```

Both Opcode 0 ("next") and Opcode 1 ("throw") have the same behavior. The current operation is
stored in the `sent` variable and the `body` function is invoked. The `body` function will invoke
`_.sent()` which will invoke the appropriate completion result.

#### Opcode 4 ("yield")
```ts
switch (f = 1, op[0]) {
    ...
    case 4: return _.label++, { value: op[1], done: false };
    ...
}
```

When we encounter Opcode 4 ("yield"), we increment the label by one to indicate the point at which
the generator will resume execution. We then return an `IteratorResult` whose `value` is the
yielded value, and `done` is `false`.

#### Opcode 7 ("endfinally")
```ts
switch (f = 1, op[0]) {
    ...
    case 7: op = _.stack.pop(), _.trys.pop(); continue;
    ...
}
```

Opcode 7 ("endfinally") indicates that we have hit the end of a `finally` clause, and that the last
operation recorded before entering the `finally` block should be evaluated.

#### Opcode 2 ("return"), Opcode 3 ("break"), and Opcode 6 ("catch")
```ts
switch (f = 1, op[0]) {
    ...
    default:
        var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
        if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
        if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
        if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
        if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
        if (r[2]) { _.stack.pop(); }
        _.trys.pop();
        continue;
}
```

The handling for Opcode 2 ("return"), Opcode 3 ("break") and Opcode 6 ("catch") is more
complicated, as we must obey the specified runtime semantics of generators. The first line in this
clause gets the current **Protected Region** if found:

```ts
var r = _.trys.length > 0 && _.trys[_.trys.length - 1];
```

This is followed by several `if` statements that test for more complex conditions. The first of
these is the following:

```ts
if (!r && (op[0] === 6 || op[0] === 2)) { _.done = 1; continue; }
```

If we encounter an Opcode 6 ("catch") or Opcode 2 ("return"), and we are not in a protected region,
then this operation completes the generator. The `continue` statement spins the outer `while`
statement so that we run the block at the top of the `while` statement that handles a completed
generator.

```ts
if (op[0] === 3 && (!r || (op[1] > r[0] && op[1] < r[3]))) { _.label = op[1]; break; }
```

This `if` statement handles Opcode 3 ("break") when we are either not in a **protected region**, or
are performing an unconditional jump to a label inside of the current **protected region**.

```ts
if (op[0] === 6 && _.label < r[1]) { _.label = r[1], sent = op; break; }
```

This `if` statement handles Opcode 6 ("catch") when inside the `try` block of a **protected
region**. In this case we jump to the `catch` block, if present.

```ts
if (r && _.label < r[2]) { _.label = r[2], _.stack.push(op); break; }
```

This `if` statement handles all Opcodes when in a **protected region** with a `finally` clause.
As long as we are not already inside the `finally` clause, we jump to the `finally` clause and
push the pending operation onto `_.stack`. This allows us to resume execution of the pending
operation once we have completed execution of the `finally` clause, as long as it does not
superseed this operation with its own completion value.

```ts
if (r[2]) { _.stack.pop(); }
_.trys.pop();
continue;
```

Any other completion value inside of a `finally` clause will superceed the pending completion value
from the `try` or `catch` clauses. The above `if` statement pops the pending completion from the
stack.

The remaining statements handle the point at which we exit a **protected region**. Here we pop the
current **protected region** from the stack and spin the `while` statement to try the current
operation again.

### Evaluating the generator body.
```ts
try {
    ...
    op = body(_);
}
catch (e) { op = [6, e]; }
finally { f = 0, sent = void 0; }
```

Now that we have evaluated the current operation, we can re-enter the generator body to continue
execution. Here we invoke `body` with the `_` state object. The result is a tuple that contains
the next Opcode and argument.

If evaluation of the body resulted in an exception, we convert this in to an Opcode 6 ("catch")
operation to be handled in the next spin of the `while` loop.

After executing user code, we clear the `f` flag that indicates we are executing the generator,
as well as the `sent` value so that we don't hold onto values sent to the generator for longer
than necessary.

## The generator object
The final step of the `__generator` helper is the allocation of an object that implements the
`Generator` protocol, to be used by the `__awaiter` helper:

```ts
return {
    next: function (v) { return step([0, v]); },
    "throw": function (v) { return step([1, v]); },
    "return": function (v) { return step([2, v]); }
};
```

This object translates calls to `next`, `throw`, and `return` to the appropriate Opcodes and
invokes the `step` orchestration function to continue execution.