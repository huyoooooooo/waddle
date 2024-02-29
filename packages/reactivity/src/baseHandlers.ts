import { isObject } from "@vue/shared"
import { reactive, readonly } from "./reactive"
import { track } from "./effect"
import { TrackOpTypes } from "./operaters"

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGetter = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

function createGetter(isReadonly = false, isShallow = false) {  // 拦截获取 
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)

    if(!isReadonly) {
      // 收集依赖
      track(target, TrackOpTypes.GET, key)
    }

    if(isShallow) {
      return res
    }

    // 相比 vue2 初始化对数据进行深度遍历进行代理, vue3在触发取值时才进行代理（懒代理模式）
    if(isObject(res)) {
      return isReadonly ? readonly(res): reactive(res)
    }
  
    return res
  }
}

function createSetter(isShallow = false) {  // 拦截设置
  return function set(target, key, receiver) {
    const res = Reflect.set(target, key, receiver)  // Reflect 修改值具有返回值(是否修改成功, 布尔值)

    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, receiver) {
    console.warn('set is forbidden')
  }
}

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGetter,
  set(target, key, receiver) {
    console.warn('set is forbidden')
  }
}