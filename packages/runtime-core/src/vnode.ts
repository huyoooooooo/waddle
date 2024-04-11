import { ShapeFlags, isObject, isString } from "@vue/shared"

export const isVnode = (value) => value.__v_isVNode

export const createVNode = (type, props, children?) => {

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0

  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    component: null,
    key: props.key || null,
    el: null,
    shapeFlag       // 非常巧妙的使用位运算，将不同的类型标记到 shapeFlag 上
  }

  normalizeChildren(vnode, children)

  return vnode
}

function normalizeChildren(vnode, children) {
  if (children == null) {
    
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  }
}