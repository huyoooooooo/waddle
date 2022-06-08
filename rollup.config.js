// rollup 配置
// [!] Error: Config file must export an options object, or an array of options objects

import path from 'path'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import resolvePlugin from '@rollup/plugin-node-resolve'

// 根据环境变量中的target属性，获取对应模块中的 package.json
// console.log(process.env.TARGET)

const packagesDir = path.resolve(__dirname, 'packages')   // 找到 packages
// packageDir 打包的基准目录
const packageDir = path.resolve(packagesDir, process.env.TARGET)    // 找到要打包的某个包
// 永远针对的是某个模块
const resolve = (p) => path.resolve(packageDir, p)

const pkg = require(resolve('package.json'))
// console.log(pkg)
const name = path.basename(packageDir)  // 取文件名

// 对打包类型 先提供一个映射表，根据你提供的 formats 来格式化需要打包的内容
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-buildler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'  // 立即执行函数
  }
}

const options = pkg.buildOptions  // 自己在package.json中定有的选项

function createConfig(format, output) {
  output.name = options.name
  output.sourcemap = true     // 生成 sourcemap
  
  // 生成 rollup 配置
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),  // json 插件
      ts({     // ts   插件
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()   // 解析第三方模块插件
    ]
  }
}

// rollup 最终需要到处配置
export default options.formats.map(format => createConfig(format, outputConfig[format]))