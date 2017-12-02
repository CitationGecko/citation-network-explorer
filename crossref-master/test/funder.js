
import test from 'ava';
import xref from '..';

test('specific funder', t => {
  xref.funder('100005376', (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.id, '100005376', 'returns the same id');
    t.same(res.name, 'American Mathematical Society', 'returns the correct name');
    t.end();
  });
});
