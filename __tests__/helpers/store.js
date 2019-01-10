import { combineReducers, createStore } from "./../../src";
import { counterReducer, todoReducer } from "./reducers";

let state;
export const fakeStore = (reducer, initialState) => {
  state = initialState;
  return {
    getState: () => state,
    dispatch: action => {
      const nextState = reducer(state, action);
      state = nextState;
      return action.type;
    }
  };
};

export const store = createStore(
  combineReducers({ counterReducer, todoReducer })
);

export const storeWithMiddlewares = middlewares =>
  createStore(combineReducers({ counterReducer, todoReducer }), {
    middlewares
  });
