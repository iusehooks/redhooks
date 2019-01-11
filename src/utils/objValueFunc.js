/**
 * @param {Object} obj A plain Object.
 *
 * @returns {Boolean} It returns true if all values of the object are functions.
 */

export default obj =>
  Object.keys(obj).every(key => typeof obj[key] === "function");
