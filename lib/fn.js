import {wrap} from 'optimism';

export function maybe(fn, ...args) {
  return fn && typeof fn === 'function' ? fn(...args) : fn;
}

export function memo(fn, options = {}) {
  const memoized = wrap(fn, options);
  const captured = (...args) => {
    try {
      return memoized(...args);
    } catch (result) {
      memoized.dirty(...args);
      throw result;
    }
  };
  captured.dirty = memoized.dirty;
  return captured;
}

const functionToId = new WeakMap();
let counter = 0;
export function getFunctionId(fn) {
  if (functionToId.has(fn)) {
    return functionToId.get(fn);
  }
  const id = `fn-${counter++}`;
  functionToId.set(fn, id);
  return id;
}
