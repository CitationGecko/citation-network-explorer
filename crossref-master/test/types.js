
import test from 'ava';
import xref from '..';

test('list types', t => {
  xref.types((err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    // /types is a festival of API fun! The 'journal-article' entry has a `null` label.
    t.same(objs.length, objs.filter(w => w.id && (w.label || w.label === null)).length, 'has list of types');
    t.notOk(nextOpts.offset, 'next offset is undefined');
    t.true(done, 'is done on the first page');
    t.end();
  });
});
