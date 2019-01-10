import React from "react";
import { connect, useStore } from "./../../src";

export const Increment = () => {
  const { state, dispatch } = useStore();
  const increment = () => dispatch({ type: "INCREMENT" });
  return <button onClick={increment}>{state.counterReducer}</button>;
};

class IncrementConnected extends React.Component {
  constructor(props) {
    super(props);
    const { dispatch } = props.redhooks;
    this._increment = () => dispatch({ type: "INCREMENT" });
  }
  render() {
    const { state } = this.props.redhooks;
    return <button onClick={this._increment}>{state.counterReducer}</button>;
  }
}

export const IncrementClassCPM = connect(IncrementConnected);
