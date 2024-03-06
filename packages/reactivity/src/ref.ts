import { hasChanged, isArray } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operaters"
import { reactive } from "./reactive"

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value) {
  return createRef(value, true)
}

// ref 和 reactive 区别： reactive 使用 proxy 代理, ref 使用 defineProperty 代理

function createRef(value, isShallow = false) {
  return new RefImpl(value, isShallow)
}

class RefImpl {
  public _value
  public readonly __v_is_Ref = true
  
  constructor(public rawValue, public isShallow) {
    this._value = isShallow ? rawValue: reactive(rawValue)
  }

  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newVal) {
    if (hasChanged(this.rawValue, newVal)) {
      this.rawValue = newVal
      this._value = this.isShallow ? newVal: reactive(newVal)
      trigger(this, TriggerOpTypes.SET, 'value', newVal)
    }
  }
}

class ObjectRefImpl {
  public __v_is_Ref = true

  constructor(public target, public key) {

  }

  get value() {
    return this.target[this.key]
  }

  set value(newVal) {
    this.target[this.key] = newVal
  }
}

export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(object) {
  const res = isArray(object) ? new Array[object.length]: {}
  for (const key in object) {
    res[key] = new ObjectRefImpl(object, key)
  }
  return res
}
