import { forEachValue } from '../until';

export default class Module {
  constructor (rawModule) {
    this.state = rawModule.state || {};
    this._rawModule = rawModule || {};
    this._children = rawModule.modules || {};
    this._namespaced = !!rawModule.namespaced;
  }

  /**
   * @desc 得到一个模块的子模块
   * @param {String} key 
   */
  getChild(key) {
    return this._children[key];
  }

  forEachChild(fn) {
    forEachValue(this._children, (value, key) => fn(value, key));
  }

  forEachGetter(fn) {
    const getters = this._rawModule.getters;
    if (getters){
      forEachValue(getters, (value, key) => fn(value, key));
    }
  }

  forMutation(fn) {
    const mutations = this._rawModule.mutations;
    if(mutations) {
      forEachValue(mutations, (value, key) => fn(value, key));
    }
  }
}