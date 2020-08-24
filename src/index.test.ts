import {
  emptySet,
  universalSet,
  single,
  lookup,
  complement,
  union,
  difference,
  intersection,
  create,
  into,
} from './index';
import { lazy } from 'jest-zest';

describe('emptySet', () => {
  it('always returns false', () => {
    expect(emptySet('anything')).toBe(false);
    expect(emptySet('at')).toBe(false);
    expect(emptySet('all')).toBe(false);
    expect(emptySet('')).toBe(false);
  });
});

describe('universalSet', () => {
  it('always returns true', () => {
    expect(universalSet('anything')).toBe(true);
    expect(universalSet('at')).toBe(true);
    expect(universalSet('all')).toBe(true);
    expect(universalSet('')).toBe(true);
  });
});

describe('single()', () => {
  it('works with just a string key', () => {
    const get = single('some key');
    expect(get('some key')).toBe(true);
    expect(get('some other key')).toBe(false);
    expect(new Map(get())).toEqual(new Map([['some key', true]]));
  });

  it('works with a string key and string value', () => {
    const get = single('some key', 'some value');
    expect(get('some key')).toBe('some value');
    expect(get('some other key')).toBe(undefined);
    expect(new Map(get())).toEqual(new Map([['some key', 'some value']]));
  });

  it('works with a string key and number value', () => {
    const get = single('some key', 123);
    expect(get('some key')).toBe(123);
    expect(get('some other key')).toBe(undefined);
    expect(new Map(get())).toEqual(new Map([['some key', 123]]));
  });
});

describe('lookup()', () => {
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
    expect(new Map(get())).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );
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
    expect(new Map(get())).toEqual(
      new Map([
        ['first', true],
        ['second', true],
      ])
    );
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
    expect(new Map(get())).toEqual(
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
    const [get] = lookup(formData);

    expect(get('first')).toBe('ONE');
    expect(get('second')).toBe('TWO');
    expect(get('missing')).toBe(null);
    expect(new Map(get())).toEqual(
      new Map([
        ['first', 'ONE'],
        ['second', 'TWO'],
      ])
    );
  });
});

describe('complement()', () => {
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

describe('union()', () => {
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

describe('difference()', () => {
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

  it('works with a Map and an array', () => {
    const [a] = lookup(
      new Map([
        ['first', 1],
        ['second', 2],
        ['third', -3],
      ])
    );
    const [b] = lookup(['third', 'fourth']);
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

  it('works with a Set and a function', () => {
    const [shows] = lookup([
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
});

describe('intersection()', () => {
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

  it('works with a Set and a function', () => {
    const [shows] = lookup([
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
      const [dramas] = lookup([
        'The Americans',
        'The Sopranos',
        'Breaking Bad',
      ]);

      const dramasSet = create(dramas, Set);
      expect(dramasSet).toEqual(
        new Set(['The Americans', 'The Sopranos', 'Breaking Bad'])
      );
    });

    it('works with Array', () => {
      const [dramas] = lookup([
        'The Americans',
        'The Sopranos',
        'Breaking Bad',
      ]);

      const dramasArray = create(dramas, Array);
      expect(dramasArray.sort()).toEqual([
        'Breaking Bad',
        'The Americans',
        'The Sopranos',
      ]);
    });

    it('works with Object', () => {
      const [dramas] = lookup([
        'The Americans',
        'The Sopranos',
        'Breaking Bad',
      ]);

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
      const [dramas] = lookup([
        'The Americans',
        'The Sopranos',
        'Breaking Bad',
      ]);

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
      const [dramas] = lookup(
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
      const [dramas] = lookup(
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
      const [dramas] = lookup(
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
      const [dramas] = lookup(
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
    const subject = lazy(() =>
      lookup(
        new Map([
          ['first', 'ONE'],
          ['second', 'TWO'],
          ['third', 'THREE'],
        ])
      )
    );

    it('works with Map', () => {
      const [dramas] = subject();

      const dramasMap: Map<string, string> = new Map();
      into(dramas, dramasMap);
      expect(dramasMap).toEqual(
        new Map([
          ['first', 'ONE'],
          ['second', 'TWO'],
          ['third', 'THREE'],
        ])
      );
    });

    it('works with Set', () => {
      const [dramas] = subject();

      const dramasSet: Set<string> = new Set();
      into(dramas, dramasSet);
      expect(dramasSet).toEqual(new Set(['first', 'second', 'third']));
    });

    it('works with Object', () => {
      const [dramas] = subject();

      const dramasObject = {};
      into(dramas, dramasObject);
      expect(dramasObject).toEqual({ first: 'ONE', second: 'TWO', third: 'THREE' });
    });

    it('works with FormData', () => {
      const [dramas] = subject();

      const formData = new FormData();
      into(dramas, formData);
      expect(formData.get('first')).toEqual('ONE');
      expect(formData.get('second')).toEqual('TWO');
      expect(formData.get('third')).toEqual('THREE');
    });
  });
});

describe('example of everything', () => {
  it('works', () => {
    const [dramas] = lookup(['The Americans', 'The Sopranos', 'Breaking Bad']);
    const [comedies] = lookup(['Flight of the Conchords']);

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
});
