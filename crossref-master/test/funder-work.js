
import test from 'ava';
import xref from '..';

test('works for funder', t => {
  xref.funderWorks('100005376', (err, objs) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length,
          objs.filter(o => o.funder.filter(f => f.name === 'American Mathematical Society').length).length,
          'returns works with the right funder');
    t.end();
  });
});
