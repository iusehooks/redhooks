import React from "react";
import { render, fireEvent } from "react-testing-library";

import Provider from "./../src";
import { store, storeWithMiddlewares } from "./helpers/store";
import {
  Increment,
  IncrementClassCPM,
  BasicComponentEmptyAction
} from "./helpers/components";

const mountProvider = ({ props, children } = {}) =>
  render(<Provider {...props}>{children}</Provider>);

describe("Component => Provider", () => {
  it("should render a Provider and its children", () => {
    const children = [<Increment key="1" />];
    const props = { store };
    const { container } = mountProvider({ props, children });
    expect(container.children.length).toBe(children.length);
  });

  it("should load the store after Provider is ready", done => {
    const props = { store };
    store.onload = jest.fn();
    mountProvider({ props });
    setTimeout(() => {
      expect(store.onload).toBeCalledTimes(1);
      done();
    });
  });

  it("should a Provider's function component child be able to dispatch actions and update the state", () => {
    const children = [<Increment key="1" />];
    const props = { store, children };
    const { container } = mountProvider({ props, children });
    const button = container.firstChild;
    expect(button.textContent).toBe("0");
    fireEvent.click(button);
    expect(button.textContent).toBe("1");
  });

  it("should a Provider's class component child be able to dispatch actions and update the state", () => {
    const children = [<IncrementClassCPM key="1" />];
    const props = { store, children };
    const { container } = mountProvider({ props, children });
    const button = container.firstChild;
    expect(button.textContent).toBe("0");
    fireEvent.click(button);
    expect(button.textContent).toBe("1");
  });

  it("should state not change when an empty action is dispatched", () => {
    const children = [<BasicComponentEmptyAction key="1" />];
    const props = { store, children };
    const { container } = mountProvider({ props, children });
    const button = container.firstChild;
    fireEvent.click(button);
    expect(button.textContent).toBe("0");
  });

  it("should a dispatched action go through the middlewares", done => {
    const middlware = ({ getState }) => next => action => {
      const value = next(action);
      const newState = getState();
      expect(newState.counterReducer).toBe(1);
      expect(value.type).toBe("INCREMENT");
      done();
    };
    const store = storeWithMiddlewares([middlware]);
    const children = [<Increment key="1" />];
    const props = { store, children };
    const { container } = mountProvider({ props, children });
    const button = container.firstChild;
    fireEvent.click(button);
  });
});
