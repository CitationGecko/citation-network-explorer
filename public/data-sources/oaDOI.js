oaDOI = {

    accessQuery: function(paper){

      if(paper.DOI){

        url = "https://api.oadoi.org/v2/" + paper.DOI +"?email=bjw15@ic.ac.uk";
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url,true); 
        xmlhttp.onreadystatechange = function() {
          if(this.readyState == 4) {
            if(this.status == 200) {
              // Do something with the results
              console.log('response from oaDOI')

              paper.OA = JSON.parse(this.responseText).is_oa;

            } else {
              // Some kind of error occurred.
              //alert("oaDOI query error: " + this.status + " "+ this.responseText);
            }
          }
        };
        xmlhttp.send(null);

      }
       

    },



searchAll: function(){

    Papers.forEach(oaDOI.accessQuery)

}

}