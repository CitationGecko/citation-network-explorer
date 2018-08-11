const _ = require('lodash');

const schema = {
  id: '',
  doi: '',
  microsoftId: '',
  isSeed: false,

  title: '',
  pubDate: '',
  journal: '',
  publisher: '',

  references: [],
  citationCount: 20,
  openaccess: false,
  urls: [],

  authors: [
    {
      firstName: '',
      lastName: '',
      orcid: ''
    }
  ]
};

function getTemplate() {
  return _.clone(schema);
}

module.exports = getTemplate;
