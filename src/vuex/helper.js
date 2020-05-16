import { isObject } from './until';

export const mapState = normalizeNameSpace((nameSpace, map) => {
  const res = {};
  normalizeMap(map).forEach(( {key, val} ) => {
    // res[key] = 10;
    res[key] = function() {
      // this 指向当前的vue 实例
      const module = getModuleByNameSpace(this.$store, 'mapState', nameSpace);
      const context = module ? module.context : this.$store;
      const { state, getters} = context;
      return typeof val === 'function' ? val.call(this, state, getters) : state[val];
    }
  })
  return res
});

export const mapGettrers = normalizeNameSpace((nameSpace, map) => {
  const res = {};
  normalizeMap(map).forEach(({key, val}) => {
    val = nameSpace + val
    res[key] = function() {
      if ( nameSpace && !getModuleByNameSpace(this.$store, 'mapGetters', nameSpace)) return;
      if (! (val in this.$store.getters)) {
        console.error (`[vuex] unkown getter: ${val}`)
        return;
      }
      // const module = getModuleByNameSpace(this.$store, 'mapState', nameSpace);
      // const getters = module ? module.context.getters : this.$store.getters;
      // return getters[val];
      return this.$store.getters[val];
    }
  })
  return res
});

export const mapMutations = normalizeNameSpace((nameSpace, map) => {
  const res = {};
  normalizeMap(map).forEach(({key, val}) => {
    // val = nameSpace + val; vuex 内部 local.commit 会自动加入 命名空间
    res[key] = function(...arg) {
      let commit = this.$store.commit;
      // vuex 内部 local.commit 会自动加入 命名空间
      if (nameSpace) {
        const module = getModuleByNameSpace(this.$store, 'mapMutations', nameSpace);
        if (!module) {
          return
        }
        commit = module.context.commit;
      }
      commit.call(this.$store, val, ...arg);
    }
  })
  return res;
});

export const mapActions = normalizeNameSpace((nameSpace, map) => {
  const res = {};
  console.log(nameSpace, map);
  normalizeMap(map).forEach(({key, val}) => {
    res[key] = function(...arg) {
    let dispatch = this.$store.dispatch;
    // vuex 内部 local.commit 会自动加入 命名空间
    if (nameSpace) {
      const module = getModuleByNameSpace(this.$store, 'mapActions', nameSpace);
      if (!module) {
        return
      }
      
      dispatch = module.context.dispatch;
    }
      dispatch.call(this.$store, val, ...arg);
    }
  })
  return res;
});
/**
 * 标准化命名空间
 * @param {*} fn 
 */ 
function normalizeNameSpace(fn) {
  return (nameSpace, map) => {
    if (typeof nameSpace !== 'string') {
      map = nameSpace;
      nameSpace = '';
    } else if (nameSpace.charAt(nameSpace.length -1 ) !== '/') {
      nameSpace += '/'
    }
    // 注意 在fn 中返回是什么值  在这边也需要将值返回
    return fn(nameSpace, map);
  }
}

/**
 * 标准化map
 * normalizeMap([1,2]) => [{key:1, val:1}, {key:2, val:2}];
 * normalizeMap({a: 1, b: 2}) => [{key: 'a', val: 1}, {key: 'b', val:2}];
 * @param {Array | Object} map 
 * @return { Array }
 */
function normalizeMap(map) {
  if (!isValidMap(map)) return;
  
  return Array.isArray(map) ? map.map(key => ({ // 数组
    key,
    val: key,
  })) : Object.keys(map).map(key => ({  // 不是数组
    key,
    val: map[key],
  }))
}

/**
 * 校验Map 是否合法
 * @param {*} map 
 * @return {Boolean}
 */
function isValidMap(map) {
  return Array.isArray(map) || isObject(map)
}

/**
 * 根据命名空间 在 store 中查找
 * @param {*} store 
 * @param {string} helper 
 * @param {string} nameSpace 
 */
function getModuleByNameSpace(store, helper, nameSpace) {
  if (!nameSpace) return;
  const module =  store._modulesNamespaceMap[nameSpace];

  if(!module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${nameSpace}`)
    return;
  }

  return module
}