export const equals = (obj1, obj2) => {
  const isObject = (data) => typeof (data) === 'object'
  const hasOwnProperty = (obj1, obj2, key) => obj1.hasOwnProperty(key) === obj2.hasOwnProperty(key)

  return Object.keys(obj1).every(key => {
    if (!hasOwnProperty(obj1, obj2, key)) return false

    return isObject(obj1[key])
      ? equals(obj1[key], obj2[key])
      : obj1[key] === obj2[key]
  })
}
