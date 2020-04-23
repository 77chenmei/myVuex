import  Module from './module';
import { forEachValue } from '../until';

/**
 * @desc 转变格式
 * 将 options => 
 * {
 *     state: {},  // 当前模块的状态
 *     _rawModule:{},  // 当前模块
 *     _children: {},  // 当前模块的自模块
 * }
 */
export default class ModuleCollection {
  constructor(rawRootModule) {
    this.register([], rawRootModule);
  }

  /**
   * @desc 注册模块
   * @param {Array} path  []=> root ['student'] => root/student  ['student','a'] => root/student/a
   * @param {Object} rawModule 当前模块
   */
  register(path,rawModule) {
    // 得到一个新模块
    const newModule = new Module(rawModule);
    // 判断是否是根模块
    if (path.length === 0) {
      this.root = newModule;
    } else {
      // 1. 获取父节点
      const parent = this.get(path.slice(0, -1));
      // 2. 当前模块的名字
      const modelName = path[path.length - 1];
      // 3. 挂载到父模块
      parent._children[modelName] = newModule;
    }

    // 判断是否存在子模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, modelName) => {
        this.register(path.concat(modelName), rawChildModule);
      })
    }
  }

  /**
   * @desc 通过path 获取到对应的模块
   * @param {Array} path 模块路径 
   */
  get (path) {
    return path.reduce((module,key)=>{
      return module.getChild(key);
    },this.root)
  }

  /**
   * @desc 获取存在命名空间 keyname值
   * @param {Array} path 模块路径 
   */
  getNamespace(path) {
    let module = this.root;
    return path.reduce((namespace, key) => {
      module = module.getChild(key);
      return module._namespaced ? `${namespace}${key}/` : `${namespace}`;
    }, '')
  }
}

