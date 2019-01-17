import React, { useMemo, useState } from "react";
import { useStore } from "./store";
import isPlainObject from "./utils/isPlainObject";
import bindActionCreators from "./bindActionCreators";

/**
 * `connect` is a HOC which connects a React Component to the Redhooks store.
 * It returns a connected component that wraps the component you passed
 * in taking care to avoid unnecessary re-rendering. It should be used if your
 * class or function components perform an expensive rendering operation.
 *
 * @param {Function} mapStateToProps if passed, your component will be subscribed to Redhooks store.
 * @param {Function|Object} mapDispatchToProps - if passed must return a plain object whose values are
 * functions and whose props will be merged in your component’s props
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
  if (mapStateToProps === null) {
    mapStateToProps = _mapStateToProps;
  }

  if (typeof mapStateToProps !== "function") {
    throw new Error(
      errMsg("mapStateToProps", mapStateToProps, "must be a function")
    );
  }

  if (isPlainObject(mapDispatchToProps)) {
    mapDispatchToProps = bindFunctionActions(mapDispatchToProps);
  }

  if (typeof mapDispatchToProps !== "function") {
    throw new Error(
      errMsg("mapDispatchToProps", mapDispatchToProps, "must be a function")
    );
  }

  let prevState = {};
  let prevPropsMapped = {};
  let changeState = {};
  let keyID = 0;
  return Comp => props => {
    const { state, dispatch } = useStore();
    const [keyCpm] = useState(() => ++keyID);

    changeState[keyCpm] =
      changeState[keyCpm] !== undefined ? changeState[keyCpm] : false;

    const propsMapped = mapStateToProps(
      state,
      prevState[keyCpm] || state,
      props
    );
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

    const [dispatchProps] = useState(() => {
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
      const { length } = Object.keys(propsDispatch);
      return length > 0 ? propsDispatch : { dispatch };
    });

    changeState[keyCpm] = checkPropChange(
      propsMapped,
      prevPropsMapped[keyCpm] || propsMapped,
      changeState[keyCpm]
    );

    prevPropsMapped[keyCpm] = propsMapped;
    prevState[keyCpm] = state;

    const CPM = useMemo(
      () => <Comp {...props} {...propsMapped} {...dispatchProps} />,
      [changeState[keyCpm]]
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
  return dispatch => bindActionCreators({ ...mapDispatchToProps }, dispatch);
}

function errMsg(nameFN, prop, addText, displyName = "") {
  return `${nameFN}() in Connect(${displyName}) ${addText}. Instead received ${typeof prop} => ${prop}.`;
}
