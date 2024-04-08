export const nodeOps = {
  createElement: tagName => document.createElement(tagName),
  insert: (child, parent, anchor) => parent.insertBefore(child, anchor || null),
  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  querySelector: selector => document.querySelector(selector),
  setElementText: (el, text) => el.textContent = text,      // 元素内设置文本
  createText: text => document.createTextNode(text),
  setText: (node, text) => node.nodeValue = text,           // 文本节点设置文本
}