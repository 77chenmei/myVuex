import applyMixin from './minix';
import ModuleCollection from './module/module_collection';
import { forEachValue, partial, isObject } from './until';

let Vue;
/**
 * 2.
 */
class Store {
  constructor(option) {
    // this.state = _option.state;  
    /**
     * 页面可以正常拿到 $store.state.count 的值，
     * 在点击改变该值的时候，打印出来，发现值是发生了变化，但是页面并没有重新渲染
     * 页面重新渲染 是vue，但是该值与vue 并没有任何关联；
     * 故，有下操作：
     */
    // this._vm = new Vue({
    //   data: option.state || {},
    // });
    // this.state = this._vm.$data;

    this._wrappedGetters = {};
    this._mutaions = {};
    this._makeLocalGettersCache = {};
    this._strict = !!option.strict;
    this._comitting = false;
    /**
     * 当前才只能拿到 根模块下的 state，modules 下的state 并没有能拿到
     */
    this._modules = new ModuleCollection(option);
    // 安装模块 (this,根状态, 当前模块的路径, 当前模块实体)
    const rootState = this._modules.root.state;
    
    installModule(this, rootState, [], this._modules.root);

    resetStoreVM(this, rootState);
    /**
     * 3. 实现 getter 
     * 1. 将各个模块上的getters 统一放到 store 上  this._wrappedGetters = {}
     * 2. 通过 this._wrappedGetters 得到 this.getters 值
     * 3. getters 是vm上的计算属性
     * 4. namespaced，改变： getters 属性名： doubleCount -> student/doubleCount
     *                      getters 函数参数(前两个参数变化) 根模块state getter -> 本模块 state getter
     */


     /**
      * 1. 将各个模块上的actions 都统一到store上，无论是root上还是其他子模块上
      * store._actions = {
      *   countAdd: [fn, fn],
      * }
      * 2. 如有命名空间，将对应的actios函数的名字前应该加上命名空间的名字
      * 3. 由于需要dispatch 一个mutation，所以在 store 上应有commit 方法。 
      * 4. action 函数返回值 应该为 promise
      * 5. 如果一个模块存在命名空间，mutation 对action 进行分发，不需要加上命名空间
      */
  }

  get state() {
    return this._vm.state;
  }

  commit(_type, _playod) {
    const {type,playod} = unifyObjectStyle(_type, _playod);
    const mutations = this._mutaions[type];

    this._withCommit(() => {
      forEachValue(mutations, mutationFn=> mutationFn(playod))
    })
  }

  _withCommit(fn) {
    const _comitting = this._comitting;
    this._comitting = true;
    fn();
    this._comitting = _comitting;
  }
} 

function unifyObjectStyle(type, playod) {
  if(!isObject(type)) {
    return {
      type,
      playod,
    };
  }
  return type;
}

/**
 * @desc 重置store 实例
 * @param {Store} store 
 * @param {Object} rootState 
 */
function resetStoreVM(store, rootState) {

  // 3.2 根据_wrappedGetters 得到 getters
  const computed = {};
  store.getters = {};
  store._makeLocalGettersCache = Object.create(null);

  const wrappedGetters = store._wrappedGetters;
  forEachValue(wrappedGetters, (getterFn, getterName) => {
    computed[getterName] = partial(getterFn, store);
    // 此时 store._vm 还未存在且无值
    // store.getters[getterName] = store._vm[getterName];
    Object.defineProperty(store.getters, getterName, {
      get: () => store._vm[getterName],
      enumerable: true,
    })
  })

  store._vm = new Vue({
    data: {
      state: rootState,
    },
    computed,
  })
  // store.state = this._vm.$data;

  console.log(store._strict);
  if (store._strict) {
    enableStrictMode(store);
  }
  
}

/**
 * 严格模式
 * @param {}} store 
 */
function enableStrictMode(store) {
  store._vm.$watch(function(){
    return this.state;
  },function(){
    // store._comitting true 是通过 mutation 更改 false 不是通过mutation 更改
    if(!store._comitting) {
      throw new Error('Error: [vuex] do not mutate vuex store state outside mutation handlers.');
    }
  },{
    deep: true,
    sync: true,  // 同步执行，data 更改 立马执行 watch
    // 由 所有数据更新完成 执行watch -> 每更改一次值，watch 就执行一次
  })
}

/**
 * @desc 注册模块
 * @param {Object} rootState  模块状态state
 * @param {Array} path 当前模块的路径
 * @param {Object} rawModule 当前模块实体
 */
function installModule(Store,rootState, path, module) {
  const isRoot = path.length === 0;
  if (!isRoot) {
    // 1. 父模块状态
    const parent = getNestedState(path.slice(0,-1), rootState);
    // 2. 当前模块名
    const moduleName = path[path.length - 1];
    // 3. 给父模块放置 该子模块
    parent[moduleName] = module.state;
  }

  const namespace = Store._modules.getNamespace(path);
  // 3-4.2
  const local = makeLocalContext(Store, namespace, path);
  // 3-1
  module.forEachGetter((childGetter, childName) => {
    const getterType = namespace + childName;
    registerGetter(Store, getterType, childGetter, local);
    // Store._wrappedGetters[childName] = () => childGetter(rootState);
  })

  module.forMutation((childMutation, childName) => {
    const mutationType = namespace + childName;
    registerMutations(Store, mutationType, childMutation, local);
  })

  // 循环遍历 module
  module.forEachChild((childModule, childName) => {
    installModule(Store, rootState, path.concat(childName), childModule);
  })
}

/**
 * @desc 获取本地数据
 * @param {Store} store 
 * @param {string} namespace 
 * @param {Array} path 
 */
function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === '';
  const local = {};

  Object.defineProperties(local, {
    state: {
      get: () => getNestedState(path, store.state),
    },
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetter(store, namespace),
    },
  })
  return local
}

/**
 * @desc 生成本地 getter
 * @param {Store} store 
 * @param {String} namespace 
 */
function makeLocalGetter(store, namespace) {
  console.log('makeLocalGetter');
  if (!store._makeLocalGettersCache[namespace]) {
    const splitPos = namespace.length;
    const gettersProxy = {};

    Object.keys(store.getters).forEach(getterName => {
    // forEachValue(store.getters, (getterFn, getterName) => {
      if (getterName.slice(0, splitPos) !== namespace) return;
      const localType = getterName.slice(splitPos);

      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[getterName],
        enumerable: true,
      })
    });
    store._makeLocalGettersCache[namespace] = gettersProxy;
  }

  return store._makeLocalGettersCache[namespace];
}  

function getNestedState(path, rootState) {
  return path.reduce((state, key)=> state[key], rootState)
}

function registerGetter(store, type, getter, local) {
  store._wrappedGetters[type] = () => getter(local.state, local.getters, store.state, store.getters);
}

function registerMutations(store, type, mutation, local) {
  if(!store._mutaions[type]) {
    store._mutaions[type] = []
  }
  store._mutaions[type].push((playod) => mutation.call(store, local.state, playod))
}
/**
 * 1. 
 * @desc 安装函数，Vue.use(Vuex),会调用 Vuex.install()
 */
function install(_Vue) {
  // 给vue 混入方式，即将$store挂入倒vue 实例上
  applyMixin(_Vue);
  Vue = _Vue;
}

export {
  install,
  Store,
}