export function forEachValue (obj, fn) {
  if(obj) {
    Object.keys(obj).forEach(key => fn(obj[key], key))    
  }
}