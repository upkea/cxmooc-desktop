// electron-builder beforeBuild 钩子：返回 false = node_modules 由外部处理（本项目零运行时依赖），
// 让打包器跳过 npm ls / 依赖收集，避免无谓的 node_modules 收集与打包。
module.exports = async function () {
  return false;
};