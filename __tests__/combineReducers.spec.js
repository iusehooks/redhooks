import { combineReducers, createStore } from "./../src";
import { counterReducer, todoReducer } from "./helpers/reducers";

describe("combineReducers", () => {
  it("should combine reducers funtions in one", () => {
    const rootReducer = combineReducers({ counterReducer, todoReducer });
    const { initialState } = createStore(rootReducer);
    let newState = rootReducer(initialState, { type: "INCREMENT" });
    expect(newState.counterReducer).toBe(1);
    newState = rootReducer(newState, { type: "DECREMENT" });
    expect(newState.counterReducer).toBe(0);
    newState = rootReducer(newState, { type: "NONE" });
    expect(newState.counterReducer).toBe(0);
  });

  it("should throw if a reducer return undefined", () => {
    const undefinedRed = () => undefined;
    const rootReducer = combineReducers({ undefinedRed });
    expect(() => rootReducer(0, { type: "DECREMENT" })).toThrow();
    expect(() => rootReducer(0, undefined)).toThrow();
    expect(() => rootReducer(0, {})).toThrow();
    expect(() => rootReducer(0)).toThrow();
  });

  it("should throw if an invalid argument is passed", () => {
    expect(() => combineReducers(null)).toThrow();
    expect(() => combineReducers(undefined)).toThrow();
    expect(() => combineReducers(false)).toThrow();
    expect(() => combineReducers("hello")).toThrow();
    expect(() => combineReducers(1)).toThrow();
    expect(() => combineReducers(todoReducer)).toThrow();
    expect(() => combineReducers({})).toThrow();
  });

  it("should throw if an invalid value for the argument is passed", () => {
    let wrongRed = false;
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = 3;
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = "hello";
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = {};
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = { wrongRed };
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = null;
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
    wrongRed = undefined;
    expect(() => combineReducers({ counterReducer, wrongRed })).toThrow();
  });
});
