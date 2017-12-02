
import test from 'ava';
import xref from '..';

test('works for member', t => {
  xref.memberWorks(311, (err, objs) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length,
          objs.filter(o => o.member === 'http://id.crossref.org/member/311').length,
          'returns works with the right member');
    t.end();
  });
});
