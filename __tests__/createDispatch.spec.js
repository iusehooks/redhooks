import createDispatch from "../src/utils/createDispatch";
import { logger, thunk } from "./helpers/middlewares";
import { fakeStore } from "./helpers/store";
import { counterReducer } from "./helpers/reducers";

const initialState = 0;
let store;

describe("Utils => createDispatch", () => {
  beforeEach(() => (store = fakeStore(counterReducer, initialState)));

  it("should create the store dispatcher given middlewares functions as args", () => {
    const disptach = createDispatch(logger, thunk)(store);
    const action = disptach({ type: "init" });
    expect(action).toEqual("init");
  });

  it("should dispatch an action to change the state", () => {
    const disptach = createDispatch(logger, thunk)(store);
    disptach({ type: "INCREMENT" });
    expect(store.getState()).toBe(1);
    disptach({ type: "DECREMENT" });
    expect(store.getState()).toBe(0);
  });

  it("should dispatch a function handled by thunk middleware", () => {
    const disptach = createDispatch(logger, thunk)(store);
    const changeCounter = action => disptach => disptach(action);
    disptach(changeCounter({ type: "DECREMENT" }));
    expect(store.getState()).toBe(-1);
  });

  it("should throw when dispatcher is not ready yet", () => {
    function dispatchBeforeIsReady(store) {
      store.dispatch({ type: "DO_SOMETHING" });
      return next => action => next(action);
    }
    expect(() => createDispatch(dispatchBeforeIsReady)(store)).toThrow();
  });
});
