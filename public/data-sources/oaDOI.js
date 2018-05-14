oaDOI = {
    accessQuery: function(paper) {
      // if (paper.DOI) {
      //   // var url = '/api/v1/query/oadoi?doi=' + paper.DOI;
      //   var url = 'https://api.oadoi.org/v2/' + paper.DOI + '?email=bjw15@ic.ac.uk';
      //   xmlhttp = new XMLHttpRequest();
      //   xmlhttp.open('GET', url, true);
      //
      //   xmlhttp.onreadystatechange = function() {
      //     if (this.readyState == 4) {
      //       if (this.status == 200) {
      //         // Do something with the results
      //         // console.log('Response from oadoi');
      //         // paper.OA = JSON.parse(this.responseText).data.is_oa;
      //         paper.OA = JSON.parse(this.responseText).is_oa;
      //       }
      //     }
      //   };
      //   xmlhttp.send(null);
      // }
    },

  searchAll: function() {
      Papers.forEach(oaDOI.accessQuery);
  }
};
