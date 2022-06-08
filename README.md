# 区别介绍

+ 源码采用 `monorepo` 的[方式](https://segmentfault.com/a/1190000019309820)进行管理, 将模块拆分到 package 目录中
+ `vue3` 采用 `ts` 开发, 增强类型检测, `vue2` 采用 `flow`
+ `vue3` 的性能优化, 支持 [tree-shaking](https://blog.csdn.net/qq_34629352/article/details/104256311), 不适用就不会打包
+ `vue2` 后期引入 RFC， 使每个版本改动可控 [rfcs](https://github.com/vuejs/rfcs/tree/master/active-rfcs)
+ `vue3` 劫持数据采用 proxy, `vue2` 劫持数据采用 defineProperty。defineProperty 有性能问题和缺陷
+ `vue3` 中对模板编译进行了优化，编译时生成了 [Block tree](https://blog.csdn.net/P6P7qsW6ua47A2Sb/article/details/120963447), 可以对子节点的动态节点进行收集, 可以减少比较, 并且采用了 `patchFlag` 标记动态节点
+ `vue3` 采用 `compositionApi` 进行组织功能, 解决反复横跳, 优化复用逻辑(mixin 带来的数据来源不清晰, 命名冲突等), 相比 `optionApi` 类型推断更方便
+ 增加了 `Fragment`、`Teleport`、`Suspense` 组件

# 架构分析

## 1. monorepo 介绍
  
monorepo 时管理项目代码的一种方式, 指在一个项目仓库中(repo)中管理多个模块/包(package)
  + 一个仓库可维护多个模块, 不用到处找仓库
  + 方便版本管理和依赖管理，模块之间的引用，调用都非常方便

<font color=gray>缺点：仓库体积会变大</font>

## 2. vue3 项目结构

  + reactivity: 响应式系统
  + runtime-core: 与平台无关的运行时核心(可以创建针对特定平台的运行时 - 自定义渲染器)
  + runtime-dom: 针对浏览器运行时, 包括 DOM API, 属性，事件处理
  + runtime-test: 用于测试
  + server-renderer: 用于服务器渲染
  + compiler-core: 与平台无关的编译器核心
  + compiler-dom: 针对浏览器的编译模块
  + compiler-ssr: 针对服务段渲染的编译模块
  + compiler-sfc: 针对单文件解析
  + size-check: 用来测试代码体积
  + template-explorer: 用来调试编译器输出的开发工具
  + shared: 多个包之间共享的内容
  + vue: 完整版本 包括运行时和编译时

```
                                    +-------------------------+
                                    |                         |
                                    |    @vue/compiler-sfc    |
                                    |                         |
                                    +-------------------------+
                                          |               |
                                          |               |
                                          ↓               ↓
                  +-------------------------+         +--------------------------+ 
                  |                         |         |                          |
        +--------→|    @vue/compiler-dom    |--------→|    @vue/compiler-core    |
        |         |                         |         |                          |
  +-----------+   +-------------------------+         +--------------------------+
  |           |
  |    vue    |
  |           |
  +-----------+   +------------------------+         +-------------------------+         +-------------------------+   
        |         |                        |         |                         |         |                         |
        +--------→|    @vue/runtime-dom    |--------→|    @vue/runtime-core    |--------→|     @vue/creativity     |
                  |                        |         |                         |         |                         |
                  +------------------------+         +-------------------------+         +-------------------------+
```

## 3.安装依赖

| 依赖                        | 功能                 |
| --------------------------- | -------------------- |
| typescript                  | 支持 typescript       |
| rollup                      | 打包工具              |
| rollup-plugin-typescript2   | rollup 和 ts 的桥梁   |
| @rollup/plugin-node-resolve | 解析 node 第三方模块  |
| @rollup/plugin-json         | 支持引入 json        |
| execa                       | 开启子进程方便执行命令 |

------

# 问题

## 编译问题
```javascript
Object.defineProperty(exports, '__esModule', { value: true });
```
似乎是 ts 编译所产生, 可以将 ts 先改成js 尝试一下, 还不太确定, 以及不明白这个代码的含义

## 包的管理问题

问题1：  
什么是软链, 以及为什么会产生软链(即在 node_modules 中出现了 @vue 文件夹, 指向了 packages)  

回答: 似乎是只要在 workspace 配置了就会产生添加到 node_modules，产生软链(同时只能使用yarn, npm不会有这个效果), 需要单独写个 demo 尝试一下
如果我是一个简单的非monorepo的方式, 会产生嘛?


问题2：  

产生软链之后，引用其他包会出现问题
```
Cannot find module '@vue/shared'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option? ts(2792)
```

可以看到这是 ts 报错， 需要在 tsconfig.json 配置中去配置----如何查找文件, 以及查找文件的路径
```json
{
  "moduleResolution": "node",                       /* Specify how TypeScript looks up a file from a given module specifier. */
  "baseUrl": ".",                                   /* Specify the base directory to resolve non-relative module names. */
  "paths": {
    "@vue/*": ["packages/*/src"]
  },                                                /* Specify a set of entries that re-map imports to additional lookup locations. */
    
}
```

这是 ts 的报错, 如果过说使用的是 js, 会自动解决吗? 如果不能, 没有配置文件可以去配置呀? 这个问题也要去尝试 demo 去试一下