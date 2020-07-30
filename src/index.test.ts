import { lookup, inverse, union } from './index';

describe('lookup', () => {
  it('works with an Array', () => {
    const [get] = lookup(['first', 'second']);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
    expect(new Map(get())).toEqual(new Map([['first', true], ['second', true]]));
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

describe('inverse', () => {
  it('works with a Set', () => {
    const [get] = lookup(new Set(['first', 'second']));
    const inverseGet = inverse(get);

    expect(inverseGet('first')).toBe(false);
    expect(inverseGet('second')).toBe(false);
    expect(inverseGet('missing')).toBe(true);
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
  });

  it('works with two Maps', () => {
    const [a] = lookup(new Map([['first', 1], ['second', 2], ['third', -3]]));
    const [b] = lookup(new Map([['third', 3], ['fourth', 4]]));
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(3);
    expect(get('fourth')).toBe(4);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get())).toEqual(new Map([['first', 1], ['second', 2], ['third', 3], ['fourth', 4]]));
  });
})