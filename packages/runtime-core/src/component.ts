import { ShapeFlags, isFunction, isObject } from "@vue/shared"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attr: {},
    slot: {},
    setupState: {},   // setup 函数返回的状态
    ctx: {},
    isMounted: false,
  }

  instance.ctx = { _: instance }

  return instance
}

export function setupComponent(instance) {
  const { props, children, shapeFlag } = instance.vnode

  instance.props = props          // initProps
  instance.children = children    // initSlots

  if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    setupStatefulComponent(instance)
  }
}

function setupStatefulComponent(instance) {
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  const { setup } = instance.type

  if (setup) {
    const setupContext = createSetupContext(instance)
    const setupResult = setup(instance.props, setupContext)
  
    handleSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)
  }
}

// setup 返回值可以是 render 函数或者一个对象
function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type

  if (!instance.render) {

    if (!component.render && component.template) {
      // compile 之后赋值给 component.render
    }

    instance.render = component.render
  }
}

function createSetupContext(instance) {
  return {
    attr: instance.attr,
    slot: instance.slot,
    emit: () => {},
    expose: () => {}
  }
}