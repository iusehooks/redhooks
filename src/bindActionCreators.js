import isPlainObject from "./utils/isPlainObject";

/**
 * Turns an object whose values are action creator, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly.
 *
 * @param {Object} actionCreators An object whose values are action
 * creator functions or plain objects whose values are action creator functions
 *
 * @param {Function} dispatch The `dispatch` function available on your Redhooks
 * store.
 *
 * @returns {Object} if passed may be either a function that must return a plain object
 * whose values are functions or a plain object whose values are action creator functions
 */

const bindActionCreators = (actionCreators, dispatch) => {
  if (!isPlainObject(actionCreators)) {
    throw new Error(errMsg("First", "must be a plain object", actionCreators));
  }

  if (typeof dispatch !== "function") {
    throw new Error(errMsg("Second", "must be a function", dispatch));
  }

  return Object.keys(actionCreators).reduce((acc, key) => {
    const value = actionCreators[key];
    if (typeof value === "function") {
      return { ...acc, [key]: (...args) => dispatch(value(...args)) };
    } else if (isPlainObject(value)) {
      return { ...acc, [key]: { ...bindActionCreators(value, dispatch) } };
    }
    return acc;
  }, {});
};

export default bindActionCreators;

function errMsg(argNumber, text, prop) {
  return `${argNumber} argument in bindActionCreators() ${text}. Instead received ${typeof prop} => ${prop}.`;
}
