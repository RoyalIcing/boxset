# Boxset

```ts
import {
  emptySet,
  universalSet,
  lookup,
  complement,
  union,
  difference,
  intersection,
} from 'boxset';

const dramas = lookup(['The Americans', 'The Sopranos']);
const comedies = lookup(['Flight of the Conchords']);

const shows = union(dramas, comedies);

shows('The Americans'); // true
shows('The Sopranos'); // true
shows('The Wire'); // false

Array.from(shows()); // ['The Americans', 'Flight of the Conchords', 'The Sopranos']

const startingWithThe = (title: string) => title.startsWith('The ');
const showsStartingWithThe = intersection(shows, startingWithThe);
```

---

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you will probably find useful.

### `npm start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

### `npm t`

Runs Jest in an interactive mode.
By default, runs tests related to files changed since the last commit.

### `npm run build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).
