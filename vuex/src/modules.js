import {forEachValue} from './util'

export default class Modules {
  constructor(rootModules) {
    this.root = new Module(rootModules)
    this.registerModules([], this.root)
  }
  registerModules(path, rawModules) {
    if(rawModules._raws.modules) {
      forEachValue(rawModules._raws.modules, (rawModulesChild, key) => {
        rawModules._child[key] = new Module(rawModulesChild)
        this.registerModules(path.concat(key), rawModules._child[key])
      })
    }
  }
}

class Module {
  constructor(modules) {
    this._raws = modules
    this._child = Object.create(null)
    this.state = (typeof modules.state === 'function') ? modules.state() : modules.state
  }
}