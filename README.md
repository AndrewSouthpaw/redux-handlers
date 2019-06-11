# redux-handlers

Compose your reducers with simple and testable functions, not switch statements.

This library provides some simple glue-code that allows facilitates composing your reducers with isolated, testable functions.

## 💪 Usage

```js
const { registerHandler, createReducer } = createHandlers()

export const addTodo = (todo, state) => { /* ... */ }
registerHandler('ADD_TODO', addTodo)

export const toggleTodo = (id, state) => { /* ... */ }
registerHandler('TOGGLE_TODO', toggleTodo)

/**
* NB: expects action creator to set values in same order:  
* 
*     { type: 'SET_TODO_DATE', id: 42, dueDate: Date.now() }
* 
* If you use an action creator, it's easier to keep this in sync.
*/
export const setTodoDueDate = (id, dueDate, state) => { /* ... */ }
registerHandler('SET_TODO_DUE_DATE', setTodoDueDate)

export const reducer = createReducer([])
```

## 🔥 Motivation

Redux reducers are usually written with switch statements.

```js
export function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      // ...
    case 'TOGGLE_TODO':
      // ...
    case 'SET_TODO_DUE_DATE':
      // ...
    default:
      return state
  }
}
```

I never liked this, and wanted to compose my reducer out of functions:

```js
export const addTodo = (todo, state) => { /* ... */ }
export const toggleTodo = (id, state) => { /* ... */ }
export const setTodoDueDate = (id, dueDate, state) => { /* ... */ }

// some magic... 🧙‍♀️
export const reducer = combineTheseFunctionsTogetherSomehow() 
```

I found `switch` for my reducers to be unpleasant for many reasons:

1. They're hard to locate:
  1. You can't Navigate To Declaration from a test
  1. You can't navigate to a symbol definition
  1. You can't see the case statement in a File Structure view in an IDE
1. Your code for `ADD_TODO` is separate from `TOGGLE_TODO`, yet they live in same function and you have to test them through the same pathway, i.e. by exercising the reducer
1. Writing tests for a reducer system (requiring an action object) is cognitively more difficult and less pleasant to do than testing a function, so people are less likely to write them
1. `switch / case / default` syntax is awkward at best and easy to mess up
1. Adding types to `action` is *vastly* more painful than writing types for a simple function

## 🥳 Solution

**Handlers**: functions that you can use to compose reducers. A handler follows two simple rules:

1. It is a function that takes a `state` at the end of its parameter list, and returns a `state`
1. It takes additional parameters in the same order they were specified in the action object

Once a handler function is created, you register it with an action type to tell the reducer you want use that handler to respond to the action type.

```js
export const addTodo = (todo, state) => [...state, todo]
registerHandler('ADD_TODO', addTodo)
```

For additional parameters, it just reads values in the same order they were added in the action creator object literal:

```js
// actions.js
const setTodoDueDateAction = (id, dueDate) => ({ type: 'ADD_TODO_TO_LIST', id, dueDate })

// reducer.js
export const setTodoDueDate = (id, dueDate, state) => { /* ... */ }
```

Then, you create the reducer at the end:

```js
export const reducer = createReducer()
```

Rather than destructuring, you could group different reducer handlers in the same file if that's your thing. They each maintain their own handlers and ability to create a reducer from it.

```js
const todosHandlers = createHandlers()
const visibilityFilterHandlers = createHandlers()

// ...

export const todos = todosHandlers.createReducer([])
export const visibilityFilter = visibilityFilterHandlers.createReducer('SHOW_ALL')
```

## 😕 Drawbacks

#### Order matters

It requires the order of parameters on the action object to be the same as the parameter list in the handler. This would result in a bug:

```js
// actions.js
const setTodoDueDateAction = (id, dueDate) => ({ type: 'ADD_TODO_TO_LIST', dueDate, id }) // 🐞

// reducer.js
export const setTodoDueDate = (id, dueDate, state) => { /* ... */ }
```

This bug occurs because there's no way to get parameter names, so we have to do it based on order. We tried just spreading out the action object:

```js
export const setTodoDueDate = ({ id, dueDate }, state) => { /* ... */ } 
```

... but we found this to be an unpleasant experience for testing and adding types. We accepted it as worth the risk for this minor bug. In practice, it gets uncovered very quickly within the same dev cycle.

#### Requires ES2017

We're using `Object.values`, which is ES2017. Babel takes care of it for you, and chances are you're using it.

"But wait, that's not safe! You can't guarantee values order with objects!"

Technically, true. In practice, it's fine. There's many discussions on the web about this point. In the two years of using this pattern in production code, we have never encountered an error due to this potentiality.
