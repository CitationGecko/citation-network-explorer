
import test from 'ava';
import xref from '..';

test('works for prefix', t => {
  xref.prefixWorks('10.1002', (err, objs) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length,
          objs.filter(o => o.DOI.indexOf('10.1002') === 0).length,
          'returns works with the right prefix');
    t.end();
  });
});
