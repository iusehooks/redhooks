
# Getting Started with Redhooks 

A tiny React utility library for holding a predictable state container in your React apps. 
Inspired by https://redux.js.org, it uses the experimental Hooks API and the Context API. 

- [Motivation](#motivation)
- [Basic Example](#basic-example)
- [Apply Middleware](#apply-middleware)
- [Usage with React Router](#usage-with-react-router)
- [Isolating Redhooks Sub-Apps](#isolating-redhooks-sub-apps)
- [License](#license)

# Motivation

In the https://reactjs.org/docs/hooks-custom.html docs a nice paragraph titled useYourImagination()  suggests to think on differents possible usages of the Hooks, this essentially is what Redhooks tries to do.
Redhooks does not use any third party library, it depends on the new Hooks and the Context API.
You do not need to install `react-redux` and then binds actions or `mapStateToProps` in your components because you can have access to the store directly from any of your function components by invoking `useStore` Redhooks api. For class Components a HOC named `connect` will map and pass the redhooks store to any class component which will be applied to.
It also supports the use of middlware like `redux-thunk` or `redux-saga` or your custom middlware

# Basic Example

Redhooks follows the exact same principles of redux which is inspired to.
* the whole state of your app is stored in an object tree inside a single store.
* state is ready only. So the only way to change the state is to dispatch an action, an object describing what happened.
* to specify how the actions transform the state tree, you write pure reducers.

## Store

```js
import Provider, { createStore, combineReducers } from "redhooks";

const helloReducer = (
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

const counterReducer = (state = 0, { type, payload }) => {
  switch (type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

const rootReducer = combineReducers({ helloReducer, counterReducer });

// eventually we can pass as second arg an opts object like:
// const opts = { preloadedState: { counterReducer: 10 }, initialAction: { type: "INCREMENT" } }
const store = createStore(rootReducer);

function App() {
  return (
      <Provider store={store}>
        <DispatchAction />
        <ReadFromStore />
      </Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

## Dispatching Sync and Async Actions

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

## Read From Store

```js
import React from "react";
import { useStore } from "redhooks";

const ReadFromStore = () => {
  const { state } = useStore();
  const { helloReducer, counterReducer } = state;
  return (
    <section>
      <h1>{helloReducer.phrase}</h1>
      <span>{counterReducer}</span>
    </section>
  );
};

export default ReadFromStore;

```

## Use Store From a Class Component

```js
import React, { Component } from "react";
import { connect } from "redhooks";

class ReadFromStore extends Component {
  render() {
    const { state } = this.props.redhooks;
    const { helloReducer, counterReducer } = state;
    return (
        <section>
            <h1>{helloReducer.phrase}</h1>
            <span>{counterReducer}</span>
        </section>
    );
  }
};

export default connect(ReadFromStore);
```

# Apply Middleware

As for Redux, middleware is a way to extend Redhooks with custom functionality.
Middleware are functions which receive Store's `dispatch` and `getState` as named arguments, and return a function.

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

// redux-saga needs to run as soon the store is ready
function* helloSaga() {
  console.log("Hello Sagas!");
}
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
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Home from './Home'
import About from './About'

const App = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Route exact path="/" component={Home} />
      <Route exact path="/about" component={About} />
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
  preloadedState: { counterReducer: 9 },
  initialAction: { type: "INCREMENT" },
  middlewares: [thunk]
};

const store = createStore(rootReducer, opts)

render(<App store={store} />, document.getElementById('app'))
```

# Isolating Redhooks Sub-Apps

```js
import React from "react";

import Provider, { createStore } from "./tt";
import ReadFromStore from "./components/ReadFromStore";
import Footer from "./components/Footer";

const counterReducer = (state = 0, { type, payload }) => {
  switch (type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

const store = createStore(counterReducer);

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

# License

This software is free to use under the MIT license.
See the [LICENSE file](/LICENSE.md) for license text and copyright information.
