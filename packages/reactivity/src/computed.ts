import { isFunction } from "@vue/shared"
import { effect, track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operaters"

class ComputedRefImpl {
  private _dirty = true
  private _value
  public effect

  constructor(getter, public setter) {
    this.effect = effect(getter, { 
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          trigger(this, TriggerOpTypes.SET, 'value')
        }
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect()
    }

    track(this, TrackOpTypes.GET, 'value')

    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions) {
  let getter
  let setter

  const onlyGetter = isFunction(getterOrOptions)
  
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}