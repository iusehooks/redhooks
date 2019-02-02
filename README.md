# <img src='https://raw.githubusercontent.com/iusehooks/redhooks/master/logo/logo.png' width="224" height='61' alt='Redhooks Logo' />

Redhooks is tiny React utility library for holding a predictable state container in your React apps. 
Inspired by [Redux](https://redux.js.org), it reimplements redux concept by using the experimental Hooks API and the Context API.

- [Motivation](#motivation)
- [Basic Example](#basic-example)
- [Apply Middleware](#apply-middleware)
- [Usage with React Router](#usage-with-react-router)
- [Isolating Redhooks Sub-Apps](#isolating-redhooks-sub-apps)
- [Redhooks API Reference](#redhooks-api-reference)
- [CodeSandbox Examples](#codesandbox-examples)
- [License](#license)

[![Build Status](https://travis-ci.org/iusehooks/redhooks.svg?branch=master)](https://travis-ci.org/iusehooks/redhooks)

# Installation
```sh
npm install --save redhooks
```

# Motivation

In the [Reactjs docs](https://reactjs.org/docs/hooks-custom.html) a paragraph titled useYourImagination() suggests to think on different possible usages of the Hooks, this essentially is what Redhooks tries to do.
Redhooks does not use any third party library, it only depends on the new Hooks and the Context API.
You do not need to install `react-redux` to connect your components to the store because you can access it directly from any of your function components by calling `useStore` Redhooks api.
Hooks are not allowed within class Components, for using the store within them Redhooks exposes a HOC named `connect`.
It also supports the use of middlewares like `redux-thunk`, `redux-saga` or your custom middleware, which must conform to the middleware's API.

# Basic Example

Redhooks follows the exact same principles of redux which is inspired to.
* the whole state of your app is stored in an object tree inside a single store.
* state is read only. So the only way to change the state is to dispatch an action, an object describing what happened.
* to specify how the actions transform the state tree, you write pure reducers.

## Store

`store.js`
```js
import { createStore, combineReducers } from "redhooks";

// function reducer
const hello = (
  state = { phrase: "good morning" },
  { type, payload }
) => {
  switch (type) {
    case "SAY_HELLO":
      return { ...state, phrase: payload };
    default:
      return state;
  }
};

// function reducer
const counter = (state = 0, { type, payload }) => {
  switch (type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

// You can use the combineReducers function
const rootReducer = combineReducers({ hello, counter });
const store = createStore(rootReducer);

// or if you want to be less verbose you can pass a plain object whose values are reducer functions
const store = createStore({ hello, counter });

// eventually we can pass to createStore as second arg an opts object like:
// const opts = { preloadedState: { counter: 10 }, initialAction: { type: "INCREMENT" } }
// const store = createStore(rootReducer, opts);

export default store;
```

`App.js`
```js
import Provider from "redhooks";
import store from "./store";

function App() {
  return (
      <Provider store={store}>
        <DispatchAction />
        <DispatchActionExpensive />
        <ReadFromStore />
      </Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

## Dispatching Sync and Async Actions - No expensive rendering operation
If your component does not perform an expensive rendering you can use `useStore` Redhooks API within your
function Component in order to have access to the Redhooks store. Class or function components that perform expensive rendering operations can be connected to the store by using `connect` Redhooks HOC which takes care to avoid unnecessary re-rendering in order to improve the performance. But we will see it in action in the next paragraph.

`./components/DispatchAction.js`
```js
import React from "react";
import { useStore } from "redhooks";

const DispatchAction = () => {
  const { dispatch } = useStore();
  return (
     <div>
        <button
          onClick={() =>
            dispatch({
              type: "SAY_HELLO",
              payload: "hello"
            })
          }
        >
          Say Hello
        </button>
        <button onClick={() => dispatch({ type: "INCREMENT" })}>
          Sync Increment Counter
        </button>
        <button
          onClick={() =>
            setTimeout(() => dispatch({ type: "DECREMENT" }), 3000)
          }
        >
          Async Decrement Counter
        </button>
      </div>
  );
};

export default DispatchAction;
```

## Dispatching Sync and Async Actions - Expensive rendering operation
For components wich perform expensive rendering the use of `connect` HOC helps to avoid unnecessary re-renders.

`./components/DispatchActionExpensive.js`
```js
import React from "react";
import { connect } from "redhooks";

const DispatchActionExpensive = props => (
     <div>
        <button onClick={() => props.dispatch({ type: "INCREMENT" })}>
          Sync Increment Counter
        </button>
        <button
          onClick={() =>
            setTimeout(() => props.dispatch({ type: "DECREMENT" }), 3000)
          }
        >
          Async Decrement Counter
        </button>
      </div>
);

export default connect()(DispatchActionExpensive);
```

## Use Store from a Function Component

`./components/ReadFromStore.js`
```js
import React from "react";
import { useStore } from "redhooks";

const ReadFromStore = () => {
  const { state } = useStore();
  const { hello, counter } = state;
  return (
    <section>
      <h1>{hello.phrase}</h1>
      <span>{counter}</span>
    </section>
  );
};

export default ReadFromStore;
```

> **Tips**: If your function component performs a expensive rendering you should use the `connect` HOC Redhooks API.

## Use Store from a Class Component

```js
import React, { Component } from "react";
import { connect } from "redhooks";

class ReadFromStore extends Component {
  render() {
    const { hello, counter } = this.props;
    return (
        <section>
            <h1>{hello.phrase}</h1>
            <span>{counter}</span>
        </section>
    );
  }
};

function mapStateToProp(state, ownProps) {
  return {
    hello: state.hello,
    counter: state.counter
  };
}

export default connect(mapStateToProp)(ReadFromStore);
```

# Apply Middleware

As for Redux, middleware is a way to extend Redhooks with custom functionality.
Middleware are functions which receive Store's `dispatch` and `getState` as named arguments, and return a function. Redhooks supports the use of the redux's middlewares like `redux-thunk`, `redux-saga` or you migth write a custom middleware conforming to middleware API. 

## Custom middleware - Logger Example

```js
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}
```

##  Use `redux-thunk` and `redux-saga`

```js
import React from "react";
import { render } from "react-dom";
import Provider, { createStore } from "redhooks";
import thunk from "redux-thunk";
import createSagaMiddleware from "redux-saga";
import reducer from "./reducers";

const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware];

const store = createStore(reducer, { middlewares });

function* helloSaga() {
  console.log("Hello Sagas!");
}
// redux-saga needs to run as soon the store is ready
store.onload = () => sagaMiddleware.run(helloSaga);

render(
    <Provider store={store}>
        <DispatchAction />
        <ReadFromStore />
    </Provider>,
  document.getElementById("root")
);
```

# Usage with React Router
App routing can be handled using [React Router](https://github.com/ReactTraining/react-router).

```js
import React from 'react'
import Provider from 'redhooks'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './Home'
import About from './About'

const App = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
      </Switch>
    </Router>
  </Provider>
)

export default App
```

```js
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redhooks'
import thunk from "redux-thunk";
import rootReducer from "./reducers"
import App from './App'

const opts = {
  preloadedState: { counter: 9 },
  initialAction: { type: "INCREMENT" },
  middlewares: [thunk]
};

const store = createStore(rootReducer, opts)

render(<App store={store} />, document.getElementById('app'))
```

# Isolating Redhooks Sub-Apps

```js
import React from "react";
import Provider, { createStore } from "redhooks";
import ReadFromStore from "./components/ReadFromStore";
import Footer from "./components/Footer";

const counter = (state = 0, { type, payload }) => {
  switch (type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

const store = createStore(counter);

export default function SubApp() {
  return (
    <Provider store={store}>
      <DispatchAction />
      <ReadFromStore />
    </Provider>
  );
}
```

Each instance will be independent and it will have its own store.

```js
import React from "react";
import SubApp from "./SubApp";

function App() {
  return (
    <React.Fragment>
      <SubApp />
      <SubApp />
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

# Redhooks API Reference

* [createStore](#createStore)
* [combineReducers](#combineReducers)
* [connect](#connect)
* [bindActionCreators](#bindActionCreators)
* [Provider](#Provider)
* [useStore](#useStore)

## createStore
```js
createStore(reducer, [opts])
```
`createStore` returns the store object to be passed to the `<Provider store={store} />`.
* The `reducer` argument might be a single reducer function, a function returned by `combineReducers` or a plain object whose values are reducer functions if your store needs multiple reducers.
* The `opts` optional argument is an object which allows you to pass a `preloadedState`, `initialAction` and `middlewares`.
> The store is ready after the Provider is mounted, an `onload` event will be triggered at that time.

#### Example
```js
const opts = {
    preloadedState: 1,
    initialAction: { type: "DECREMENT" },
    middlewares: [thunk, sagaMiddleware, logger]
};
const store = createStore(reducer, opts);
store.onload = ({ dispatch }) => dispatch({ type: "INCREMENT" });
```

## combineReducers
```js
combineReducers(reducers)
```
`combineReducers` combines an object whose props are different reducer functions, into a single reducer function
* The `reducers` argument is an object whose values correspond to different reducing functions that need to be combined into one.

#### Example
```js
const rootReducer = combineReducers({ counter, otherReducer })
const store = createStore(rootReducer)
```

## connect
```js
connect([mapStateToProps], [mapDispatchToProps])
```
`connect` function connects a React component to a Redhooks store. It returns a connected component class that wraps the component you passed in taking care to avoid unnecessary re-rendering. It should be used if your class or function components perform expensive rendering.

* If a `mapStateToProps` function is passed, your component will be subscribed to Redhooks store. Any time the store is updated, mapStateToProps will be called. The results of mapStateToProps must be a plain object, which will be merged into your component’s props. If you don't want to connect to Redhooks store, pass null or undefined in place of mapStateToProps.
* `mapDispatchToProps` if passed may be either a function that must return a plain object whose values are functions or a plain object whose values are [action creator](#action-creator) functions. In both cases the props of the returned object will be merged in your component’s props. If is not passed your component will receive `dispatch` prop by default.

#### Example
```js
const mapStateToProps = (state, ownProps) => ({ counter: state.counter })
const mapDispatchToProps = dispatch => ({ increment: action => dispatch({ type: action })})
// or
const mapDispatchToProps = { increment: type => ({ type })}

export default connect(mapStateToProps, mapDispatchToProps)(ReactComponent)
```

## bindActionCreators
```js
bindActionCreators(actionCreators, dispatch)
```

`bindActionCreators` turns an object whose values are [action creator](#action-creator), into an object with the
same keys, but with every function wrapped into a `dispatch` call so they
may be invoked directly.
 
* `actionCreators` An object whose values are action creator functions or plain objects whose values are action creator functions
* `dispatch` it is the dispatch function available on your Redhooks store.

#### Action creator
An action creator is a function that creates an action.

```js
type ActionCreator = (...args: any) => Action | AsyncAction
```

#### Example
`actions.js`

```js
export const action_1 = action_1 => action_1
export const action_2 = action_2 => action_2
export const action_3 = action_3 => action_3
```

`YourComponentConnected.js`
```js
import React from "react";
import { connect, bindActionCreators } from "redhooks";
import * as actions from "./actions";

const YourComponent = ({ actions, counter }) => (
  <div>
    <h1>counter</h1>
    <button onClick={actions.action_1}>action_1</button>
    <button onClick={actions.action_2}>action_2</button>
    <button onClick={actions.action_2}>action_3</button>
  </div>
);

const mapStateToProps = state => ({
  counter: state.counter
});

// a verbose way
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch)
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YourComponent);

// or simply
export default connect(
  mapStateToProps,
  { actions }
)(YourComponent);
```

## Provider
The `<Provider />` makes the Redhooks store available to any nested components.

#### Example
```js
import React from "react";
import Provider from "redhooks";
import store from "./store";
import ReadFromStore from "./components/ReadFromStore";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Provider store={store}>
      <DispatchAction />
      <ReadFromStore />
    </Provider>
  );
}
```

## useStore
```js
useStore()
```
`useStore` can be only used within a function component and it returns the `store`.
* The `store` is an object whose props are the `state` and the `dispatch`.

#### Example
```js
import React from "react";
import { useStore } from "redhooks";

const Example = () => {
  const { state, dispatch } = useStore(); // do not use it within a Class Component
  const { counter } = state;
  return (
    <section>
      <span>{counter}</span>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>
        Increment Counter
      </button>
    </section>
  );
};

export default Example;
```

# CodeSandbox Examples

Following few open source projects implemented with `redux` have been migrated to `redhooks`:

* Shopping Cart: [Sandbox](https://codesandbox.io/s/5yn1258y4l)
* TodoMVC: [Sandbox](https://codesandbox.io/s/7jyq991p90)
* Tree-View: [Sandbox](https://codesandbox.io/s/rmw98onnlp)
* Saga-Middleware: [Sandbox](https://codesandbox.io/s/48pomo7rx7)
* Redux-Thunk: [Sandbox](https://codesandbox.io/s/n02r5400mp)

# License

This software is free to use under the MIT license.
See the [LICENSE file](/LICENSE.md) for license text and copyright information.
