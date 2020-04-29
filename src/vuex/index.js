import applyMixin from './minix';
import ModuleCollection from './module/module-collection';
import {partial} from './until';

let vue;
class Store {
  constructor(option){
    // 将 option重新整理
    this._modules = new ModuleCollection(option);
    this._wrappedGetters = {};
    this.getters = {};
    this._makeLocalGettersCache = {};
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

  // 获取 namespaced 的 值 studnet/
  const nameSpace = Store._modules.getNamespace(path);
  const local = makeLocalContext(Store, path, nameSpace);
  module.forEachGetter((getterFn, getterName) => {
    // 将 namespace 和 getter 名称 拼接
    const type = nameSpace + getterName;
    registerGetter(Store, getterFn, type, local);
  })

  // 循环遍历 module
  module.forEachChild((childModule, childName) => {
    installModule(Store, rootState, path.concat(childName), childModule);
  })
}

/**
 * 设置 模块的 state，getter
 * @param {*} store 
 * @param {*} path 
 * @param {*} nameSpace 
 */
function makeLocalContext(store, path, nameSpace) {
  const isNameSpaced = nameSpace !== '';
  const local = {};
  Object.defineProperties(local, {
    state: {
      get:() => getNestedState(path, store.state)
    },
    getters: {
      get: isNameSpaced ? () => makeLocalGetter(store, nameSpace) : () => store.getters,
    }
  })

  return local
}

/**
 * 设置本模块的 getter
 * @param {*} store 
 * @param {*} nameSpace 
 */
function makeLocalGetter(store, nameSpace) {
  if(!store._makeLocalGettersCache[nameSpace]) {
    const splitPos = nameSpace.length;
    const gettersProxy = {};

    Object.keys(store.getters).forEach(keys =>{
      if (keys.slice(0, splitPos) !== nameSpace) return;
      const getterName = keys.slice(splitPos);
      // gettersProxy[getterName] = store.getters[keys];

      Object.defineProperty(gettersProxy, getterName, {
        get: () => store.getters[keys]
      })
    })

    store._makeLocalGettersCache[nameSpace] = gettersProxy;
  }

  return store._makeLocalGettersCache[nameSpace];
}

/**
 * 注册 _wrappedGetters
 * @param {*} store 
 * @param {*} getterFn 
 * @param {*} getterName 
 */
function registerGetter(store, getterFn, getterName, local) {
  console.log(local);
  store._wrappedGetters[getterName] = () => getterFn(local.state, local.getters, store.state, store.getters)
}

/**
 * @desc 获取state
 * @param {*} path 
 * @param {*} rootState 
 */
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

  const computed = {}
  const _wrappedGetters = store._wrappedGetters;
  store._makeLocalGettersCache = {};
  Object.keys(_wrappedGetters).forEach(getterName => {
    // computed[getterName] = () => _wrappedGetters[getterName](store);
    // store.getters[getterName] =  store._Vm[getterName];

    computed[getterName] = partial(_wrappedGetters[getterName], store);
    Object.defineProperty(store.getters, getterName, {
      get: () => store._vm[getterName],
      enumerable: true,
    })
  })

  store._vm = new vue({
    data: option.state,
    computed,
  })

  store.state = store. _vm.$data;
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