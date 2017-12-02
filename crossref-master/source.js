
import request from 'request';
import assign from 'lodash/assign';

const endpoint = 'https://api.crossref.org/';
const timeout = 60 * 1000; // CrossRef is *very* slow

// make a request
function GET (path, cb) {
  // console.log(`### ${endpoint}${path}`);
  request({ url: `${endpoint}${path}`, json: true, timeout }, (err, res, body) => {
    if (err || !res || res.statusCode >= 400) {
      let statusCode = res ? res.statusCode : 0
        , statusMessage = res ? res.statusMessage : 'Unspecified error (likely a timeout)'
      ;

      if (statusCode === 429) {
        let headers = res.headers || {}
          , limit = headers['x-rate-limit-limit'] || 'N/A'
          , interval = headers['x-rate-limit-interval'] || 'N/A'
        ;
        return cb(new Error(`Rate limit exceeded: ${limit} requests in ${interval}`));
      }
      if (statusCode === 404) return cb(new Error(`Not found on CrossRef: '${endpoint}${path}'`));
      let msg = (err && err.message) ? err.message : statusMessage;
      return cb(new Error(`CrossRef error: [${statusCode}] ${msg}`));
    }
    if (typeof body !== 'object') return cb(new Error(`CrossRef response was not JSON: ${body}`));
    if (!body.status) return cb(new Error('Malformed CrossRef response: no `status` field.'));
    if (body.status !== 'ok') return cb(new Error(`CrossRef error: ${body.status}`));
    cb(null, body.message);
  });
}

// make a method that just returns the one item
function item (urlTmpl) {
  return (param, cb) => GET(urlTmpl.replace('{param}', param), cb);
}

// backend for list requests
function listRequest (path, options = {}, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  // serialise options
  let opts = [];
  for (let k in options) {
    // The whole URL *minus* the scheme and "://" (for whatever benighted reason) has to be at most
    // 4096 characters long. Taking the extra bloat that `encodeURIComponent()` adds we truncate the
    // query to 2000 chars. We could be more precise and regenerate the URL until we reach as close
    // as possible to 4096, but frankly if you're searching for a string longer than 2000 characters
    // you're probably doing something wrong.
    if (k === 'query') {
      if (options.query.length > 2000) options.query = options.query.substr(0, 2000);
      opts.push(`query=${encodeURIComponent(options.query)}`);
    }
    else if (k === 'filter') {
      let filts = [];
      for (let f in options.filter) {
        if (Array.isArray(options.filter[f])) {
          options.filter[f].forEach(val => {
            filts.push(`${f}:${val}`);
          });
        }
        else {
          filts.push(`${f}:${options.filter[f]}`);
        }
      }
      opts.push(`filter=${filts.join(',')}`);
    }
    else if (k === 'facet' && options.facet) opts.push('facet=t');
    else opts.push(`${k}=${options[k]}`);
  }
  if (opts.length) path += `?${opts.join('&')}`;
  return GET(path, (err, msg) => {
    if (err) return cb(err);
    let objects = msg.items;
    delete msg.items;
    let nextOffset = 0
      , isDone = false
      , nextOptions
    ;
    // /types is a list but it does not behave like the other lists
    // Once again the science.ai League of JStice saves the day papering over inconsistency!
    if (msg['items-per-page'] && msg.query) {
      nextOffset = msg.query['start-index'] + msg['items-per-page'];
      if (nextOffset > msg['total-results']) isDone = true;
      nextOptions = assign({}, options, { offset: nextOffset });
    }
    else {
      isDone = true;
      nextOptions = assign({}, options);
    }
    cb(null, objects, nextOptions, isDone, msg);
  });
}

// make a method that returns a list that can be
function list (path) {
  return (options, cb) => listRequest(path, options, cb);
}
function itemList (urlTmpl) {
  return (param, options, cb) => listRequest(urlTmpl.replace('{param}', param), options, cb);
}

// Actual API
// /works/{doi} returns metadata for the specified CrossRef DOI.
// /funders/{funder_id} returns metadata for specified funder and its suborganizations
// /prefixes/{owner_prefix} returns metadata for the DOI owner prefix
// /members/{member_id} returns metadata for a CrossRef member
// /types/{type_id} returns information about a metadata work type
// /journals/{issn} returns information about a journal with the given ISSN
export const work     = item('works/{param}');
export const funder   = item('funders/{param}');
export const prefix   = item('prefixes/{param}');
export const member   = item('members/{param}');
export const type     = item('types/{param}');
export const journal  = item('journals/{param}');

// /funders/{funder_id}/works   returns list of works associated with the specified funder_id
// /types/{type_id}/works   returns list of works of type type
// /prefixes/{owner_prefix}/works   returns list of works associated with specified owner_prefix
// /members/{member_id}/works   returns list of works associated with a CrossRef member
//                                  (deposited by a CrossRef member)
// /journals/{issn}/works   returns a list of works in the given journal
export const funderWorks  = itemList('funders/{param}/works');
export const prefixWorks  = itemList('prefixes/{param}/works');
export const memberWorks  = itemList('members/{param}/works');
export const journalWorks = itemList('journals/{param}/works');

// /works   returns a list of all works (journal articles, conference proceedings, books,
//                components, etc), 20 per page
// /funders   returns a list of all funders in the FundRef Registry
// /members   returns a list of all CrossRef members (mostly publishers)
// /types   returns a list of valid work types
// /licenses   return a list of licenses applied to works in CrossRef metadata
// /journals   return a list of journals in the CrossRef database
export const works     = list('works');
export const funders   = list('funders');
export const members   = list('members');
export const types     = list('types');
export const licenses  = list('licenses');
export const journals  = list('journals');

// everything in one big ball
const CrossRef = {
  work,
  funder,
  prefix,
  member,
  type,
  journal,
  funderWorks,
  prefixWorks,
  memberWorks,
  journalWorks,
  works,
  funders,
  members,
  types,
  licenses,
  journals,
};
export default CrossRef;
