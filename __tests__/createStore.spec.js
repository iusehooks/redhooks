import { createStore } from "../src/store";
import { counterReducer, genericReducer } from "./helpers/reducers";

describe("createStore", () => {
  it("should create a store and initialized the state given a reducer function", () => {
    const store = createStore(counterReducer);
    expect(store.initialState).toBe(0);
  });

  it("should throw if the reducer passed as argument is not a function", () => {
    expect(() => createStore(false)).toThrow();
    expect(() => createStore(undefined)).toThrow();
    expect(() => createStore(null)).toThrow();
    expect(() => createStore(1)).toThrow();
    expect(() => createStore("hello")).toThrow();
  });

  it("should throw if the opts passed as argument is not a object", () => {
    expect(() => createStore(counterReducer, true)).toThrow();
    expect(() => createStore(counterReducer, null)).toThrow();
    expect(() => createStore(counterReducer, 1)).toThrow();
    expect(() => createStore(counterReducer, "hello")).toThrow();
  });

  it("should create a store with a preloadedState state", () => {
    let opts = { preloadedState: 2, initialAction: { type: "INCREMENT" } };
    expect(createStore(counterReducer, opts).initialState).toEqual(3);

    opts = { preloadedState: { counter: 1 } };
    expect(createStore(counterReducer, opts).initialState).toEqual(
      opts.preloadedState
    );

    opts = { preloadedState: "hello" };
    expect(createStore(counterReducer, opts).initialState).toEqual(
      opts.preloadedState
    );

    opts = { preloadedState: null };
    expect(createStore(counterReducer, opts).initialState).toEqual(null);

    opts = { preloadedState: false };
    expect(createStore(counterReducer, opts).initialState).toEqual(
      opts.preloadedState
    );

    opts = { preloadedState: [1, 2, 3] };
    expect(createStore(counterReducer, opts).initialState).toEqual(
      opts.preloadedState
    );

    opts = { preloadedState: undefined };
    expect(createStore(counterReducer, opts).initialState).toEqual(0);
  });

  it("should throw if preloadedState is a function", () => {
    const opts = { preloadedState: () => null };
    expect(() => createStore(counterReducer, opts)).toThrow();
  });

  it("should throw if initialAction is an invalid type", () => {
    let opts = { initialAction: null };
    expect(() => createStore(counterReducer, opts)).toThrow();

    opts = { initialAction: [] };
    expect(() => createStore(counterReducer, opts)).toThrow();

    opts = { initialAction: false };
    expect(() => createStore(counterReducer, opts)).toThrow();
  });

  it("should throw if middlewares is an invalid type or if not contain functions as elements", () => {
    let opts = { middlewares: null };
    expect(() => createStore(counterReducer, opts)).toThrow();

    opts = { middlewares: [() => null, undefined, false, 3, "hello"] };
    expect(() => createStore(counterReducer, opts)).toThrow();
  });
});
