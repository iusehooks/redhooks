import React, { useMemo } from "react";
import { useStore } from "./store";
import isPlainObject from "./utils/isPlainObject";
import objValueFunc from "./utils/objValueFunc";

/**
 * `connect` is a HOC which connects a React Component to the Redhooks store.
 * It returns a connected component that wraps the component you passed
 * in taking care to avoid unnecessary re-rendering. It should be used if your
 * class or function components perform expensive rendering.
 *
 * @param {Function} mapStateToProps if passed, your component will be subscribed to Redhooks store.
 * @param {Function} mapDispatchToProps - if passed must return a plain object whose values are functions and whose props will be merged in your component’s props
 *
 * @returns {Component} It returns a connected component.
 */

const _mock = {};
const _mapStateToProps = () => _mock;
const _mapDispatchToProps = dispatch => ({ dispatch });

export default (
  mapStateToProps = _mapStateToProps,
  mapDispatchToProps = _mapDispatchToProps
) => {
  if (typeof mapStateToProps !== "function") {
    throw new Error(
      errMsg("mapStateToProps", mapStateToProps, "must be a function")
    );
  }

  if (isPlainObject(mapDispatchToProps)) {
    if (!objValueFunc(mapDispatchToProps)) {
      throw new Error(
        errMsg(
          "mapDispatchToProps",
          mapDispatchToProps,
          "must be a function or a object whose values are functions"
        )
      );
    }
    mapDispatchToProps = bindFunctionActions(mapDispatchToProps);
  }

  if (typeof mapDispatchToProps !== "function") {
    throw new Error(
      errMsg("mapDispatchToProps", mapDispatchToProps, "must be a function")
    );
  }

  let prevState;
  let prevPropsMapped;
  let change = false;
  return Comp => props => {
    const { state, dispatch } = useStore();

    const propsMapped = mapStateToProps(state, prevState || state, props);
    if (!isPlainObject(propsMapped)) {
      throw new Error(
        errMsg(
          "mapStateToProps",
          propsMapped,
          "must return a plain object",
          Comp.name
        )
      );
    }

    const dispatchProps = useMemo(() => {
      const propsDispatch = mapDispatchToProps(dispatch, props);
      if (!isPlainObject(propsDispatch)) {
        throw new Error(
          errMsg(
            "mapDispatchToProps",
            propsDispatch,
            "must return a plain object",
            Comp.name
          )
        );
      }
      const propsKeys = Object.keys(propsDispatch);
      if (propsKeys.length > 0) {
        if (!objValueFunc(propsDispatch)) {
          throw new Error(
            errMsg(
              "mapDispatchToProps",
              propsDispatch,
              "must return a plain object whose values are functions",
              Comp.name
            )
          );
        }
        return propsDispatch;
      } else {
        return { dispatch };
      }
    }, []);

    change = checkPropChange(
      propsMapped,
      prevPropsMapped || propsMapped,
      change
    );

    prevPropsMapped = propsMapped;
    prevState = state;

    const CPM = useMemo(
      () => <Comp {...props} {...propsMapped} {...dispatchProps} />,
      [change]
    );
    return CPM;
  };
};

function checkPropChange(propsMapped, prevPropsMapped, change) {
  const changeHappened = Object.keys(propsMapped).some(
    key => propsMapped[key] !== prevPropsMapped[key]
  );
  return changeHappened ? !change : change;
}

function bindFunctionActions(mapDispatchToProps) {
  const fn = { ...mapDispatchToProps };
  return dispatch =>
    Object.keys(fn).reduce(
      (acc, key) => ({
        ...acc,
        [key]: (...args) => dispatch(fn[key](...args))
      }),
      {}
    );
}

function errMsg(nameFN, prop, addText, displyName = "") {
  return `${nameFN}() in Connect(${displyName}) ${addText}. Instead received ${typeof prop} => ${prop}.`;
}
