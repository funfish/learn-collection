import { _createRoute } from './createMatcher'
export class HashHistory {
  constructor(router) {
    this.router = router
    this.current = _createRoute({path: '/'}, null)
  }
  setupListeners () {
    window.addEventListener('hashchange', () => {
      this.transitionTo(this.getCurrentLocation(), route => {
        pushHash(route.path)
      })
    })
  }
  listen(cb) {
    this.cb = cb
  }
  push(location) {
    this.transitionTo(location, route => {
      pushHash(route.path)
    })
  }
  transitionTo(location, onComplete, onAbort) {
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
      this.updateRoute(route)
      onComplete && onComplete(route)
      this.ensureURL()
    })
  }
  confirmTransition(route, onComplete) {
    if(route.matched==this.current.matched) {
      this.ensureURL()
      return
    }
    onComplete()
  }
  getCurrentLocation() {
    const href = window.location.href
    const index = href.indexOf('#')
    return index === -1 ? '' : href.slice(index + 1)
  }
  updateRoute(route) {
    this.current = route
    this.cb && this.cb(route)
  }
  ensureURL() {
    if(this.getCurrentLocation() !== this.current.path) {
      window.location.hash = this.current.path
    }
  }
}
function pushHash(location) {
  window.location.hash = location
}