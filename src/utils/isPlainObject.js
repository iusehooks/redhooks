/**
 * @param {Object} obj A plain Object.
 *
 * @returns {Boolean} It returns true the argument passed is plain object.
 */

export default obj => Object.prototype.toString.call(obj) === "[object Object]";
