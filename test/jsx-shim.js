// jsx-shim.js
export function jsx(type, props) {
  return createNode(type, props);
}

export function jsxs(type, props) {
  return createNode(type, props);
}

function createNode(type, props = {}) {
  // Se for um componente de função
  if (typeof type === 'function') {
    return type(props);
  }

  // Se for uma tag HTML normal (div, header, canvas, etc.)
  const el = typeof document !== 'undefined'
    ? document.createElement(type)
    : {
        tagName: type,
        props: props || {},
        style: {},
        children: [],
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: function(c) { this.children.push(c); return c; }
      };
  const { children, className, style, onClick, onMouseMove, onMouseLeave, onMouseDown, onMouseUp, ref, ...rest } = props;

  if (className) el.className = className;
  if (style) {
    if (typeof style === 'object') {
      Object.assign(el.style, style);
    } else {
      el.style.cssText = style;
    }
  }

  if (onClick) el.addEventListener('click', onClick);
  if (onMouseMove) el.addEventListener('mousemove', onMouseMove);
  if (onMouseLeave) el.addEventListener('mouseleave', onMouseLeave);
  if (onMouseDown) el.addEventListener('mousedown', onMouseDown);
  if (onMouseUp) el.addEventListener('mouseup', onMouseUp);

  if (ref && typeof ref === 'object') {
    ref.current = el;
  }

  if (children !== undefined && children !== null) {
    appendChildren(el, children);
  }

  // Método de montagem auxiliar
  el._mount = (target) => {
    target.appendChild(el);
  };

  return el;
}

function appendChildren(parent, children) {
  if (Array.isArray(children)) {
    children.forEach(child => appendChildren(parent, child));
  } else if (children !== null && children !== undefined && children !== false) {
    if (typeof Node !== 'undefined' && children instanceof Node) {
      parent.appendChild(children);
    } else if (typeof children === 'object' && children.type && children.props) {
      // Se for um nó do Button
      const btn = createNode(children.type, children.props);
      parent.appendChild(btn);
    } else if (typeof document !== 'undefined') {
      parent.appendChild(document.createTextNode(String(children)));
    } else {
      parent.appendChild({ text: String(children) });
    }
  }
}
