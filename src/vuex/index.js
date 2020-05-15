import applyMixin from './minix';
import ModuleCollection from './module/module-collection';
import {partial, isObject, forEachValue, isPromise} from './until';

let vue;
class Store {
  constructor(option){
    // 将 option重新整理
    this._modules = new ModuleCollection(option);
    this._wrappedGetters = {};
    this.getters = {};
    this._makeLocalGettersCache = {};
    this._mutations = {};
    // _actions
    this._actions = {};
    // 是否是严格模式
    this._strict = !!option.strict;
    // 修改 state 锁
    this._comitting = false;

    // 改变 commit  dispatch 函数 的this 指向
    const store = this;
    const {commit, dispatch} = this;
    this.commit = function(type, playod) {
      return commit.call(store, type, playod);
    }
    // // 外部调用的是这个dispatch  所以这边也需要返回值
    this.dispatch = (type, payload) => {
      return dispatch.call(store, type, payload);
    }

    installModule(this, option.state, [], this._modules.root)
    // $store.state 及 数据双向绑定
    resetStoreVM(this, option); 
  }

  get state() {
    return this._vm.$data;
  }

  commit(_type, _payload) {
    const {type, payload} = unifyObjectStyle(_type, _payload);
    const mutations = this._mutations[type];
    this._withCommit(()=>{
      forEachValue(mutations, (mutationFn) => mutationFn(payload));
    })
  }

  _withCommit(fn) {
    const _comitting = this._comitting;
    this._comitting = true;
    fn();
    this._comitting = _comitting;
  }

  dispatch(_type, _payload) {
    const {type,payload} = unifyObjectStyle(_type, _payload);
    const actions = this._actions[type];

    if(!actions) {
      throw new Error('Error:type');
    }
    
    // 返回的每个函数的执行结果 每个结果都是一个promise
    const result = actions.length > 1 ?
                  Promise.all(actions.map(actionFn=> actionFn(payload)))
                  : actions[0](payload);
 
    return result;
   //forEachValue(actions, actionFn=> actionFn(playod))
  }
}

/**
 * 整理 payload 格式
 * @param {*} _type 
 * @param {*} _payload 
 */
function unifyObjectStyle(type, payload) {
  if (!isObject(type)) {
    return {
      type,
      payload,
    }
  }
  return type;
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

  // mutaions
  module.forEachMutation((mutationFn, mutaionName) => {
    const type = nameSpace + mutaionName;
    registerMutations(Store, mutationFn, type, local)
  })
 

 // getter
  module.forEachGetter((getterFn, getterName) => {
    // 将 namespace 和 getter 名称 拼接
    const type = nameSpace + getterName;
    registerGetter(Store, getterFn, type, local);
  })

  // action
  module.forAction((childAction, childName) => {
    const type = nameSpace + childName;
    registerActions(Store, type, childAction, local);
  })

  // 循环遍历 module
  module.forEachChild((childModule, childName) => {
    installModule(Store, rootState, path.concat(childName), childModule);
  })
}

/**
 * 注册 actions
 * @param {*} store 
 * @param {*} actionName 
 * @param {*} actionFn 
 * @param {*} local 
 */
function registerActions(store, actionName, actionFn, local) {
  const entry = store._actions[actionName] || (store._actions[actionName] = []);
  // 改变 action 函数中 this 指向，call
  entry.push((playod)=> {
    let res = actionFn({
      commit: local.commit,
      dispatch: local.dispatch,
      getter: local.getters,
      rootGetters: store.getters,
      rootState: store.state,
      state: local.state,
    }, playod);

    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    return res;
  });
}

/**
 * 设置 模块的 state，getter
 * @param {*} store 
 * @param {*} path 
 * @param {*} nameSpace 
 */
function makeLocalContext(store, path, nameSpace) {
  const noNamespace = nameSpace === '';
  const local = {
    commit: noNamespace ? store.commit : (_type, _payload) => {
      const {type, payload} = unifyObjectStyle(_type, _payload);
      store.commit(nameSpace + type, payload);
    },
    dispatch: noNamespace ? store.dispatch : (_type, _payload) => {
      const {type, payload} = unifyObjectStyle(_type, _payload);
      store.dispatch(nameSpace + type, payload);
    },
  };

  Object.defineProperties(local, {
    state: {
      get:() => getNestedState(path, store.state)
    },
    getters: {
      get: noNamespace ?  () => store.getters : () => makeLocalGetter(store, nameSpace),
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
  store._wrappedGetters[getterName] = () => getterFn(local.state, local.getters, store.state, store.getters)
}

/**
 * 注册mutation
 * @param {*} store 
 * @param {*} mutationFn 
 * @param {*} mutationName 
 * @param {*} local 
 */
function registerMutations(store, mutationFn, mutationName, local) {
  if (!store._mutations[mutationName]) {
    store._mutations[mutationName] = [];
  }
  
  store._mutations[mutationName].push((payload)=> mutationFn.call(store, local.state, payload))
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

  // store.state = store. _vm.$data; Store 中 get state
  if (store._strict) {
    enableStrictMode(store);
  }
}

/**
 * 严格模式
 * @param {*} store 
 */
function enableStrictMode(store) {
  store._vm.$watch(function(){
    return store.state
  },function(){
    if(!store._comitting) {
      throw new Error('Error: [vuex] do not mutate vuex store state outside mutation handlers.');
    }
  },{
    deep: true,
    sync: true,
  })
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