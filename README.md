# @criteria/serialization

Convert JavaScript values to JSON strings, with fine-grained control over how
shared values should be encoded.

## Getting started

To convert a data structure into a JSON string that uses JSON Reference
to encode shared references:

```js
const shared = {
  foo: 'bar'
}
const data = {
  prop1: shared,
  prop2: shared
}
const string = JSON.stringify(
  data,
  Replacer(function (key, value, { currentPointer, pointers }) {
    // If this value appears multiples times,
    // encode it directly the first time and encode a JSON Reference object all other times.
    if (currentPointer !== pointers[0]) {
      return {
        $ref: `#${pointers[0]}`
      }
    }
    return value
  }),
  '  '
)
// {
//   "prop1": {
//     "foo": "bar"
//   },
//   "prop2": {
//     "$ref": "#/prop1"
//   }
// }
```

Inspect the `pointers` value in the replacer function in order to better control
how shared values are encoded.

This example ensures that shared values are located in the definitions map:

```js
const shared = {
  foo: 'bar'
}
const data = {
  prop: shared,
  $defs: {
    shared
  }
}
const string = JSON.stringify(
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
// {
//   "prop": {
//     "$ref": "#/$defs/shared"
//   },
//   "$defs": {
//     "shared": {
//       "foo": "bar"
//     }
//   }
// }
```
