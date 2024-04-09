import { escapeReferenceToken } from '@criteria/json-pointer'
import { findSharedValues } from './findSharedValues'

export type ReplacerContext = {
  currentPointer: string
  pointers: string[]
}

export function Replacer(replacerWithContext: (this: any, key: string, value: any, context: ReplacerContext) => any) {
  let sharedValues: Map<any, string[]> | undefined = undefined
  const ancestors: [any, string][] = []
  return function replacer(this: any | undefined, key: string, value: any): any {
    let isRootValue = false
    if (!sharedValues) {
      sharedValues = findSharedValues(value)
      isRootValue = true
    }

    while (ancestors.length > 0 && (ancestors.at(-1) as [any, string])[0] !== this) {
      ancestors.pop()
    }
    ancestors.push([value, isRootValue ? '' : `/${escapeReferenceToken(key)}`])

    const currentPointer = ancestors.map((ancestor) => ancestor[1]).join('')

    const pointers = sharedValues.get(value)
    if (!pointers || pointers.length === 1) {
      return value
    }

    return replacerWithContext.bind(this)(key, value, { currentPointer, pointers })
  }
}
