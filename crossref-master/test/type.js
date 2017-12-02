
import test from 'ava';
import xref from '..';

test('specific type', t => {
  xref.type('book', (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.id, 'book', 'returns the same id');
    t.same(res.label, 'Book', 'returns the correct label');
    t.end();
  });
});
