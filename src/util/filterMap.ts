export function filterMap<K, V>(map: Map<K, V>, predicate: (value: V, key: K, map: Map<K, V>) => boolean) {
  const result = new Map<K, V>()
  map.forEach((value, key, map) => {
    if (Boolean(predicate(value, key, map))) {
      result.set(key, value)
    }
  })
  return result
}
