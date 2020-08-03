import {
  emptySet,
  universalSet,
  lookup,
  complement,
  union,
  difference,
  intersection,
} from './index';

describe('emptySet', () => {
  it('always returns false', () => {
    expect(emptySet('anything')).toBe(false);
  });
});

describe('universalSet', () => {
  it('always returns true', () => {
    expect(universalSet('anything')).toBe(true);
  });
});

describe('lookup', () => {
  it('works with an Array', () => {
    const [get] = lookup(['first', 'second']);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
    expect(new Map(get())).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );
  });

  it('works with a Set', () => {
    const [get] = lookup(new Set(['first', 'second']));

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
  });

  it('works with a Map’s keys', () => {
    const [get] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
      ]).keys()
    );

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
  });

  it('works with a Map', () => {
    const [get] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('missing')).toBe(undefined);
  });
});

describe('complement', () => {
  it('works with a Set', () => {
    const [get] = lookup(new Set(['first', 'second']));
    const inverseGet = complement(get);

    expect(inverseGet('first')).toBe(false);
    expect(inverseGet('second')).toBe(false);
    expect(inverseGet('missing')).toBe(true);
  });

  it('works with empty set', () => {
    expect(complement(emptySet)('anything')).toBe(true);
  });

  it('works with double complement of empty set', () => {
    expect(complement(complement(emptySet))('anything')).toBe(false);
  });

  it('works with universal set', () => {
    expect(complement(universalSet)('anything')).toBe(false);
  });

  it('works with double complement of universal set', () => {
    expect(complement(complement(universalSet))('anything')).toBe(true);
  });
});

describe('union', () => {
  it('works with an Array and Set', () => {
    const [a] = lookup(['first', 'second']);
    const [b] = lookup(new Set(['third', 'fourth']));
    const get = union(a, b);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('third')).toBe(true);
    expect(get('fourth')).toBe(true);
    expect(get('missing')).toBe(false);

    expect(new Map(get())).toEqual(
      new Map([
        ['first', true],
        ['second', true],
        ['third', true],
        ['fourth', true],
      ])
    );
  });

  it('works with two Maps', () => {
    const [a] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const [b] = lookup(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(3);
    expect(get('fourth')).toBe(4);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get())).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', 3],
        ['fourth', 4],
      ])
    );
  });
});

describe('difference', () => {
  it('works with an Array and Set', () => {
    const [a] = lookup(['first', 'second', 'third']);
    const [b] = lookup(new Set(['third', 'fourth']));
    const get = difference(a, b);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('third')).toBe(false);
    expect(get('fourth')).toBe(false);
    expect(get('missing')).toBe(false);

    expect(new Map(get())).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );
  });

  it('works with two Maps', () => {
    const [a] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const [b] = lookup(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = difference(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(undefined);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get())).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });
});

describe('intersection', () => {
  it('works with an Array and Set', () => {
    const [a] = lookup(['first', 'second', 'third']);
    const [b] = lookup(new Set(['third', 'fourth']));
    const get = intersection(a, b);

    expect(get('first')).toBe(false);
    expect(get('second')).toBe(false);
    expect(get('third')).toBe(true);
    expect(get('fourth')).toBe(false);
    expect(get('missing')).toBe(false);

    expect(new Map(get())).toEqual(new Map([['third', true]]));
  });

  it('works with two Maps', () => {
    const [a] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const [b] = lookup(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = intersection(a, b);

    expect(get('first')).toBe(undefined);
    expect(get('second')).toBe(undefined);
    expect(get('third')).toBe(-3);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get())).toEqual(new Map([['third', -3]]));
  });

  it('works with a Map and an array', () => {
    const [a] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const [b] = lookup(['third', 'fourth']);
    const get = intersection(a, b);

    expect(get('first')).toBe(undefined);
    expect(get('second')).toBe(undefined);
    expect(get('third')).toBe(-3);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get())).toEqual(new Map([['third', -3]]));
  });
});
