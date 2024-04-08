import { patchAttr } from "./modules/attrs"
import { patchClass } from "./modules/class"
import { patchStyle } from "./modules/style"
import { patchEvents } from "./modules/events"

export const patchProp = (el, key, preValue, nextValue) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue)
      break;
    case 'style':
      patchStyle(el, preValue, nextValue)
      break;
    default:
      if (/$on[^a-z]/.test(key)) {
        patchEvents(el, key, nextValue)
      } else {
        patchAttr(el, key, nextValue)
      }
      break;
  }
}