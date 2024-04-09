import { findSharedValues } from './findSharedValues'

describe('findSharedValues()', () => {
  describe('with shared objects', () => {
    test('single shared object', () => {
      const shared = {
        foo: 'bar'
      }
      const data = {
        prop: shared,
        prop2: shared
      }

      const sharedValues = findSharedValues(data)

      expect(sharedValues.size).toEqual(1)
      expect(sharedValues.get(shared)).toEqual(['/prop', '/prop2'])
    })
    test('nested shared objects', () => {
      const shared1 = {
        foo: 'foo'
      }
      const shared2 = {
        bar: 'bar',
        nested: shared1
      }
      const data = {
        prop: shared2,
        prop2: shared2,
        prop3: shared1
      }

      const sharedValues = findSharedValues(data)

      expect(sharedValues.size).toEqual(2)
      expect(sharedValues.get(shared1)).toEqual(['/prop/nested', '/prop2/nested', '/prop3'])
      expect(sharedValues.get(shared2)).toEqual(['/prop', '/prop2'])
    })
    test('multiple nested shared objects', () => {
      const shared1 = {
        foo: 'foo'
      }
      const shared2 = {
        bar: 'bar',
        nested1: shared1,
        nested2: shared1
      }
      const data = {
        prop: shared2,
        prop2: shared2,
        prop3: shared1
      }

      const sharedValues = findSharedValues(data)

      expect(sharedValues.size).toEqual(2)
      expect(sharedValues.get(shared1)).toEqual([
        '/prop/nested1',
        '/prop/nested2',
        '/prop2/nested1',
        '/prop2/nested2',
        '/prop3'
      ])
      expect(sharedValues.get(shared2)).toEqual(['/prop', '/prop2'])
    })
    test('circular object', () => {
      const shared: any = {
        foo: 'bar'
      }
      shared.recursive = shared
      const data = {
        prop: shared
      }

      const sharedValues = findSharedValues(data)

      expect(sharedValues.size).toEqual(1)
      expect(sharedValues.get(shared)).toEqual(['/prop', '/prop/recursive'])
    })
    test('circular object with multiple chains', () => {
      const shared: any = {
        foo: 'bar'
      }
      shared.recursive = shared
      const data = {
        prop: shared,
        prop2: shared
      }

      const sharedValues = findSharedValues(data)

      expect(sharedValues.size).toEqual(1)
      expect(sharedValues.get(shared)).toEqual(['/prop', '/prop/recursive', '/prop2', '/prop2/recursive'])
    })
  })
})
