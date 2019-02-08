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
      _innerState = {
        changeMapProp: false,
        prevMapPropChange: false,
        changeOwnProp: false,
        prevOwnPropsChange: false,
        prevMapProps: {},
        prevOwnProps: this.props
      };

      _render = value => {
        const { state, dispatch } = value;
        const propsMapped = mapStateToProps(state, this.props);

        // const propsMapped = {...this.props, ...propsMapped1};

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

        this._innerState.changeMapProp = shallowEqual(
          propsMapped,
          this._innerState.prevMapProps
        )
          ? this._innerState.changeMapProp
          : !this._innerState.changeMapProp;
        this._innerState.changeOwnProp = shallowEqual(
          this.props,
          this._innerState.prevOwnProps
        )
          ? this._innerState.changeOwnProp
          : !this._innerState.changeOwnProp;

        this._innerState.prevMapProps = propsMapped;
        this._innerState.prevOwnProps = this.props;

        if (
          this._innerState.prevMapPropChange !==
            this._innerState.changeMapProp ||
          this._innerState.prevOwnPropsChange !==
            this._innerState.changeOwnProp ||
          !this._wrapper
        ) {
          this._innerState.prevMapPropChange = this._innerState.changeMapProp;
          this._innerState.prevOwnPropsChange = this._innerState.changeOwnProp;

          this._wrapper = (
            <Comp {...this.props} {...propsMapped} {...this._dispatchProps} />
          );
        }

        return this._wrapper;
      };

      render() {
        return <Context.Consumer>{this._render}</Context.Consumer>;
      }
    };
};

function bindFunctionActions(mapDispatchToProps) {
  return dispatch => bindActionCreators({ ...mapDispatchToProps }, dispatch);
}

function errMsg(nameFN, prop, addText, displyName = "") {
  return `${nameFN}() in Connect(${displyName}) ${addText}. Instead received ${typeof prop} => ${prop}.`;
}
