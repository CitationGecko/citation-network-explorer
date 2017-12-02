
# crossref

A client for the CrossRef API, for Node and browsers.

The [CrossRef API](http://api.crossref.org/) is relatively simple, but rolling access by hand is
never fun; and it has its little inconsistencies that can bite you. This thin module wraps it so
that you don't have to worry about that too much. (I say “too much” because it does not remove
inconsistency down to the object level, e.g. things sometimes being `uri` and sometimes `URL`.)

## Installation

The usual:

    npm install --save crossref

## API

Details for the API and the objects can be obtained from [the official CrossRef
documentation](http://api.crossref.org/). It isn't very thorough (to say the least) but accessing
various endpoints with `?sample=10` tacked onto the URL should give you a decent idea of what the
objects look like. (If you want to know which fields are optional and which are guaranteed to occur
you're out of luck, though, there is no documentation whatsoever — and I know no better).

You can load the CrossRef object like this:

```js
import CrossRef from 'crossref';
```

If you're somehow reading this before 2015, you can also do:

```js
var CrossRef = require('crossref')
```

In the browser you load `crossref.min.js`, then access the global `CrossRef` object.

This module exposes two types of methods: **item methods**, that only ever return one object, and
**list methods** that return a list of objects followed by several bits of information that can be
used to work with the list, notably with pagination. They differ in their callbacks:

* The item method callbacks receive `(err, obj)` where `err` is an `Error` (if there was one), and
  `obj` will be a simple JSON data structure.
* The list method callbacks receive `(err, objects, nextOptions, isDone, message)`. That may seem
  like a mouthful, but you rarely need them all. As usual `err` is an `Error` if there was one,
  and `objects` is a list of simple JSON data structures. When you are paginating through the
  results (which is not uncommon since CrossRef is a relatively large database) you will want to
  use `nextOptions` and `isDone`. The former is an options object that captures the same search
  options you passed to the method, but with the `offset` adjusted such that it will get the next
  page. Basically, if you call the same method again with `nextOptions` you will get the next page
  of the same query. And the latter is a boolean that is `true` if you have reached the last page.
  Finally, `message` is just the list wrapper without its objects; it is only really useful if you
  need some obscure metadata, for instance if you are doing a `facet` query (if you don't know what
  that is you probably don't need it).

### Root Listing Methods

These query the root endpoints from the CrossRef API and return a list. They all take an optional
`options` object. If it is empty you just list everything, if it is defined it will translate to
the [API's parameters](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md#parameters).
Only minimal process is done to map your JS object to the query string:

* If you have a `query`, it is properly escaped.
* You can specify `filter` as an object, and the correct string is built for you. If you want to
  specify a given filter key multiple times to `OR` it, just put all the values in an array.
* If you set `facet` to any truthy value it will come out as `facet=t`.

Other options are just past through as key-value pairs. The options object can always be omitted.
You might want to be cautious with `options` on the `types()` method: the API tends to behave
differently for that endpoint, and while we try to make it more consistent we probably haven't
caught everything yet.

The methods are [documented in the
API](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md#resource-components):

* `CrossRef.works([options], listCB)`
* `CrossRef.funders([options], listCB)`
* `CrossRef.members([options], listCB)`
* `CrossRef.types([options], listCB)`
* `CrossRef.licenses([options], listCB)`
* `CrossRef.journals([options], listCB)`

### Item Methods

These methods retrieve a single item for a given key (or return an `Error` if not found). They are
[documented in the
API](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md#resource-components-and-identifiers)

* `CrossRef.work(doi, itemCB)`
* `CrossRef.funder(funderID, itemCB)`
* `CrossRef.prefix(doiPrefix, itemCB)`
* `CrossRef.member(memberID, itemCB)`
* `CrossRef.type(typeID, itemCB)`
* `CrossRef.journal(issn, itemCB)`

### Works Listing Methods

These methods are listing methods, but they list the works that correspond to a given item (e.g.
the works funded by a given funder). They all take a key like the item methods and optional
`options`. They are [documented in the
API](https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md#combining-resource-components).

* `CrossRef.funderWorks(funderID, [options], listCB)`
* `CrossRef.prefixWorks(doiPrefix, [options], listCB)`
* `CrossRef.memberWorks(memberID, [options], listCB)`
* `CrossRef.journalWorks(issn, [options], listCB)`
