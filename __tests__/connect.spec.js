import React from "react";
import { render, fireEvent } from "react-testing-library";

import Provider, { connect } from "./../src";
import {
  BasicComponent,
  BasicComponentNoMapDispatch
} from "./helpers/components";
import { store } from "./helpers/store";

const connectComp = (mapStateToProps, mapDispatchToProps) =>
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BasicComponent);

const connectCompNoMapDispatch = (mapStateToProps, mapDispatchToProps) =>
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BasicComponentNoMapDispatch);

describe("Utils => connect", () => {
  it("should return the function to connect a React Component", () => {
    const connector = connect()(BasicComponent);
    expect(typeof connector).toBe("function");
  });

  it("should connect a React component to the Redhooks store", () => {
    const mapStateToProps = state => ({
      counterReducer: state.counterReducer
    });

    let mapDispatchToProps = dispatch => ({
      increment: () => dispatch({ type: "INCREMENT" })
    });

    let ConnectedCMP = connectComp(mapStateToProps, mapDispatchToProps);
    let wrapper = render(
      <Provider store={store}>
        <ConnectedCMP />
      </Provider>
    );
    let button = wrapper.container.firstChild;
    expect(button.textContent).toBe("0");
    fireEvent.click(button);
    expect(button.textContent).toBe("1");

    mapDispatchToProps = {
      increment: type => ({
        type
      })
    };

    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToProps);
    wrapper = render(
      <Provider store={store}>
        <ConnectedCMP />
      </Provider>
    );
    button = wrapper.container.firstChild;
    expect(button.textContent).toBe("0");
    fireEvent.click(button);
    expect(button.textContent).toBe("1");

    mapDispatchToProps = dispatch => ({});

    ConnectedCMP = connectCompNoMapDispatch(
      mapStateToProps,
      mapDispatchToProps
    );
    wrapper = render(
      <Provider store={store}>
        <ConnectedCMP />
      </Provider>
    );
    button = wrapper.container.firstChild;
    expect(button.textContent).toBe("0");
    fireEvent.click(button);
    expect(button.textContent).toBe("1");
  });

  it("should throw if mapStateToProps returns a wrong type", () => {
    spyOn(console, "error"); // In tests that you expect errors
    let mapStateToPropsWrong = state => [];
    const mapDispatchToProps = dispatch => ({
      increment: () => dispatch({ type: "INCREMENT" })
    });
    let ConnectedCMP = connectComp(mapStateToPropsWrong, mapDispatchToProps);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapStateToPropsWrong = state => "";
    ConnectedCMP = connectComp(mapStateToPropsWrong, mapDispatchToProps);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapStateToPropsWrong = state => false;
    ConnectedCMP = connectComp(mapStateToPropsWrong, mapDispatchToProps);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapStateToPropsWrong = state => null;
    ConnectedCMP = connectComp(mapStateToPropsWrong, mapDispatchToProps);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapStateToPropsWrong = state => 3;
    ConnectedCMP = connectComp(mapStateToPropsWrong, mapDispatchToProps);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();
  });

  it("should throw if mapDispatchToProps returns a wrong type", () => {
    spyOn(console, "error"); // In tests that you expect errors
    const mapStateToProps = state => ({
      counterReducer: state.counterReducer
    });
    let mapDispatchToPropsWrong = dispatch => [];
    let ConnectedCMP = connectComp(undefined, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = dispatch => "";
    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = dispatch => false;
    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = dispatch => 3;
    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = dispatch => null;
    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = dispatch => ({ increment: false });
    ConnectedCMP = connectComp(mapStateToProps, mapDispatchToPropsWrong);
    expect(() =>
      render(
        <Provider store={store}>
          <ConnectedCMP />
        </Provider>
      )
    ).toThrow();

    mapDispatchToPropsWrong = { increment: "" };
    expect(() =>
      connectComp(mapStateToProps, mapDispatchToPropsWrong)
    ).toThrow();
  });

  it("should throw if not valid args are passed", () => {
    const noop = () => {};
    expect(() => connect(null)).toThrow();
    expect(() => connect([])).toThrow();
    expect(() => connect("")).toThrow();
    expect(() => connect(false)).toThrow();
    expect(() => connect(3)).toThrow();

    expect(() =>
      connect(
        noop,
        null
      )
    ).toThrow();
    expect(() =>
      connect(
        noop,
        []
      )
    ).toThrow();
    expect(() =>
      connect(
        noop,
        ""
      )
    ).toThrow();
    expect(() =>
      connect(
        noop,
        false
      )
    ).toThrow();
    expect(() =>
      connect(
        noop,
        3
      )
    ).toThrow();
  });
});
