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

export interface Complemented {
  isComplement: true;
}

export const emptySet: Contains<string | symbol | number> = () => false;
export const universalSet: Contains<string | symbol | number> = () => true;

export function always<O, I = any>(value: O): Source<I, O> {
  return () => value;
}

export function single<K, V = boolean>(
  key: K,
  value?: V
): SourceIterable<K, V> {
  const actualValue = value === undefined ? true : value;

  function get(input?: K | null) {
    if (input === key) {
      return actualValue;
    } else {
      if (value === undefined) {
        return false;
      } else {
        return undefined;
      }
    }
  }

  return (Object.assign(get, {
    *[Symbol.iterator]() {
      yield [key, actualValue] as [K, V];
    },
  }) as unknown) as SourceIterable<K, V>;
}

function mapIterable<I, O>(transform: (v: I) => O) {
  return (input: Iterable<I>): Iterable<O> => {
    return (function*() {
      const iterator = input[Symbol.iterator]();

      while (true) {
        let item = iterator.next();

        if (item.done) {
          return;
        }

        yield transform(item.value);
      }
    })();
  };
}

export function source<K, V extends boolean>(
  source: ReadonlySet<K>
): SourceIterable<K, V>;
export function source<K, V extends boolean>(
  source: ReadonlyArray<K>
): SourceIterable<K, V>;
export function source<K, V>(source: ReadonlyMap<K, V>): SourceIterable<K, V>;
export function source<K extends string, V>(
  source: FormData
): SourceIterable<string, string>;
export function source<K extends string, V>(
  source: Record<K, V>
): SourceIterable<K, V>;

export function source<T, V>(
  source:
    | ReadonlySet<T>
    | ReadonlyArray<T>
    | ReadonlyMap<T, V>
    | Record<T extends string ? T : never, V>
    | FormData
): SourceIterable<T, V> {
  if (source instanceof Map) {
    const get = (input?: T) => {
      return source.get(input);
    };
    return Object.assign(get, {
      [Symbol.iterator]: source.entries.bind(source),
    });
  }

  if (source instanceof Set) {
    const get = (input?: T) => {
      if (input === undefined) {
        return false;
      } else {
        return source.has(input);
      }
    };
    return (Object.assign(get, {
      [Symbol.iterator]: () => mapIterable(v => [v, true])(source),
    }) as unknown) as SourceIterable<T, V>;
  }

  if (Array.isArray(source)) {
    const get = (input?: T) => {
      if (input === undefined) {
        return false;
      } else {
        return source.includes(input);
      }
    };
    return (Object.assign(get, {
      [Symbol.iterator]: () => mapIterable(v => [v, true])(source),
    }) as unknown) as SourceIterable<T, V>;
  }

  if (typeof FormData === 'function' && source instanceof FormData) {
    const formData = source;
    const get = (input?: T) =>
      formData.get(((input as unknown) as string) || '');
    return Object.assign(get, {
      [Symbol.iterator]: (formData as any).entries.bind(formData),
    }) as any;
  }

  if (typeof source === 'object') {
    const get = (input?: T) => {
      if (input === undefined) {
        return undefined;
      } else {
        return (source as Record<any, V>)[input];
      }
    };
    return (Object.assign(get, {
      [Symbol.iterator]: () => Object.entries(source).values(),
    }) as unknown) as SourceIterable<T, V>;
  }

  throw new Error(`Unknown source ${typeof source}`);
}

export function complement<K>(
  source: Source<K, any>
): Contains<K> & Complemented {
  return Object.assign(
    (input: K) => {
      return !source(input);
    },
    { isComplement: true as const }
  );
}

export function union<AI, AO, BI, BO>(
  a: SourceIterable<AI, AO>,
  b: SourceIterable<BI, BO>
): SourceIterable<AI | BI, AO | BO>;
export function union<AI, AO, BI, BO>(
  a: SourceIterable<AI, AO>,
  b: Source<BI, BO>
): Source<AI | BI, AO | BO>;

export function union<AI, AO, BI, BO>(
  a: SourceIterable<AI, AO>,
  b: Source<BI, BO> | SourceIterable<BI, BO>
): typeof b extends SourceIterable<BI, BO>
  ? SourceIterable<AI | BI, AO | BO>
  : Source<AI | BI, AO | BO> {
  function get(input: AI | BI) {
    const result = a(input as any);
    if (typeof result === 'number') {
      return result;
    }

    return result || b(input as any);
  }

  if (Symbol.iterator in b) {
    const iterable = function*() {
      yield* Array.from(a);
      yield* Array.from(b as Iterable<[BI, BO]>);
    };

    return (Object.assign(get, {
      [Symbol.iterator]: iterable,
    }) as unknown) as SourceIterable<AI | BI, AO | BO>;
  } else {
    return get as Source<AI | BI, AO | BO>;
  }
}

export function difference<K, V>(
  a: SourceIterable<K, V>,
  b: Source<K, any>
): SourceIterable<K, V> {
  function* iterable() {
    const iterator = a[Symbol.iterator]();

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
  }
  const get = (input?: K) => {
    if (input === undefined) {
      return iterable();
    } else {
      const bResult = b(input);
      if (bResult) {
        return a();
      }
      return a(input);
    }
  };

  return (Object.assign(get, {
    [Symbol.iterator]: iterable,
  }) as unknown) as SourceIterable<K, V>;
}

export function intersection<K, V>(
  a: SourceIterable<K, V>,
  b: Source<K, any>
): SourceIterable<K, V> {
  function* iterable() {
    const iterator = a[Symbol.iterator]();

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
  }

  const get = (input?: K) => {
    if (input === undefined) {
      return iterable();
    } else {
      const aResult = a(input);
      const bResult = b(input);
      if (!!aResult && !!bResult) {
        return aResult;
      }
      return a();
    }
  };

  return (Object.assign(get, {
    [Symbol.iterator]: iterable,
  }) as unknown) as SourceIterable<K, V>;
}

// export function intersection<K, V>(
//   a: GetterWithEntries<K, V>,
//   b: GetterWithEntries<K, any>
// ): GetterWithEntries<K, V> {
//   return difference(a, difference(a, b));
// }

// export const justKeys = mapIterable(([key]) => key);

export function create<K, V>(
  input: SourceIterable<K, V>,
  collectionClass: ArrayConstructor
): Array<K>;
export function create<K, V>(
  input: SourceIterable<K, V>,
  collectionClass: SetConstructor
): Set<K>;
export function create<K, V>(
  input: SourceIterable<K, V>,
  collectionClass: MapConstructor
): Map<K, V>;
export function create<K extends string | number | symbol, V>(
  input: SourceIterable<K, V>,
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
>(input: SourceIterable<K, V>, collectionClass: Collection) {
  if (collectionClass === Set) {
    return new Set<K>(mapIterable<[K, any], K>(([key]) => key)(input));
  } else if (collectionClass === Array) {
    return Array.from(mapIterable<[K, any], K>(([key]) => key)(input));
  } else if (collectionClass === Object) {
    return Object.fromEntries(input);
  } else {
    return new Map<K, V>(input);
  }
}

export function into<K, V>(
  target: Map<K, V>,
  input: SourceIterable<K, V>
): typeof target;
export function into<K, V>(
  target: Set<K>,
  input: SourceIterable<K, any>
): typeof target;
export function into<K, V>(
  target: Array<K>,
  input: SourceIterable<K, any>
): typeof target;
export function into<K, V>(
  target: FormData,
  input: SourceIterable<K, V>
): typeof target;
export function into<K extends string | symbol | number, V>(
  target: Record<K, V>,
  input: SourceIterable<K, V>
): typeof target;

export function into<K, V>(
  target:
    | FormData
    | Map<K, V>
    | Set<K>
    | Array<K>
    | (K extends string | symbol | number ? Record<K, V> : never),
  input: SourceIterable<K, V>
): typeof target {
  const iterator = input[Symbol.iterator]();

  let setter: (key: K, value: V) => void;

  if ('set' in target && typeof target.set === 'function') {
    setter = target.set as typeof setter;
  } else if ('add' in target && typeof target.add === 'function') {
    setter = target.add as typeof setter;
  } else if ('push' in target && typeof target.push === 'function') {
    setter = item => target.push(item);
  } else {
    const o: any = target;
    setter = (key, value) => {
      o[key] = value;
    };
  }

  while (true) {
    let item = iterator.next();

    if (item.done) {
      return target;
    }

    setter.apply(target, item.value);
  }
}
