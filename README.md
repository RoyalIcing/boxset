# Boxset

Problem: `Set` and `Map` are fantastic additions to JavaScript, providing better capabilities and performance for common tasks. However, their APIs are threadbare — they don’t provide methods for even merging two sets!

Boxset allows you to work with data structures such as [`Set`][mdn-set], [`Map`][mdn-map], [`FormData`][mdn-formdata] and interoperate between them.

You can perform set operations such as `union`, `difference`, `complement`, `intersection`. Then output as `Set`, `Map`, `Object`, or `FormData`.

```ts
import {
  emptySet,
  universalSet,
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
