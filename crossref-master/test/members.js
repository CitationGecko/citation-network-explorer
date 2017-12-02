
import test from 'ava';
import xref from '..';

test('list members', t => {
  xref.members((err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length, objs.filter(w => w.id && w.flags && w.location).length, 'has list of members');
    t.same(nextOpts.offset, 20, 'next offset is configured correctly');
    t.false(done, 'is not done on the first page');
    t.end();
  });
});
