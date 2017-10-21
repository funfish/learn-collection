import { createRouteMap } from './createRouteMap'
import { normalizeLocation } from './util'

export function createMatcher(routes, router) {
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  function match(raw, currentRoute) {
    const location = normalizeLocation(raw, currentRoute)
    location.params = {}
    for(let i = 0; i < pathList.length; i++) {
      const record = pathMap[pathList[i]]
      if(matchRoute(record.regex, location.path, location.params)) {
        return _createRoute(location, record)
      }
    }
  }
  return {
    match,
    // addRoutes
  }
}

export function _createRoute(location, record) {
  let route = {
    path: location.path || '/',
    name: location.name || (record && record.name),
    query: location.query || {},
    params: location.params || {},
    hash: location.hash || '',
    matched: record
  }
  return Object.freeze(route)
}

function matchRoute(regex, path, params) {
  const m = path.match(regex)

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (let i = 1, len = m.length; i < len; ++i) {
    const key = regex.keys[i - 1]
    const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
    if (key) {
      params[key.name] = val
    }
  }

  return true
}