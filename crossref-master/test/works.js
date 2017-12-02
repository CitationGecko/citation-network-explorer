
import test from 'ava';
import xref from '..';

const balisage = '10.4242/balisagevol14.berjon01';

test('list works', t => {
  xref.works((err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length, objs.filter(w => w.DOI).length, 'has list of works');
    t.same(nextOpts.offset, 20, 'next offset is configured correctly');
    t.false(done, 'is not done on the first page');
    t.end();
  });
});

test('query works', t => {
  xref.works({ query: 'Mending Fences and Saving Babies' }, (err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.ok(objs.filter(w => w.DOI === balisage).length, 'has the sought-for talk');
    t.end();
  });
});

test('facets of works', t => {
  xref.works({ facet: true }, (err, objs, nextOpts, done, message) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.ok(message.facets, 'has facets');
    t.ok(message.facets['type-name']['value-count'], 20, 'has correct number of facets');
    t.end();
  });
});

test('filtering works', t => {
  xref.works({ filter: { type: 'book', 'has-archive': true } }, (err, objs, nextOpts, done) => {
    t.ifError(err, 'does not error');
    if (err) return t.end();
    t.same(objs.length, objs.filter(w => w.type === 'book').length, 'has only books');
    t.same(objs.length, objs.filter(w => w.archive).length, 'has only archives');
    t.end();
  });
});
