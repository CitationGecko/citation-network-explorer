
import test from 'ava';
import xref from '..';

test('specific prefix', t => {
  xref.prefix('10.1002', (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.prefix, 'http://id.crossref.org/prefix/10.1002', 'returns the same prefix');
    t.same(res.member, 'http://id.crossref.org/member/311', 'returns the correct member');
    t.end();
  });
});
