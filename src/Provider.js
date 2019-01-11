import React, { useMemo, useState, useEffect } from "react";
import createDispatch from "./utils/createDispatch";

/**
 * If you use more then one provider in your app it ensures that each
 * provider gets an unique id which will be used as `keyState` to map its state
 * into the `stateProvider` object
 */
let providersActive = 0;
let stateProvider = {};

const getKeyState = () => {
  providersActive++;
  return providersActive;
};

export default ({ store, children }) => {
  const { reducer, initialState, Context, middlewares, onload } = store;
  const keyState = useMemo(() => getKeyState(), []);

  const storeContext = storeHooks(reducer, initialState, middlewares, keyState);

  useEffect(
    () => {
      onload && onload(storeContext);
    },
    [middlewares]
  );

  return <Context.Provider value={storeContext}>{children}</Context.Provider>;
};

function storeHooks(reducer, initialState, middlewares, keyState) {
  const [state, setState] = useState(initialState);

  stateProvider[keyState] = state; // store the state reference

  const storeAPI = useMemo(
    () => ({
      getState: () => stateProvider[keyState],
      dispatch: action => {
        const nextState = reducer(stateProvider[keyState], action);
        if (nextState !== stateProvider[keyState]) {
          stateProvider[keyState] = nextState; // update the state reference
          setState(nextState);
        }
        return action;
      }
    }),
    [setState]
  );

  const dispatch = useMemo(() => createDispatch(...middlewares)(storeAPI), [
    middlewares,
    storeAPI
  ]);

  return { state, dispatch };
}
