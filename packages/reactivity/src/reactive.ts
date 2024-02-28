import { isObject } from "@vue/shared"

import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers
} from './baseHandlers'

const reactiveMap = new WeakMap()   // 回自动垃圾回收，不会造成内存泄漏，存储的 key 只能是对象
const readonlyMap = new WeakMap()

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

export function createReactiveObject(target, isReadonly, baseHandlers) {
  // reactive 只处理对象类型
  if(!isObject(target)) {
    return target
  }

  // 代理过的对象不重复代理
  const proxyMap = isReadonly ? readonlyMap: reactiveMap

  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)   // 将代理对象和代理结果缓存

  return proxy
}