<div align="center">
  <h1>📀 boxset</h1>
  <a href="https://bundlephobia.com/result?p=boxset">
    <img src="https://badgen.net/bundlephobia/minzip/boxset@0.3.4" alt="minified and gzipped size">
    <img src="https://badgen.net/bundlephobia/min/boxset@0.3.4" alt="minified size">
    <img src="https://badgen.net/bundlephobia/dependency-count/boxset@0.3.4" alt="zero dependencies">
  </a>
</div>

## Lazily evaluated set operations for all collections

Problem: [`Set`][mdn-set] and [`Map`][mdn-map] are fantastic additions to JavaScript, providing better capabilities and performance for common tasks. However, their APIs are threadbare — they don’t provide methods for even merging two sets!

Boxset allows you to work with data structures such as [`Set`][mdn-set], [`Map`][mdn-map], [`Array`][mdn-array], [`Object`][mdn-object] [`FormData`][mdn-formdata], and perform unions, intersections, differences, and interoperate between them.

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

## Installation

```console
npm add boxset
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

### `source(collection)`

Create a `SourceIterable` with the given collection, which may be a `Set`, `Array`, `Map`, `FormData`, or plain object.

The return types for a given input are as follows:

- `Set<A>` -> `SourceIterable<A, boolean>`
- `Array<A>` -> `SourceIterable<A, boolean>`
- `Map<K, V>` -> `SourceIterable<K, V>`
- `FormData` -> `SourceIterable<string, string>`
- `Record<K, V>` (plain object) -> `SourceIterable<K, V>`

Collections are **referenced not copied**, so passing a collection to `source()` and then making changes to the original collection will be reflected.

```typescript
import { source } from 'boxset';

const citrusFruitCosts = source(new Map([['orange', 3.00], ['lemon', 4.50]]));
const otherFruitCosts = source({ apple: 2.50, pear: 3.00 });
const citrusFruits = source(new Set(['orange', 'lemon']));
const greenFruits = source(['apple', 'pear']);
```

### `union(a, b)`

Combines two sources into a union.

The sources are referenced not copied. Source `a` is checked before checking `b`.

The result will be a `SourceIterable` if both sources were iterable, otherwise a non-iterable `Source`.

```typescript
import { source, union } from 'boxset';

const citrusFruitCosts = source(new Map([['orange', 3.00], ['lemon', 4.50]]));
const otherFruitCosts = source({ apple: 2.50, pear: 3.00 });
const fruitCosts = union(citrusFruitCosts, otherFruitCosts);

const fruitCostsMap = new Map(fruitCosts);
// new Map([['orange', 3.00], ['lemon', 4.50], ['apple', 2.50], ['pear', 3.00]])

const fruitCostsObject = Object.fromEntries(fruitCosts);
// { orange: 3.00, lemon: 4.50, apple: 2.50, pear: 3.00 }
```

### `difference(a, b)`

Creates a `SourceIterable` with all the elements of `a` except those that are in `b`.

For example, we could create a source from a `Map` omitting entries from a `Set` like so:

```typescript
import { source, difference } from 'boxset';

const fruitCosts = source(new Map([['apple', 2.50], ['orange', 3.00], ['lemon', 4.50], ['pear', 3.00]]));
const citrusFruits = source(new Set(['orange', 'lemon']));
const nonCitrusFruitCosts = difference(fruitCosts, citrusFruits);
const nonCitrusFruitCostsMap = new Map(nonCitrusFruitCosts);
// new Map([['apples', 2.50], ['pears', 3.00]]);
```

We could do the same for an object omitting keys from an `Array`:

```typescript
import { source, difference } from 'boxset';

const fruitCosts = source({ apple: 2.50, orange: 3.00, lemon: 4.50, pear: 3.00 });
const citrusFruits = source(['orange', 'lemon']);
const nonCitrusFruitCosts = difference(fruitCosts, citrusFruits);
const nonCitrusFruitCostsObject = Object.fromEntries(nonCitrusFruitCosts);
// { apple: 2.50, pear: 3.00 }
```

### `intersection(a, b)`

Creates a `SourceIterable` with all the elements that are both in `a` and `b`.

For example, we could create a source from a `Map` keeping entries within a `Set` like so:

```typescript
import { source, intersection } from 'boxset';

const fruitCosts = new Map([['apple', 2.50], ['orange', 3.00], ['lemon', 4.50], ['pear', 3.00]]);
const citrusFruits = new Set(['orange', 'lemon']);
const citrusFruitCosts = intersection(source(fruitCosts), source(citrusFruits));
const citrusFruitCostsMap = new Map(citrusFruitCosts);
// new new Map([['oranges', 3.00], ['lemons', 4.50]]);
```

### `complement(a)`

Returns the opposite of what `a` would have returned. If a given key returned `true` for `a`, then the result would return `false`. And if a given key returned `false` for `a`, then the result would return `true`.

```typescript
import { source, complement } from 'boxset';

const citrusFruits = new Set(['orange', 'lemon']);
const isCitrusFruit = source(citrusFruits);
const isNotCitrusFruit = complement(isCitrusFruit);

isCitrusFruit('orange'); // true
isNotCitrusFruit('orange'); // false
isCitrusFruit('peach'); // false
isNotCitrusFruit('peach'); // true
```

### `single(key, value?)`

Creates a `SourceIterable` with the given key and optional value. If value is not provided, then the result will be a set containing just the key.

```typescript
import { single } from 'boxset';

const pair = single('PI', 3.14159);
pair('PI'); // 3.14159
pair('TAU'); // undefined

const setOfOne = single('some key');
setOfOne('some key'); // true
setOfOne('any other key'); // false
```

### Constants

#### `emptySet`

A collection that contains no keys, i.e. it returns `false` for any key.

#### `universalSet`

A collection that contains all keys, i.e. it returns `true` for any key.

```typescript
import { emptySet, universalSet } from 'boxset';

emptySet('any key'); // false
emptySet(42); // false

universalSet('any key'); // true
universalSet(42); // true
```

[mdn-set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[mdn-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[mdn-object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[mdn-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
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
