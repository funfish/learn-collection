import Regexp from 'path-to-regexp'
export function createRouteMap(routes) {
  let pathList = []
  let pathMap = Object.create(null)
  let nameMap = Object.create(null)

  routes.forEach(route => {
    let record = {
      path: route.path,
      name: route.name,
      components: route.components || { default: route.component },
      regex: Regexp(route.path, []),
    }
    pathList.push(route.path)
    pathMap[route.path] = record
    nameMap[route.path] = route.name
  })

  return {
    pathList,
    pathMap,
    nameMap
  }
}