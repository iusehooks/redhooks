import { createContext, useContext } from "react";
import combineReducers from "./combineReducers";
import isPlainObject from "./utils/isPlainObject";
import objValueFunc from "./utils/objValueFunc";

export const Context = createContext();

/**
 * Creates a Redhooks store that holds the state tree.
 * The only way to change the data in the store is to call the `dispatch` method.
 * To do so you have to call `useStore()` from a function Component which returns an object { state, dispatch }.
 * To use the store from a class Component you have to use the `connect` HOC => export default connect(YourClassComponent)
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function|Object} reducer A function that given an action and the current state it returns the next state tree.
 * In case of multiple reducers this function may be created either by using `combineReducers` or by passing a plain object
 * whose values are reducer functions.
 * @param {Object} opts You may optionally specify a preloadedState and/or dispatch an initilaAction and/or middlewares
 * @param {Object} opts.preloadedState - To initialize the store with a State.
 * @param {Object} opts.initilaAction - To dispatch an initialAction to the Store => { type: "INIT", payload: "Hello" }.
 * @param {Array} opts.middlewares - An array of functions conforming to the Redhooks middleware.
 *
 * @returns {Store} A Redhooks store which has to be passed as prop to the <Provider store={store} />
 */

export const createStore = (reducer, opts = {}) => {
  if (isPlainObject(reducer)) {
    reducer = combineReducers(reducer);
  }

  if (typeof reducer !== "function") {
    throw new Error("The reducer must be a function");
  }

  if (!isPlainObject(opts)) {
    throw new Error(
      "Argument opts invalid in createStore(reducer, [opts]). It must be a object { preloadedState, initialAction, middlewares }"
    );
  }

  const { preloadedState, initialAction = {}, middlewares = [] } = opts;

  if (typeof preloadedState === "function") {
    throw new Error(
      "You are passing a function as preloadedState, it only accepts plain objects and primitives data types"
    );
  }

  if (!isPlainObject(initialAction)) {
    throw new Error(
      "Invalid initialAction, an action has to be a plain object like { type: 'ADD', payload: 1 }"
    );
  }

  if (middlewares !== null && middlewares.constructor === Array) {
    if (!objValueFunc(middlewares)) {
      throw new Error(
        "You are passing an invalid middleware. A middleware must be a function"
      );
    }
  } else {
    throw new Error(
      "The middlewares value of opts must be an array of functions"
    );
  }

  // At store creation time an empty action, if initilAction is not passed, is dispatched so that every
  // reducer returns their initial state to populate the initial state tree.
  let initialState = reducer(preloadedState, initialAction);

  return { initialState, reducer, middlewares };
};

/**
  You can call `useStore()` only within a function Component. It returns an object { state, dispatch }.
  To use the store from a class Component you have to use the `connect` HOC.
  export default connect([mapStateToProps], [mapDispatchToProps])(YourClassComponent)
*/

export const useStore = () => useContext(Context);
