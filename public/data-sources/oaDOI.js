newDataModule('oaDOI', {
    
  eventResponses: {
    newPaper: function(paper){
      //oaDOI.getAccessStatus(paper)
    }
  },
  getAccessStatus: function(paper) {
      if (paper.DOI) {
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
      }
    },

  getAllAccessStatus: function() {
      Papers.forEach(oaDOI.getAccessStatus);
  }
})
