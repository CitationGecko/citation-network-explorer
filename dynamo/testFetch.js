var _ = require('lodash');
var dynamo = require('../lib/dynamo');

dynamo.getThisArticleCitedBy('itemA', function(err, data) {
  if (err) {
    console.log('Error', err);
  }

  // console.log(data);
  _.each(data.Items, function(entry) {
    console.log(entry.citeFrom.S, 'cites', entry.citeTo.S);
  });
});
