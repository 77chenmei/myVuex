export default class Module {
  constructor(rawModlue) {
    this.state = rawModlue.state || {};
    this._rawModule = rawModlue;
    this._chidren = rawModlue.modules;
  }

  getChild(key) {
    return this._chidren[key];
  }

  forEachChild(fn) {
    if (this._chidren) {
      
      Object.keys(this._chidren).forEach(moduleName => {
        fn(this._chidren[moduleName], moduleName);
      })
    }
  }
}