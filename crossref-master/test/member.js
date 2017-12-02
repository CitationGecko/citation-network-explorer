
import test from 'ava';
import xref from '..';

test('specific member', t => {
  xref.member(311, (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.id, 311, 'returns the same id');
    t.same(res['primary-name'], 'Wiley-Blackwell', 'returns the correct name');
    t.end();
  });
});
