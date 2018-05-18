newDataModule('oaDOI', {
    
  eventResponses: {
    newPaper: function(paper){
      oaDOI.accessQuery(paper)
    }
  },
  accessQuery: function(paper) {
      /* if (paper.DOI) {
        var url = '/api/v1/query/oadoi?doi=' + paper.DOI;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url, true);

        xmlhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              // Do something with the results
              // console.log('Response from oadoi');
              paper.OA = JSON.parse(this.responseText).data.is_oa;
            }
          }
        };
        xmlhttp.send(null);
      } */
    },

  searchAll: function() {
      Papers.forEach(oaDOI.accessQuery);
  }
})
