import { isArray, isIntegerKey, isSymbol } from "@vue/shared"
import { TriggerOpTypes } from "./operaters"

let uid = 0
let activeEffect = null  // 存储当前 effect
const effectStack = []

export function effect(fn, options:any = {}) {
  const effect = createReactiveEffect(fn, options)

  if(!options.lazy) {
    effect()
  }

  return effect
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {   // 不重复入栈 effect
      try {
        effectStack.push(effect)
        activeEffect = effect
        fn()   // 函数执行进行取值操作, 触发 get
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }

  effect.id = uid++             // effect 唯一标识
  effect._isEffect = true       // 表示是否为响应式
  effect.raw = fn
  effect.options = options      

  return effect
}

const targetMap = new WeakMap()

// fn 内数据对象的属性，收集当前对应的 effect
export function track(target, type, key) {
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

export function trigger(target, type, key?, newValue?, oldValue?) {
  // 属性未收集 effect, 无需派发更新
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  // 将要执行的 effect，全部存储至新集合中，一起执行
  const effects = new Set

  const add = effectsToAdd => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => effects.add(effect))
    }
  }
  // 修改数组长度
  if (isArray(target) && key === 'length') {
    depsMap.forEach((dep, key) => {
      // 数组长度的变化自身 或 数组长度变小的情况下 已经收集的数组索引大于变更后数组长度部分
      if (key === 'length' || (!isSymbol(key) && key > newValue)) {
        add(dep)
      }
    })
    // 记录：proxy代理数组会讲数组的 Symbol、toString、join、length 属性一并代理
    // 字符串和数字比较，会转换成 NaN, 对非 Symbol 的字符串属性与长度比较都返回 false
  } else {
    // 修改对象
    if (key !== void 0) {
      add(depsMap.get(key))
    }

    // 修改数组中某一索引
    switch(type) {
      // 添加索引触发长度更新
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }

  effects.forEach((effect: any) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}