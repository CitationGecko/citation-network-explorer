
import test from 'ava';
import xref from '..';

test('list journals', t => {
  xref.journals((err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length, objs.filter(w => w.title && w.publisher && w.ISSN).length, 'has list of journals');
    t.same(nextOpts.offset, 20, 'next offset is configured correctly');
    t.false(done, 'is not done on the first page');
    t.end();
  });
});
