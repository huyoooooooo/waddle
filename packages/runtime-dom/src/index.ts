import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"
import { createRenderer } from "@vue/runtime-core"

const rendererOptions = extend({ patchProp }, nodeOps)

export function createApp(rootComponent, rootProps = null) {
  const app = createRenderer(rendererOptions).createApp(rootComponent, rootProps)
  const { mount } = app
  app.mount = function (container) {
    container = nodeOps.querySelector(container)
    container.innerHTML = ''
  
    mount(container)
  }

  return app
}

export * from "@vue/runtime-core"