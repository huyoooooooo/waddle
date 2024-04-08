import { extend } from "@vue/shared"
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"

const rendererOptions = extend({ patchProp }, nodeOps)

export {}