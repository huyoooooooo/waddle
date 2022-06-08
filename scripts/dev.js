// 只正对具体的某个包打包
const fs = require('fs')
const execa = require('execa')  // 开启子进程进行打包，最终使用 rollup 来进行打包

// 读取 packages 下的文件目录
const target = 'reactivity'

// 对目标模块进行打包, 且并行打包
async function build(target) {  // rollup -c --environment TARGET: 
  await execa('rollup', 
    [
      '-c', 
      '--environment', 
      `TARGET:${target}`
    ],
    { stdio: 'inherit' }  // ※ 当子进程打包的信息共享给父进程
  )
  // console.log(target)
}

build(target)