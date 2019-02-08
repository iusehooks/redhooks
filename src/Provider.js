import React, { useState, useEffect, useRef } from "react";
import createDispatch from "./utils/createDispatch";
import { Context } from "./store";

export default function Provider({ store, children }) {
  const { reducer, initialState, middlewares, onload } = store;

  const storeContext = storeHooks(reducer, initialState, middlewares);

  useEffect(() => {
    onload && onload(storeContext);
  }, []);

  return <Context.Provider value={storeContext}>{children}</Context.Provider>;
}

function storeHooks(reducer, initialState, middlewares) {
  const [state, setState] = useState(() => initialState);

  const stateProvider = useRef();
  stateProvider.current = state; // store the state reference

  const [dispatch] = useState(() => {
    const storeAPI = {
      getState: () => stateProvider.current,
      dispatch: action => {
        const nextState = reducer(stateProvider.current, action);
        if (nextState !== stateProvider.current) {
          stateProvider.current = nextState; // update the state reference
          setState(nextState);
        }
        return action;
      }
    };
    return createDispatch(...middlewares)(storeAPI);
  });

  return { state, dispatch };
}
