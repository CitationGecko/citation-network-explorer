newDataModule('oaDOI', {
    
  eventResponses: {
    newPaper: {
      listenting: false,
      action: function(paper){
        oaDOI.getAccessStatus(paper)
      }
    }
  },
  methods:{
    getAccessStatus: function(paper) {
        if (paper.DOI) {
          var url = '/api/v1/query/oadoi?doi=' + paper.DOI;
          
          fetch(url).then(resp=>resp.json()).then(json=>{
            paper.OA = JSON.parse(this.responseText).data.is_oa;
          })
        }
      },

    getAllAccessStatus: function() {
        Papers.forEach(oaDOI.getAccessStatus);
    }
  }
})

/* 
document.getElementById('colorByOA').onclick = function(){
    node.attr("fill", function(d) { 
        if(d.OA==true){
            return 'green'
        }else if(d.OA==false){
            return 'red'
        }else{
            return 'grey'
        }    
    })                
} */