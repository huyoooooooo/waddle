// 把 packages 目录下的所有包进行打包
const fs = require('fs')
const execa = require('execa')  // 开启子进程进行打包，最终使用 rollup 来进行打包

// 读取 packages 下的文件目录
const targets = fs.readdirSync('packages').filter(f => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }
  return true
})

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

function runParallel(targets, iteratorFn) {
  const res = []
  for(const item of targets) {
    const p = iteratorFn(item)
    res.push(p)
  }
  return Promise.all(res)
}

runParallel(targets, build)