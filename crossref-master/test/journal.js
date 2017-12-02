
import test from 'ava';
import xref from '..';

test('specific journal', t => {
  xref.journal('1099-0526', (err, res) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(res.title, 'Complexity', 'returns the correct title');
    t.ok(res.ISSN.filter(iss => iss === '1099-0526').length, 'has the ISSN');
    t.end();
  });
});
