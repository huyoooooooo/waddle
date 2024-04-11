export const isObject = value => typeof value == 'object' && value !== null
export const extend = Object.assign
export const isArray = Array.isArray
export const isIntegerKey = key => parseInt(key) + '' === key
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isFunction = (val: unknown): val is Function => typeof val === 'function'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export const hasChanged = (oldValue, value) => !Object.is(oldValue, value)

export * from './shapeFlags'