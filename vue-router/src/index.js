import { createMatcher } from './createMatcher'
import { HashHistory } from './hashHistory'
import Link from './link'
import View from './view'
export default class VueRouter {
  constructor(options={}) {
    this.history = new HashHistory(this)
    this.matcher = createMatcher(options.routes || [], this)
  }
  init(app) {
    const history = this.history
    const setupHashListener = () => {
      history.setupListeners()
    }
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    )
    history.listen(route => {
      app._route = route
    })    
  }
  match(raw, current) {
    return this.matcher.match(raw, current)
  }
  push(location) {
    this.history.push(location)
  }
}
let Vue
VueRouter.install = function(_Vue) {
  if(Vue === _Vue) {
    return
  }
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      if(this.$options.router) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else if(this.$options.parent && this.$options.parent.$router) {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
    }
  })
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })  
  Vue.component('router-view', View)
  Vue.component('router-link', Link)
}