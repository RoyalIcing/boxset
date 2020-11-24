<div align="center">
  <h1>📀 boxset</h1>
</div>

<h2>Lazily evaluated set operations for all collections</h2>

Problem: `Set` and `Map` are fantastic additions to JavaScript, providing better capabilities and performance for common tasks. However, their APIs are threadbare — they don’t provide methods for even merging two sets!

Boxset allows you to work with data structures such as [`Set`][mdn-set], [`Map`][mdn-map], [`FormData`][mdn-formdata] and interoperate between them.

```ts
import {
  source,
  complement,
  union,
  difference,
  intersection,
  create,
} from 'boxset';

const dramas = source(['The Americans', 'Breaking Bad', 'The Sopranos']);
const comedies = source(['Flight of the Conchords']);

const shows = union(dramas, comedies);

shows('The Americans'); // true
shows('Flight of the Conchords'); // true
shows('The Wire'); // false

const showsSet = create(shows, Set);
// Set ['The Americans', 'Breaking Bad', 'The Sopranos', 'Flight of the Conchords']

const startingWithThe = (title: string) => title.startsWith('The ');
const showsStartingWithThe = intersection(shows, startingWithThe);

const showsStartingWithTheSet = create(showsStartingWithThe, Set);
// Set ['The Americans', 'The Sopranos']
```

## Docs

### Types

```typescript
export interface Source<I, O> {
  (input: I): O;
}

export interface NotFound {
  (): undefined | null | false;
}

export type Contains<I> = Source<I, boolean>;

export interface SourceIterable<I, O>
  extends Source<I, O>,
    Iterable<[I, O]>,
    NotFound {}
```

### Constants

#### `emptySet`

A collection that contains no keys, i.e. it returns `false` for any key.

#### `universalSet`

A collection that contains all keys, i.e. it returns `true` for any key.

### `single(key, value?)`

Creates a `SourceIterable` with the given key and optional value. If value is not provided, then the result will be a set containing just the key.

### `source(collection)`

Create a `SourceIterable` with the given collection, which may be a `Set`, `Array`, `Map`, `FormData`, or plain object.

The types are used as follows:

- `Set<A>` -> `SourceIterable<A, boolean>`
- `Array<A>` -> `SourceIterable<A, boolean>`
- `Map<K, V>` -> `SourceIterable<K, V>`
- `FormData` -> `SourceIterable<string, string>`
- `Record<K, V>` (plain object) -> `SourceIterable<K, V>`

Collections are **referenced not copied**, so passing a collection to `source()` and then making changes to the original collection will be reflected.

### `union(a, b)`

Combines two sources into a union.

The sources are referenced not copied. Source `a` is checked before checking `b`.

The result will be `Iterable` if both sources were iterable.

### `difference(a, b)`

Creates a source with all the elements of `a` except those that are in `b`.

For example, we could create a source from a `Map` omitting entries from a `Set` like so:

```typescript
import { difference } from 'boxset';

const fruitCosts = new Map([['apple', 2.50], ['orange', 3.00], ['lemon', 4.50], ['pear', 3.00]]);
const citrusFruits = new Set(['orange', 'lemon']);
const nonCitrusFruitCosts = difference(fruitCosts, citrusFruits);
const nonCitrusFruitCostsMap = new Map(nonCitrusFruitCosts);
// new Map([['apples', 2.50], ['pears', 3.00]]);
```

### `intersection(a, b)`

Creates a source with all the elements that are both in `a` and `b`.

For example, we could create a source from a `Map` keeping entries within a `Set` like so:

```typescript
import { intersection } from 'boxset';

const fruitCosts = new Map([['apple', 2.50], ['orange', 3.00], ['lemon', 4.50], ['pear', 3.00]]);
const citrusFruits = new Set(['orange', 'lemon']);
const citrusFruitCosts = intersection(fruitCosts, citrusFruits);
const citrusFruitCostsMap = new Map(citrusFruitCosts);
// new new Map([['oranges', 3.00], ['lemons', 4.50]]);
```

### `complement(a)`

Returns the opposite of what `a` would have returned. If a given key returned `true` for `a`, then the result would return `false`. And if a given key returned `false` for `a`, then the result would return `true`.

```typescript
import { complement } from 'boxset';

const citrusFruits = new Set(['orange', 'lemon']);
const isCitrusFruit = source(citrusFruits);
const isNotCitrusFruit = complement(isCitrusFruit);

isCitrusFruit('orange'); // true
isNotCitrusFruit('orange'); // false
isCitrusFruit('peach'); // false
isNotCitrusFruit('peach'); // true
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
