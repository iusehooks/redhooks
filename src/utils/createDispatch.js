import compose from "./compose";

/**
 * It applies middleware, if any are passed, and creates
 * the dispatcher of the Redhooks store.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function}
 */

export default (...middlewares) => store => {
  let dispatch = () => {
    throw new Error(`Dispatcher not ready yet!`);
  };

  const middlwareAPI = {
    getState: store.getState,
    dispatch: (...args) => dispatch(...args)
  };
  const chain = middlewares.map(middleware => middleware(middlwareAPI));
  dispatch = compose(...chain)(store.dispatch);

  return dispatch;
};
