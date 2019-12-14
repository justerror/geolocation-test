export function cloneAsObject(obj) {
  if (obj === null || !(obj instanceof Object)) {
    return obj;
  }
  var temp = obj instanceof Array ? [] : {};
  for (var key in obj) {
    temp[key] = cloneAsObject(obj[key]);
  }
  return temp;
}
