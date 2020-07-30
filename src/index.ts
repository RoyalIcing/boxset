export type Getter<I, O> = (input: I) => O;
export type Contains<I> = Getter<I, boolean>;
export interface GetterWithEntries<I, O> extends Getter<I, O> {
  (): Iterable<[I, O]>;
}

export interface Inverted {
  isInverted: true;
}

export function lookup<K, V>(
  source: ReadonlyMap<K, V>
): [GetterWithEntries<K, V>];
export function lookup<T>(source: Iterable<T>): [GetterWithEntries<T, boolean>];

export function lookup<T>(
  source: Iterable<T>
): [GetterWithEntries<T, boolean>] {
  if (source instanceof Map) {
    const map = source;
    const get = (input?: T) => {
      if (input === undefined) {
        return map.entries();
      } else {
        return map.get(input);
      }
    };
    return [get];
  }

  const store = new Set(source);
  const get = (input?: T) => {
    if (input === undefined) {
      return {
        [Symbol.iterator]() {
          const iterator = store.keys()[Symbol.iterator]();
          return {
            next() {
              const keyResult = iterator.next();
              if (keyResult.done) return keyResult;
              else {
                return {
                  value: [keyResult.value, true],
                  done: false,
                };
              }
            },
          };
        },
      } as Iterable<[T, boolean]>;
      // type A = Generator
      // return (function *entries() {

      // })()
      // return store.entries();
    } else {
      return store.has(input);
    }
  };
  return [get as GetterWithEntries<T, boolean>];
}

export function inverse<K>(source: Getter<K, any>): Contains<K> & Inverted {
  return Object.assign(
    (input: K) => {
      return !source(input);
    },
    { isInverted: true as const }
  );
}

export function union<K, V>(
  a: GetterWithEntries<K, V>,
  b: GetterWithEntries<K, V>
): GetterWithEntries<K, V> {
  const get = (input?: K) => {
    if (input === undefined) {
      return new Map<K, V>(
        (function*() {
          yield* Array.from(a());
          yield* Array.from(b());
        })()
      );
    } else {
      return b(input) || a(input);
    }
  };

  return get as GetterWithEntries<K, V>;
}
