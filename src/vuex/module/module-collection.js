import Module from './module';

export default class ModuleCollection {
  constructor(rawModlue){
    this.register([], rawModlue)
  }

  /**
   * @desc 注册模块
   * @param {Array} path  []=> root ['student'] => root/student  ['student','a'] => root/student/a
   * @param {Object} rawModule 当前模块
   */
  register(path,rawModlue) {
    const newModule = new Module(rawModlue);

    // 根路径
    if (path.length === 0) {
      this.root = newModule;
    } else {
      // 1. 获取父节点
      const parenModule = this.get(path.slice(0,-1));
      // 2. 当前模块的名字
      const rawModlueName = path[path.length - 1];
      // 3. 挂载到父模块
      parenModule._chidren[rawModlueName] = newModule;
    }

    // 判断当前模块是否存在子模块
    if (rawModlue.modules) {
      forEachValue(rawModlue.modules, (childModule, moduleName) => {
        this.register(path.concat(moduleName), childModule);
      })
    }
  }

  get(path) {
    return  path.reduce((module, key) => module.getChild(key), this.root);
  }
}