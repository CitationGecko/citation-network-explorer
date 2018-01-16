oaDOI = {

    accessQuery: function(paper){

        url = "https://api.oadoi.org/v2/" + paper.DOI;
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

    },



searchAll: function(){

    Papers.forEach(oaDOI.accessQuery)

}

}

function colorByOA(){

  node.attr("fill", function(d) { 
      
      if(d.OA==true){
          return 'green'
      }else if(d.OA==false){
          return 'red'
      }else{
          return 'grey'
      }    
  
  })                                            

}