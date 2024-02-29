let uid = 0
let activeEffect = null  // 存储当前 effect
const effectStack = []

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (effectStack.includes(effect)) {   // 不重复入栈 effect
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

export function effect(fn, options) {
  const effect = createReactiveEffect(fn, options)

  if(options.lazy) {
    effect()
  }

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
    depsMap.set(target, (depsMap = new Map))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}