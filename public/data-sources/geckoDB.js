
newDataModule('gecko', {

    eventResponses:{
        newSeed: function(paper){
            let url = '/api/v1/getCitedBy?doi='+paper.DOI
            fetch(url).then(resp=>resp.json()).then(data => {
                gecko.parseResponse(data,paper);
            })
        },
    },
    parseResponse: function(response,paper){
        let ne = 0; //For bean counting only
        let cited = paper;
        for(let i=0;i<response.length;i++){

            let citer = {
                DOI: response[i].citeFrom
            };
            citer = addPaper(citer);
            let newEdge = {
                source: citer,
                target: cited,
                geckoDB: true,
                hide: false
            }
            addEdge(newEdge);
            ne++;//bean counting
        };   
        console.log('GeckoDB found ' + ne + " citations")
        return(cited)
    }
})