const logStateAfterAction = state => state; // log state

export const logger = ({ getState }) => next => action => {
  const value = next(action);
  logStateAfterAction(getState());
  return value;
};
export const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === "function") {
    return action(dispatch, getState);
  }
  return next(action);
};
