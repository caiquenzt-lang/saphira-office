// react-shim.js
let currentComponent = null;

export function useState(initial) {
  let val = typeof initial === 'function' ? initial() : initial;
  const setter = (next) => {
    val = typeof next === 'function' ? next(val) : next;
  };
  return [val, setter];
}

export function useEffect(fn, deps) {
  setTimeout(() => {
    try { fn(); } catch (e) { console.error('useEffect error:', e); }
  }, 10);
}

export function useRef(initial) {
  return { current: initial };
}

export default { useState, useEffect, useRef };
