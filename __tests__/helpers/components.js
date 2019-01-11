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
    const { dispatch } = props;
    this._increment = () => dispatch({ type: "INCREMENT" });
  }
  render() {
    const { counterReducer } = this.props;
    return <button onClick={this._increment}>{counterReducer}</button>;
  }
}

function mapStateToProps(state) {
  return {
    counterReducer: state.counterReducer
  };
}

export const IncrementClassCPM = connect(mapStateToProps)(IncrementConnected);

export const BasicComponent = props => (
  <button onClick={() => props.increment("INCREMENT")}>
    {props.counterReducer}
  </button>
);

export const BasicComponentNoMapDispatch = props => (
  <button onClick={() => props.dispatch({ type: "INCREMENT" })}>
    {props.counterReducer}
  </button>
);

export const BasicComponentEmptyAction = () => {
  const { state, dispatch } = useStore();
  return <button onClick={() => dispatch({})}>{state.counterReducer}</button>;
};
