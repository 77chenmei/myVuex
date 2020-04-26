import applyMixin from './minix';
import ModuleCollection from './module/module-collection';

let vue;
class Store {
  constructor(option){
    // 将 option重新整理
    this._modules = new ModuleCollection(option);
    installModule(this, option.state, [], this._modules.root)
    // $store.state 及 数据双向绑定
    resetStoreVM(this, option); 
  }
}

/**
 * @desc 注册模块
 * @param {Object} rootState  模块状态state
 * @param {Array} path 当前模块的路径 []=> root ['student'] => root/student  ['student','a'] => root/student/a
 * @param {Object} rawModule 当前模块实体
 */
function installModule(Store,rootState, path, module) {
  // 判断是否为根状态
  const isRoot = path.length === 0;

  if (!isRoot) {
    // 1. 父模块状态
    const parentState = getNestedState(path.slice(0, -1), rootState);
    // 2. 当前模块名
    const moduleName = path[path.length - 1];
    // 3. 给父模块放置 该子模块
    parentState[moduleName] = module.state;
  }


  // 循环遍历 module
  module.forEachChild((childModule, childName) => {
    installModule(Store, rootState, path.concat(childName), childModule);
  })
}

function getNestedState(path, rootState) {
  return path.reduce((moduleState, path)=>{
    return moduleState[path];
  },rootState)
}

/**
 * @desc 重置store 实例
 * @param {Store} store 
 * @param {Object} rootState 
 */
function resetStoreVM(store, option) {
  // this.state = option.state;
  const _vm = new vue({
    data: option.state
  })

  store.state = _vm.$data;
}

/**
 * @desc 安装函数
 * Vue.use(Vuex),会调用 Vuex.install()
 */
function install(_vue) {
  vue = _vue;
  // vue 混入 $store
  applyMixin(_vue);
}

export default{
  install,
  Store,
}