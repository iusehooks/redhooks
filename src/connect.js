import React, { PureComponent } from "react";
import isPlainObject from "./utils/isPlainObject";
import shallowEqual from "./utils/shallowEqual";
import bindActionCreators from "./bindActionCreators";
import { Context } from "./store";

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

  return Comp =>
    class Connect extends PureComponent {
      _state = {
        changeMapProp: false,
        changeOwnProp: false,
        prevMapProps: {},
        prevOwnProps: this.props
      };

      _render = value => {
        const { state, dispatch } = value;
        const propsMapped = mapStateToProps(state, this.props);

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

        if (!this._dispatchProps) {
          const propsDispatch = mapDispatchToProps(dispatch, this.props);
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
          this._dispatchProps =
            Object.keys(propsDispatch).length > 0
              ? propsDispatch
              : { dispatch };
        }

        const changeMapProp = checkChanges(
          propsMapped,
          this._state.prevMapProps,
          this._state.changeMapProp
        );

        const changeOwnProp = checkChanges(
          this.props,
          this._state.prevOwnProps,
          this._state.changeOwnProp
        );

        this._state.prevMapProps = propsMapped;
        this._state.prevOwnProps = this.props;

        /* istanbul ignore else */
        if (
          changeMapProp !== this._state.changeMapProp ||
          changeOwnProp !== this._state.changeOwnProp ||
          !this._wrapper
        ) {
          this._state.changeMapProp = changeMapProp;
          this._state.changeOwnProp = changeOwnProp;
          const { _ref, ...props } = this.props;
          this._wrapper = (
            <Comp
              ref={_ref}
              {...props}
              {...propsMapped}
              {...this._dispatchProps}
            />
          );
        }

        return this._wrapper;
      };

      render() {
        return <Context.Consumer>{this._render}</Context.Consumer>;
      }
    };
};

function checkChanges(newProps, prevProps, status) {
  return shallowEqual(newProps, prevProps) ? status : !status;
}

function bindFunctionActions(mapDispatchToProps) {
  return dispatch => bindActionCreators({ ...mapDispatchToProps }, dispatch);
}

function errMsg(nameFN, prop, addText, displyName = "") {
  return `${nameFN}() in Connect(${displyName}) ${addText}. Instead received ${typeof prop} => ${prop}.`;
}
