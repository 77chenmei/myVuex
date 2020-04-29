export function forEachValue(obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

export function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}