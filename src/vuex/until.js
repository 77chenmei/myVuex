export function forEachValue(obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

export function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}

export function isObject(obj) {
  return typeof obj === 'object' && obj != null;
}

/**
 * 判断是否 promise
 * @param {*} obj 
 */
export function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}