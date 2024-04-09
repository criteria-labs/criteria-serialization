import { Replacer } from './Replacer'

function makeDefaultReplacer() {
  return Replacer(function (key, value, { currentPointer, pointers }) {
    if (currentPointer !== pointers[0]) {
      return { $ref: `#${pointers[0]}` }
    }
    return value
  })
}

describe('JSON.stringify()', () => {
  describe('simple', () => {
    test('same behavior as JSON.stringify()', () => {
      const data = {
        number: 123.45,
        string: 'string',
        boolean: true,
        null: null,
        undefined: undefined,
        object: {
          property: {}
        },
        array: [{}],
        function: function () {}
      }

      const text = JSON.stringify(data, makeDefaultReplacer(), '  ')

      expect(text).toEqual(JSON.stringify(data, null, '  '))
    })
  })
  describe('with shared objects', () => {
    test('single shared object', () => {
      const shared = {
        foo: 'bar'
      }
      const data = {
        prop1: shared,
        prop2: shared
      }

      const text = JSON.stringify(data, makeDefaultReplacer(), '  ')

      expect(text).toEqual(
        JSON.stringify(
          {
            prop1: {
              foo: 'bar'
            },
            prop2: {
              $ref: '#/prop1'
            }
          },
          null,
          '  '
        )
      )
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
        prop1: shared2,
        prop2: shared2,
        prop3: shared1
      }

      const text = JSON.stringify(data, makeDefaultReplacer(), '  ')

      expect(text).toEqual(
        JSON.stringify(
          {
            prop1: {
              bar: 'bar',
              nested: {
                foo: 'foo'
              }
            },
            prop2: {
              $ref: '#/prop1'
            },
            prop3: {
              $ref: '#/prop1/nested'
            }
          },
          null,
          '  '
        )
      )
    })
    test('circular object', () => {
      const shared: any = {
        foo: 'bar'
      }
      shared.recursive = shared
      const data = {
        prop: shared
      }

      const text = JSON.stringify(data, makeDefaultReplacer(), '  ')

      expect(text).toEqual(
        JSON.stringify(
          {
            prop: {
              foo: 'bar',
              recursive: {
                $ref: '#/prop'
              }
            }
          },
          null,
          '  '
        )
      )
    })
  })
  describe('custom reference', () => {
    test('with $defs as last property', () => {
      const shared = {
        foo: 'bar'
      }
      const data = {
        prop: shared,
        $defs: {
          shared
        }
      }

      const text = JSON.stringify(
        data,
        Replacer(function (key, value, { currentPointer, pointers }) {
          const definition = pointers.find((pointer) => /^\/\$defs\/([^/]*)$/.test(pointer)) ?? pointers[0]
          if (currentPointer !== definition) {
            return {
              $ref: `#${definition}`
            }
          }
          return value
        }),
        '  '
      )

      expect(text).toEqual(
        JSON.stringify(
          {
            prop: {
              $ref: '#/$defs/shared'
            },
            $defs: {
              shared: {
                foo: 'bar'
              }
            }
          },
          null,
          '  '
        )
      )
    })
  })
})
