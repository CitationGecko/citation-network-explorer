
import test from 'ava';
import xref from '..';

test('list funders', t => {
  xref.funders((err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length, objs.filter(w => w.uri && w.name && w.location).length, 'has list of funders');
    t.same(nextOpts.offset, 20, 'next offset is configured correctly');
    t.false(done, 'is not done on the first page');
    t.end();
  });
});
