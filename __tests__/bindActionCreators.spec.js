import { bindActionCreators } from "../src";

const actionCreators = {
  increment: () => ({ type: "INCREMENT" }),
  actions: {
    decrement: () => ({ type: "DECREMENT" })
  },
  nested: {
    a: () => ({ type: "DECREMENT" }),
    inner: {
      b: () => ({ type: "DECREMENT" }),
      c: () => ({ type: "DECREMENT" })
    }
  }
};
const dispatch = action => action;
const actionCreatorFunctions = { ...actionCreators };

describe("bindActionCreators", () => {
  it("should wrap the action creators with a given function", () => {
    let boundActionCreators = bindActionCreators(actionCreators, dispatch);
    expect(Object.keys(actionCreators)).toEqual(
      Object.keys(actionCreatorFunctions)
    );

    let action = boundActionCreators.increment();
    expect(action).toEqual(actionCreators.increment());

    action = boundActionCreators.actions.decrement();
    expect(action).toEqual(actionCreators.actions.decrement());

    action = boundActionCreators.nested.a();
    expect(action).toEqual(actionCreators.nested.a());

    action = boundActionCreators.nested.inner.b();
    expect(action).toEqual(actionCreators.nested.inner.b());
  });

  it("should throw if invalid arguments are passed", () => {
    expect(() => bindActionCreators(1, dispatch)).toThrow();
    expect(() => bindActionCreators(false, dispatch)).toThrow();
    expect(() => bindActionCreators("test", dispatch)).toThrow();
    expect(() => bindActionCreators(null, dispatch)).toThrow();
    expect(() => bindActionCreators(undefined, dispatch)).toThrow();

    expect(() => bindActionCreators(actionCreators, 1)).toThrow();
    expect(() => bindActionCreators(actionCreators, false)).toThrow();
    expect(() => bindActionCreators(actionCreators, "test")).toThrow();
    expect(() => bindActionCreators(actionCreators, null)).toThrow();
    expect(() => bindActionCreators(actionCreators, undefined)).toThrow();
    expect(() => bindActionCreators(actionCreators, {})).toThrow();
  });
});
