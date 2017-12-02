
import test from 'ava';
import xref from '..';

test('works for journal', t => {
  xref.journalWorks('1099-0526', (err, objs) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length,
          objs.filter(o => o.ISSN.filter(f => f === '1099-0526').length).length,
          'returns works with the right journal');
    t.end();
  });
});
