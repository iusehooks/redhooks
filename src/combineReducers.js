import isPlainObject from "./utils/isPlainObject";

/**
 * It combines an object whose props are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. The reducers must never return
 * undefined for any action or being initilized as undefined.
 * Any unrecognized action must return the current state.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

export default function(reducers = {}) {
  if (!isPlainObject(reducers)) {
    throw new Error(
      "The type passed as argument is not valid. It accepts object which values are functions"
    );
  }
  const reducersKeys = Object.keys(reducers);
  const validReducers = reducersKeys.filter(
    rKey => typeof reducers[rKey] === "function"
  );

  const errorMessage = areValidReducers(validReducers, reducersKeys);
  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return function(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    validReducers.forEach(key => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        const errorMessage = invalidStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? { ...state, ...nextState } : state;
  };
}

function invalidStateErrorMessage(key, action) {
  const actionType = action && action.type;
  const commonText =
    "If you want this reducer to hold no value, you can return null instead of undefined.";
  if (!actionType) {
    return (
      `Reducer "${key}" returned undefined at initialization time or by passing an undefined action.` +
      `${commonText}`
    );
  } else {
    const actionDescription = `action "${String(actionType)}"`;

    return (
      `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
      `To ignore an action, you must explicitly return the previous state. ` +
      `${commonText}`
    );
  }
}

function areValidReducers(validReducers, reducersKeys) {
  if (validReducers.length === 0) {
    return "The object passed as argument does not have any valid reducer functions";
  }

  if (validReducers.length !== reducersKeys.length) {
    const invalidReducers = reducersKeys.filter(
      key => validReducers.indexOf(key) === -1
    );
    return `The object passed as argument contains invalid reducer functions for the keys: [${invalidReducers}]`;
  }
}
