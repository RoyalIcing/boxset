import {
  emptySet,
  universalSet,
  always,
  single,
  source,
  complement,
  union,
  difference,
  intersection,
  create,
  into,
} from './index';

describe('emptySet', () => {
  it('always returns false', () => {
    expect(emptySet('anything')).toBe(false);
    expect(emptySet('at')).toBe(false);
    expect(emptySet('all')).toBe(false);
    expect(emptySet('')).toBe(false);
    expect(emptySet(5)).toBe(false);
    expect(emptySet(Math.PI)).toBe(false);
    expect(emptySet(Symbol.iterator)).toBe(false);
  });
});

describe('universalSet', () => {
  it('always returns true', () => {
    expect(universalSet('anything')).toBe(true);
    expect(universalSet('at')).toBe(true);
    expect(universalSet('all')).toBe(true);
    expect(universalSet('')).toBe(true);
    expect(universalSet(5)).toBe(true);
    expect(universalSet(Math.PI)).toBe(true);
    expect(universalSet(Symbol.iterator)).toBe(true);
  });
});

describe('always()', () => {
  it('always returns the value for any input', () => {
    const get = always(42);
    expect(get('anything')).toBe(42);
    expect(get('at')).toBe(42);
    expect(get('all')).toBe(42);
    expect(get('')).toBe(42);
    expect(get(5)).toBe(42);
    expect(get(Math.PI)).toBe(42);
    expect(get(Symbol.iterator)).toBe(42);
  });
});

describe('single()', () => {
  it('works with just a string key', () => {
    const get = single('some key');
    expect(get('some key')).toBe(true);
    expect(get('some other key')).toBe(false);
    expect(new Map(get)).toEqual(new Map([['some key', true]]));
  });

  it('works with a string key and string value', () => {
    const get = single('some key', 'some value');
    expect(get('some key')).toBe('some value');
    expect(get('some other key')).toBe(undefined);
    expect(new Map(get)).toEqual(new Map([['some key', 'some value']]));
  });

  it('works with a string key and number value', () => {
    const get = single('some key', 123);
    expect(get('some key')).toBe(123);
    expect(get('some other key')).toBe(undefined);
    expect(new Map(get)).toEqual(new Map([['some key', 123]]));
  });
});

describe('source()', () => {
  it('works with an Array', () => {
    const array = ['first', 'second'];
    const get = source(array);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
    expect(get()).toBe(false);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );

    array.push('third');

    expect(get('third')).toBe(true);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
        ['third', true],
      ])
    );
  });

  it('works with a Set', () => {
    const set = new Set(['first', 'second']);
    const get = source(set);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('missing')).toBe(false);
    expect(get()).toBe(false);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );

    set.add('third');

    expect(get('third')).toBe(true);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
        ['third', true],
      ])
    );
  });

  it('works with a Map', () => {
    const map = new Map([
      ['first', 1],
      ['second', 2],
    ]);
    const get = source(map);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('missing')).toBe(undefined);
    expect(get()).toBe(undefined);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });

  it('works with a FormData', () => {
    const formData = new FormData();
    formData.set('first', 'ONE');
    formData.set('second', 'TWO');
    const get = source(formData);

    expect(get('first')).toBe('ONE');
    expect(get('second')).toBe('TWO');
    expect(get('missing')).toBe(null);
    expect(get()).toBe(null);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', 'ONE'],
        ['second', 'TWO'],
      ])
    );
  });

  it('works with an Object', () => {
    const object = {
      first: 1,
      second: 2,
    };
    const get = source<string, number>(object);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('missing')).toBe(undefined);
    expect(get()).toBe(undefined);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });

  it('works with an HTMLElement dataset', () => {
    const el = document.createElement('div');
    el.dataset.first = 'FIRST';
    el.dataset.second = 'SECOND';

    const get = source(el.dataset);
    expect(get('first')).toBe('FIRST');
    expect(get('second')).toBe('SECOND');
    expect(get('missing')).toBe(undefined);
    expect(get()).toBe(undefined);
    expect(new Map(get)).toEqual(
      new Map([
        ['first', 'FIRST'],
        ['second', 'SECOND'],
      ])
    );
  });

  it('errors with a generator function', () => {
    expect(() =>
      source(function*() {
        yield 'abc';
      })
    ).toThrowError('Unknown source function');
  });
});

describe('complement()', () => {
  it('works with a Set', () => {
    const get = source(new Set(['first', 'second']));
    const inverseGet = complement<string>(get);

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

describe('union()', () => {
  it('works with an Array and Set', () => {
    const a = source(['first', 'second']);
    const b = source(new Set(['third', 'fourth']));
    const get = union(a, b);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('third')).toBe(true);
    expect(get('fourth')).toBe(true);
    expect(get('missing')).toBe(false);
    expect(get()).toBe(false);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
        ['third', true],
        ['fourth', true],
      ])
    );
  });

  it('works with two Maps', () => {
    const a = source(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const b = source(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(-3);
    expect(get('fourth')).toBe(4);
    expect(get('missing')).toBe(undefined);
    expect(get()).toBe(undefined);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', 3],
        ['fourth', 4],
      ])
    );
  });

  it('works with two objects', () => {
    const a = source({ first: 1, second: 2 });
    const b = source({ third: 3, fourth: 4 });
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(3);
    expect(get('fourth')).toBe(4);
    expect(get('missing' as any)).toBe(undefined);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', 3],
        ['fourth', 4],
      ])
    );
  });

  it('works with an object and always null', () => {
    const a = source({ first: 1, second: 2 });
    const b = always(null);
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('missing')).toBe(null);
  });

  it('works with an object and always zero', () => {
    const a = source({ first: 1, second: 2 });
    const get = union(a, always(0));

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('missing')).toBe(0);
  });

  it('works with an object and always zero', () => {
    const a = source({ first: '1', second: '2' });
    const b = always('');
    const get = union(a, b);

    expect(get('first')).toBe('1');
    expect(get('second')).toBe('2');
    expect(get('missing')).toBe('');
  });

  it('works with an object and throwing function', () => {
    const a = source({ first: 1, second: 2 });
    const b = () => {
      throw new Error('Invalid key');
    };
    const get = union(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(() => get('missing')).toThrowError('Invalid key');
  });
});

describe('difference()', () => {
  it('works with an Array and Set', () => {
    const a = source(['first', 'second', 'third']);
    const b = source(new Set(['third', 'fourth']));
    const get = difference<string, boolean>(a, b);

    expect(get('first')).toBe(true);
    expect(get('second')).toBe(true);
    expect(get('third')).toBe(false);
    expect(get('fourth')).toBe(false);
    expect(get('missing')).toBe(false);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );
  });

  it('works with two Maps', () => {
    const a = source(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const b = source(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = difference<string, number>(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(undefined);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });

  it('works with a Map and an array', () => {
    const a = source(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const b = source(['third', 'fourth']);
    const get = difference<string, number | boolean>(a, b);

    expect(get('first')).toBe(1);
    expect(get('second')).toBe(2);
    expect(get('third')).toBe(undefined);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get)).toEqual(
      new Map([
        ['first', 1],
        ['second', 2],
      ])
    );
  });

  it('works with a Set and a function', () => {
    const shows = source([
      'The Americans',
      'Breaking Bad',
      'Boardwalk Empire',
      'The Sopranos',
    ]);
    const startingWithThe = (title: string) => title.startsWith('The ');
    const showsNotStartingWithThe = difference(shows, startingWithThe);

    expect(showsNotStartingWithThe('The Americans')).toEqual(false);
    expect(showsNotStartingWithThe('The Sopranos')).toEqual(false);
    expect(showsNotStartingWithThe('Breaking Bad')).toEqual(true);
    expect(showsNotStartingWithThe('Boardwalk Empire')).toEqual(true);
    expect(showsNotStartingWithThe('The Wire')).toEqual(false);
    expect(create(showsNotStartingWithThe, Set)).toEqual(
      new Set(['Breaking Bad', 'Boardwalk Empire'])
    );
  });

  it('works with a Set and a Regex', () => {
    const shows = source([
      'The Americans',
      'Breaking Bad',
      'Boardwalk Empire',
      'The Sopranos',
    ]);
    const startingWithThe = (title: string) => /^The /.test(title);
    const showsNotStartingWithThe = difference(shows, startingWithThe);

    expect(showsNotStartingWithThe('The Americans')).toEqual(false);
    expect(showsNotStartingWithThe('The Sopranos')).toEqual(false);
    expect(showsNotStartingWithThe('Breaking Bad')).toEqual(true);
    expect(showsNotStartingWithThe('Boardwalk Empire')).toEqual(true);
    expect(showsNotStartingWithThe('The Wire')).toEqual(false);
    expect(create(showsNotStartingWithThe, Set)).toEqual(
      new Set(['Breaking Bad', 'Boardwalk Empire'])
    );
  });
});

describe('intersection()', () => {
  it('works with an Array and Set', () => {
    const a = source(['first', 'second', 'third']);
    const b = source(new Set(['third', 'fourth']));
    const get = intersection<string, boolean>(a, b);

    expect(get('first')).toBe(false);
    expect(get('second')).toBe(false);
    expect(get('third')).toBe(true);
    expect(get('fourth')).toBe(false);
    expect(get('missing')).toBe(false);

    expect(new Map(get)).toEqual(new Map([['third', true]]));
  });

  it('works with two Maps', () => {
    const a = source(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const b = source(
      new Map([
        ['third', 3],
        ['fourth', 4],
      ])
    );
    const get = intersection<string, number>(a, b);

    expect(get('first')).toBe(undefined);
    expect(get('second')).toBe(undefined);
    expect(get('third')).toBe(-3);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get)).toEqual(new Map([['third', -3]]));
  });

  it('works with a Map and an array', () => {
    const a = source(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const b = source(['third', 'fourth']);
    const get = intersection<string, number | boolean>(a, b);

    expect(get('first')).toBe(undefined);
    expect(get('second')).toBe(undefined);
    expect(get('third')).toBe(-3);
    expect(get('fourth')).toBe(undefined);
    expect(get('missing')).toBe(undefined);

    expect(new Map(get)).toEqual(new Map([['third', -3]]));
  });

  it('works with a Set and a function', () => {
    const shows = source([
      'The Americans',
      'Breaking Bad',
      'Boardwalk Empire',
      'The Sopranos',
    ]);
    const startingWithThe = (title: string) => title.startsWith('The ');
    const showsStartingWithThe = intersection(shows, startingWithThe);

    expect(showsStartingWithThe('The Americans')).toEqual(true);
    expect(showsStartingWithThe('The Sopranos')).toEqual(true);
    expect(showsStartingWithThe('Breaking Bad')).toEqual(false);
    expect(showsStartingWithThe('Boardwalk Empire')).toEqual(false);
    expect(showsStartingWithThe('The Wire')).toEqual(false);
    expect(create(showsStartingWithThe, Set)).toEqual(
      new Set(['The Americans', 'The Sopranos'])
    );
  });
});

describe('create()', () => {
  describe('Array source', () => {
    it('works with Set', () => {
      const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);

      const dramasSet = create(dramas, Set);
      expect(dramasSet).toEqual(
        new Set(['The Americans', 'The Sopranos', 'Breaking Bad'])
      );
    });

    it('works with Array', () => {
      const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);

      const dramasArray = create(dramas, Array);
      expect(dramasArray.sort()).toEqual([
        'Breaking Bad',
        'The Americans',
        'The Sopranos',
      ]);
    });

    it('works with Object', () => {
      const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);

      const dramasMap = create(dramas, Map);
      expect(dramasMap).toEqual(
        new Map([
          ['The Americans', true],
          ['The Sopranos', true],
          ['Breaking Bad', true],
        ])
      );
    });

    it('works with Object', () => {
      const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);

      const dramasObject = create(dramas, Object);
      expect(dramasObject).toEqual({
        'The Americans': true,
        'The Sopranos': true,
        'Breaking Bad': true,
      });
    });
  });

  describe('Map source', () => {
    it('works with Set', () => {
      const dramas = source(
        new Map([
          ['first', 1],
          ['second', 2],
          ['third', 3],
        ])
      );

      const dramasSet = create(dramas, Set);
      expect(dramasSet).toEqual(new Set(['first', 'second', 'third']));
    });

    it('works with Array', () => {
      const dramas = source(
        new Map([
          ['first', 1],
          ['second', 2],
          ['third', 3],
        ])
      );

      const dramasArray = create(dramas, Array);
      expect(dramasArray.sort()).toEqual(['first', 'second', 'third']);
    });

    it('works with Map', () => {
      const dramas = source(
        new Map([
          ['first', 1],
          ['second', 2],
          ['third', 3],
        ])
      );

      const dramasMap = create(dramas, Map);
      expect(dramasMap).toEqual(
        new Map([
          ['first', 1],
          ['second', 2],
          ['third', 3],
        ])
      );
    });

    it('works with Object', () => {
      const dramas = source(
        new Map([
          ['first', 1],
          ['second', 2],
          ['third', 3],
        ])
      );

      const dramasObject = create(dramas, Object);
      expect(dramasObject).toEqual({ first: 1, second: 2, third: 3 });
    });
  });
});

describe('into()', () => {
  describe('Map source', () => {
    const subject = () =>
      source(
        new Map([
          ['first', 'ONE'],
          ['second', 'TWO'],
          ['third', 'THREE'],
        ])
      );

    it('works with Map', () => {
      const dramas = subject();

      const dramasMap = into(new Map(), dramas);
      expect(dramasMap).toEqual(
        new Map([
          ['first', 'ONE'],
          ['second', 'TWO'],
          ['third', 'THREE'],
        ])
      );
    });

    it('works with Set', () => {
      const dramas = subject();

      const dramasSet = into(new Set<string>(), dramas);
      expect(dramasSet).toEqual(new Set(['first', 'second', 'third']));
    });

    it('works with Object', () => {
      const dramas = subject();

      const dramasObject = into({}, dramas);
      expect(dramasObject).toEqual({
        first: 'ONE',
        second: 'TWO',
        third: 'THREE',
      });
    });

    it('works with FormData', () => {
      const dramas = subject();

      const formData = into(new FormData(), dramas);
      expect(formData.get('first')).toEqual('ONE');
      expect(formData.get('second')).toEqual('TWO');
      expect(formData.get('third')).toEqual('THREE');
    });
  });
});

describe('example of everything', () => {
  it('can use Map with fallback', () => {
    const paidPlans = source(
      new Map([
        ['premium', 50],
        ['basic', 20],
      ])
    );
    const freePlan = always(0);
    const costForPlan = union(paidPlans, freePlan);

    expect(costForPlan('premium')).toBe(50);
    expect(costForPlan('basic')).toBe(20);
    expect(costForPlan('anything else')).toBe(0);
    expect(costForPlan('foo')).toBe(0);
  });

  it('can use Object with fallback', () => {
    const paidPlans = source({
      premium: 50,
      basic: 20,
    });
    const freePlan = always(0);
    const costForPlan = union(paidPlans, freePlan);

    expect(costForPlan('premium')).toBe(50);
    expect(costForPlan('basic')).toBe(20);
    expect(costForPlan('anything else' as any)).toBe(0);
    expect(costForPlan('foo' as any)).toBe(0);
  });

  it('works with arrays, sets, and functions', () => {
    const dramas = source(['The Americans', 'The Sopranos', 'Breaking Bad']);
    const comedies = source(['Flight of the Conchords']);

    const shows = union(dramas, comedies);

    shows('The Americans'); // true
    shows('The Sopranos'); // true
    shows('The Wire'); // false

    expect(create(shows, Set)).toEqual(
      new Set([
        'The Americans',
        'Flight of the Conchords',
        'The Sopranos',
        'Breaking Bad',
      ])
    );

    const startingWithThe = (title: string) => title.startsWith('The ');
    const showsStartingWithThe = intersection(shows, startingWithThe);
    expect(create(showsStartingWithThe, Set)).toEqual(
      new Set(['The Americans', 'The Sopranos'])
    );
  });

  it('works with every type', () => {
    const shows = source(['The Americans', 'The Sopranos', 'Breaking Bad']);

    const showsSet = into(new Set<string>(), shows);
    const showsMap = into(new Map<string, boolean>(), source(showsSet));
    // const showsObject = into({}, source(showsMap));
    const showsArray = into([], source(showsMap));

    expect(showsArray.sort()).toEqual([
      'Breaking Bad',
      'The Americans',
      'The Sopranos',
    ]);
  });
});
