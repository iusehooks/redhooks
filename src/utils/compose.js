/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left.
 */

export default (...funcs) =>
  funcs.length === 0
    ? arg => arg
    : (...args) =>
        funcs.reduceRight(
          (acc, elm, index) => (index < funcs.length - 1 ? elm(acc) : acc),
          funcs[funcs.length - 1](...args)
        );
