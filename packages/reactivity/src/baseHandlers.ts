import { hasChanged, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { reactive, readonly } from "./reactive"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operaters"

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
  return function set(target, key, value, receiver): boolean {
    let oldValue = target[key]

    // 区分新增、修改   vue2 无法监控监控长度变化
    const hasKey = isArray(target) && isIntegerKey(key) ? key < target.length: hasOwn(target, key)
    const res = Reflect.set(target, key, value, receiver)  // Reflect 修改值具有返回值(是否修改成功, 布尔值)
    
    if (!hasKey) {
      // 新增
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if(hasChanged(oldValue, value)){
      // 修改
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }

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