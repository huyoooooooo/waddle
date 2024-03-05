export const isObject = value => typeof value == 'object' && value !== null
export const extend = Object.assign
export const isArray = Array.isArray
export const isIntegerKey = key => parseInt(key) + '' === key
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export const hasChanged = (oldValue, value) => !Object.is(oldValue, value)