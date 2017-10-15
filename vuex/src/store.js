import Modules from './modules'
import {forEachValue} from './util'

let Vue
export class Store {
  constructor(options = {}) {

    if(!Vue && window !== undefined && Vue !== window.Vue) {
      install(window.vue)
    }
    this.options = options
    this._modules = new Modules(options)
    this._mutations = Object.create(null)
    this._actions = Object.create(null)
    this._wrapGatter = Object.create(null)

    const store = this
    const { dispatch, commit } = this
    let state = options.state || {}
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    installModules(this._modules.root, this, [], state)
    resetStoreVM(state, this)
  }
  get state() {
    return this._vm._data.$$state
  }
  dispatch(type, payload) {
    let entry = this._actions[type]
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }
  commit(type,payload) {
    let entry = this._mutations[type]
    entry.forEach(function(handler) {
      handler(payload)
    })
  }
}

function installModules(modules, store, path, rootState) {
  if (path.length > 0) {
    const parentState = getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]
    Vue.set(parentState, moduleName, modules.state)
  }
  forEachValue(modules._raws.mutations, (handlers, key) => {
    store._mutations[key] || (store._mutations[key] = [])
    store._mutations[key].push((payload) => {
      handlers.call(store, modules._raws.state, payload)
    })
  })
  forEachValue(modules._raws.actions, (handlers, key) => {
    store._actions[key] || (store._actions[key] = [])
    store._actions[key].push((payload) => {
      handlers.call(store, {
        dispatch: store.dispatch,
        commit: store.commit,
        getters: modules._raws.getters,
        state: modules._raws.state,
        rootGetters: store.getters,
        rootState: store.state
      }, payload)
    })
  })
  forEachValue(modules._raws.getters, (handlers, key) => {
    if(store._wrapGatter[key]) {
      return console.log('Dont duplicate getter:', key)
    }
    store._wrapGatter[key] = () => {
      return handlers(
        modules._raws.state,
        modules._raws.getters,
        store.state,
        store.getters
      )
    }
  })
  forEachValue(modules._child, (module, key) => {
    installModules(module, store, path.concat(key), rootState)
  })
}

function resetStoreVM(state, store) {
  let oldVm = store._vm
  let computed = {}
  store.getters = {}
  forEachValue(store._wrapGatter, (getter, key) => {
    computed[key] = () => getter()
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })
  store._vm = new Vue({
    data: {
      $$state: state,
    },
    computed
  })
  if(oldVm) {
    Vue.nextTick(() => oldVm.$destroy())
  }
}
export function install(_Vue) {
  if(Vue === _Vue) {
    return
  }
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      if(this.$options.store) {
        this.$store = typeof this.$options.store === 'function' 
          ? this.$options.store()
          : this.$options.store
      } else if(this.$options.parent && this.$options.parent.$store) {
        this.$store = this.$options.parent.$store
      }
    }
  })
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}