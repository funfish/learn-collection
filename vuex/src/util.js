export function forEachValue (obj, fn) {
  if(obj instanceof Object) {
    Object.keys(obj).forEach(key => fn(obj[key], key))    
  }
}