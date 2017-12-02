
import test from 'ava';
import xref from '..';

test('specific work', t => {
  xref.work('10.5117/9781904633778', (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.DOI, '10.5117/9781904633778', 'returns the same DOI');
    t.same(res.title[0], 'Moby-Dick', 'returns the correct title');
    t.end();
  });
});
