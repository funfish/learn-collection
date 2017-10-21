export function normalizeLocation(raw, route) {
  const next = { path: raw }
  const parsedPath = parsePath(next.path || '')
  const path = parsedPath.path
  const query = parseQuery(parsedPath.query)
  let hash = parsedPath.hash
  if (hash && hash.charAt(0) !== '#') {
    hash = `#${hash}`
  }  
  return {
    path,
    query,
    hash,
  }
}

function parsePath(path) {
  let hash = ''
  let query = ''
  const hashIndex = path.indexOf('#')
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex)
    path = path.slice(0, hashIndex)
  }

  const queryIndex = path.indexOf('?')
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1)
    path = path.slice(0, queryIndex)
  }

  return {
    path,
    query,
    hash
  } 
}

function parseQuery(query) {
  let res = []
  query = query.trim().replace(/^(\?|#|&)/, '')
  query.split('&').forEach(param => {
    const parts = param.replace(/\+/g, ' ').split('=')
    const key = decodeURIComponent(parts.shift())
    const val = decodeURIComponent(parts.shift())

    if (res[key] === undefined) {
      res[key] = val
    } else if (Array.isArray(res[key])) {
      res[key].push(val)
    } else {
      res[key] = [res[key], val]
    }
  })

  return res
}