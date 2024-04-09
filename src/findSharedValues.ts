import { escapeReferenceToken } from '@criteria/json-pointer'
import { filterMap } from './util/filterMap'

function visitValue(value: any, ancestors: object[], pointer: string, sharedValues: Map<object, string[]>) {
  switch (typeof value) {
    case 'object':
      if (value === null) {
        return
      }

      const pointers = sharedValues.get(value) ?? []
      pointers.push(pointer)
      sharedValues.set(value, pointers)

      if (ancestors.indexOf(value) !== -1) {
        return // circular value
      }

      if (Array.isArray(value)) {
        ancestors.push(value)
        for (let i = 0; i < value.length; i++) {
          visitValue(value[i], ancestors, `${pointer}/${String(i)}`, sharedValues)
        }
        ancestors.pop()
        return
      }

      if (ArrayBuffer.isView(value)) {
        return
      }

      let keys = Object.keys(value)
      const keyLength = keys.length

      ancestors.push(value)
      for (let i = 0; i < keyLength; i++) {
        const key = keys[i]
        visitValue(value[key], ancestors, `${pointer}/${escapeReferenceToken(key)}`, sharedValues)
      }
      ancestors.pop()
      return
    default:
      break
  }
}

export function findSharedValues(value: any): Map<any, string[]> {
  const sharedValues = new Map<object, string[]>()
  visitValue(value, [], '', sharedValues)
  return filterMap(sharedValues, (pointers) => pointers.length > 1)
}
