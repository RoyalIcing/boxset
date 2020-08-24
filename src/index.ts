export interface Getter<I, O> {
  (input: I): O;
}
export type Contains<I> = Getter<I, boolean>;
export interface GetterWithEntries<I, O> {
  (input: I): O;
  (input: null): undefined | null | false;
  (): Iterable<[I, O]>;
}

export interface Complemented {
  isComplement: true;
}

export const emptySet: Contains<string> = () => false;
export const universalSet: Contains<string> = () => true;

export function single<K, V = boolean>(
  key: K,
  value?: V
): GetterWithEntries<K, V> {
  const actualValue = value === undefined ? true : value;

  return (input?: K | null) => {
    if (input === undefined) {
      // return [[key, actualValue]] as any;
      return {
        *[Symbol.iterator]() {
          yield [key, actualValue];
        },
      } as any;
    } else if (input === key) {
      return actualValue;
    } else {
      if (value === undefined) {
        return false;
      } else {
        return undefined;
      }
    }
  };
}

export function lookup<K, V>(
  source: ReadonlyMap<K, V>
): [GetterWithEntries<K, V>];
export function lookup<K extends string, V>(
  source: FormData
): [GetterWithEntries<string, string>];
export function lookup<T, V extends boolean>(
  source: Iterable<T>
): [GetterWithEntries<T, V>];

export function lookup<T, V>(
  source: Iterable<T> | FormData
): [GetterWithEntries<T, V>] {
  if (source instanceof Map) {
    const map = source;
    const get = (input?: T | null) => {
      if (input === undefined) {
        return map.entries();
      } else if (input === null) {
        return undefined;
      } else {
        return map.get(input);
      }
    };
    return [get];
  }

  if (source instanceof FormData) {
    const formData = source;
    const get = (input?: T | null) => {
      if (input === undefined) {
        return (formData as any).entries();
      } else if (input === null) {
        return undefined;
      } else {
        return formData.get((input as unknown) as string);
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
              if (keyResult.done) {
                return keyResult;
              }

              return {
                value: [keyResult.value, true],
                done: false,
              };
            },
          };
        },
      } as Iterable<[T, V]>;
      // type A = Generator
      // return (function *entries() {

      // })()
      // return store.entries();
    } else if (input === null) {
      return false;
    } else {
      return store.has(input);
    }
  };
  return [get as GetterWithEntries<T, V>];
}

export function complement<K>(
  source: Getter<K, any>
): Contains<K> & Complemented {
  return Object.assign(
    (input: K) => {
      return !source(input);
    },
    { isComplement: true as const }
  );
}

export function union<K, V>(
  a: GetterWithEntries<K, V>,
  b: GetterWithEntries<K, V>
): GetterWithEntries<K, V> {
  const get = (input?: K) => {
    if (input === undefined) {
      return new Map<K, V>(
        (function* () {
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

export function difference<K, V>(
  a: GetterWithEntries<K, V>,
  b: Getter<K, any>
): GetterWithEntries<K, V> {
  const get = (input?: K) => {
    if (input === undefined) {
      return (function* () {
        const iterator = a()[Symbol.iterator]();

        while (true) {
          let item = iterator.next();
          while (!item.done && b(item.value[0])) {
            item = iterator.next();
          }

          if (item.done) {
            return;
          }

          yield item.value;
        }
      })();
    } else {
      const bResult = b(input);
      if (bResult) {
        return a(null);
      }
      return a(input);
    }
  };

  return get as GetterWithEntries<K, V>;
}

export function intersection<K, V>(
  a: GetterWithEntries<K, V>,
  b: Getter<K, any>
): GetterWithEntries<K, V> {
  const get = (input?: K) => {
    if (input === undefined) {
      return (function* () {
        const iterator = a()[Symbol.iterator]();

        while (true) {
          let item = iterator.next();
          while (!item.done && !b(item.value[0])) {
            item = iterator.next();
          }

          if (item.done) {
            return;
          }

          yield item.value;
        }
      })();
    } else {
      const aResult = a(input);
      const bResult = b(input);
      if (!!aResult && !!bResult) {
        return aResult;
      }
      return a(null);
    }
  };

  return get as GetterWithEntries<K, V>;
}

// export function intersection<K, V>(
//   a: GetterWithEntries<K, V>,
//   b: GetterWithEntries<K, any>
// ): GetterWithEntries<K, V> {
//   return difference(a, difference(a, b));
// }

export function justKeys<K, V>(input: Iterable<[K, V]>): Iterable<K> {
  return (function* () {
    const iterator = input[Symbol.iterator]();

    while (true) {
      let item = iterator.next();

      if (item.done) {
        return;
      }

      yield item.value[0];
    }
  })();
}

export function create<K, V>(
  input: GetterWithEntries<K, V>,
  collectionClass: ArrayConstructor
): Array<K>;
export function create<K, V>(
  input: GetterWithEntries<K, V>,
  collectionClass: SetConstructor
): Set<K>;
export function create<K, V>(
  input: GetterWithEntries<K, V>,
  collectionClass: MapConstructor
): Map<K, V>;
export function create<K extends string | number | symbol, V>(
  input: GetterWithEntries<K, V>,
  collectionClass: ObjectConstructor
): Record<K, V>;

export function create<
  K,
  V,
  Collection extends
    | SetConstructor
    | ArrayConstructor
    | MapConstructor
    | ObjectConstructor
>(input: GetterWithEntries<K, V>, collectionClass: Collection) {
  if (collectionClass === Set) {
    return new Set<K>(justKeys(input()));
  } else if (collectionClass === Array) {
    return Array.from(justKeys(input()));
  } else if (collectionClass === Object) {
    return Object.fromEntries(input());
  } else {
    return new Map<K, V>(input());
  }
}

export function into<K, V>(
  target: Map<K, V>,
  input: GetterWithEntries<K, V>
): typeof target;
export function into<K, V>(
  target: Set<K>,
  input: GetterWithEntries<K, any>
): typeof target;
export function into<K, V>(
  target: FormData,
  input: GetterWithEntries<K, V>
): typeof target;
export function into<K extends string | symbol | number, V>(
  target: Record<K, V>,
  input: GetterWithEntries<K, V>
): typeof target;

export function into<K, V>(
  target:
    | FormData
    | Map<K, V>
    | Set<K>
    | (K extends string | symbol | number ? Record<K, V> : never),
  input: GetterWithEntries<K, V>
): typeof target {
  const iterator = input()[Symbol.iterator]();

  let setter: (key: K, value: V) => void;

  if ('set' in target && typeof target.set === 'function') {
    setter = target.set as typeof setter;
  } else if ('add' in target && typeof target.add === 'function') {
    setter = target.add as typeof setter;
  } else {
    const o: any = target;
    setter = (key, value) => {
      o[key] = value;
    };
  }

  // const setter = ('set' in target ? target.set : target.add) as (
  //   key: K,
  //   value: V
  // ) => void;

  while (true) {
    let item = iterator.next();

    if (item.done) {
      return target;
    }

    setter.apply(target, item.value);
    // target.set(item.value[0], item.value[1]);
  }
}
