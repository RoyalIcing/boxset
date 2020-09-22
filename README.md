# Boxset

Problem: `Set` and `Map` are fantastic additions to JavaScript, providing better capabilities and performance for common tasks. However, their APIs are threadbare — they don’t provide methods for even merging two sets!

Boxset allows you to work with data structures such as [`Set`][mdn-set], [`Map`][mdn-map], [`FormData`][mdn-formdata] and interoperate between them.

It achieves this by conforming each of these collection into a function with the signature:

```ts
(key: Input) => Output
```

You can convert a collection using `source()`:

```ts
function source<Input, Output>(collection: Set<Input> | Map<Input, Output> | Array<Input> | FormData): (key: Input) => Output;
```

You can perform set operations such as `union`, `difference`, `complement`, `intersection`. Where possible these are done lazily, so you can combine multiple operations efficiently.

You can use the resulting function, calling or iterating through it, or you can transform into a `Set`, `Map`, `Object`, or `FormData` using `create(outputType, source)`.

```ts
import {
  source,
  complement,
  union,
  difference,
  intersection,
  create,
} from 'boxset';

const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);
const comedies = source(['Flight of the Conchords']);

const shows = union(dramas, comedies);

shows('The Americans'); // true
shows('Flight of the Conchords'); // true
shows('The Wire'); // false

const showsSet = create(Set, shows);
// Set ['The Americans', 'The Sopranos', 'Breaking Bad', 'Flight of the Conchords']

const startingWithThe = (title: string) => title.startsWith('The ');
const showsStartingWithThe = intersection(shows, startingWithThe);

const showsStartingWithTheSet = create(Set, shows);
// Set ['The Americans', 'The Sopranos']
```

[mdn-set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[mdn-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

### `npm start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

### `npm t`

Runs Jest in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).
