import { ShapeFlags } from "@vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./component"
import { effect } from "@vue/reactivity"

export function createRenderer(options) {

  const setupRenderEffect = (instance, initialVNode, container) => {
    // 创建 effect，render 函数中的数据会收集 effect
    // 每个组件实例都有一个 effect
    instance.update = effect(function componentEffect() {
      if (!instance.isMounted) {
        // 初次渲染
        const proxyToUse = instance.proxy
        // $vnode   _vnode
        // vnode    subTree
        const subTree = (instance.subTree = instance.render.call(proxyToUse, proxyToUse))
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        // 更新
      }
    })
  }

  const mountComponent = (initialVNode, container) => {
    const instance = (initialVNode.component = createComponentInstance(initialVNode))
  
    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container)
  }

  const processComponent = (n1, n2, container) => {
    if (n1 == null) {       // 初始化
      mountComponent(n2, container)
    } else {

    }
  }

  const patch = (n1, n2, container) => {
    const { shapeFlag } = n2

    if (shapeFlag & ShapeFlags.ELEMENT) {
      console.log('element')
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container)
    }
  }

  const render = (vnode, container) => {
    patch(null, vnode, container)
  }
  
  return {
    createApp: createAppAPI(render)
  }
}