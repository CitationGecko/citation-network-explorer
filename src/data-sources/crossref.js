
newDataModule('crossref', {
    //Sends a query (queryStr) to endpoint and executes callback on response
    eventResponses: {

        newSeed: function(paper){
            console.log("querying crossRef for references...")
            if(paper.DOI){
                CrossRef.work(paper.DOI,function(err,res){
                    console.log("response from CrossRef!")
                    let seed = crossref.parseResponse(res);
                    triggerEvent('seedUpdate',seed); //Could put in merge function instead...
                    refreshGraphics();         
                });  
            }    
        },   
        newPaper: function(paper){
            if(paper.DOI){
                CrossRef.work(paper.DOI,function(err,response){          
                    paper.Title = response.title[0];
                    paper.Author= response.author[0].family;
                    paper.Month= response.created['date-parts'][0][1];
                    paper.Year= response.created['date-parts'][0][0];
                    paper.Journal= response['container-title'][0];
                    paper.CitationCount= response['is-referenced-by-count'];
                    updateConnectedList(forceGraph.sizeMetric);
                });
            };  
        }
    },
    
    parseResponse: function(response){
        let ne = 0; //For bean counting only
        let citer = {
            DOI: response.DOI,
            Title: response.title[0],
            Author: response.author[0].family,
            Month: response.created['date-parts'][0][1],
            Year: response.created['date-parts'][0][0],
            Timestamp: response.created.timestamp,
            Journal: response['container-title'][0],
            CitationCount: response['is-referenced-by-count'],
            seed: true,
            crossref: true
        };
        citer = addPaper(citer);
        if(!response.reference){return(citer)};

        let refs = response.reference;
        for(let i=0;i<refs.length;i++){

            let cited = {
                DOI: refs[i].DOI ? refs[i].DOI : null,
                Title: refs[i]['article-title'] ? refs[i]['article-title'] : 'unavailable',
                Author: refs[i].author ? refs[i].author : null,
                Year: refs[i].year ? refs[i].year : null ,
                Journal: refs[i]['journal-title'] ? refs[i]['journal-title'] : null,
                seed: false
            };            
            cited = addPaper(cited);
            let newEdge = {
                source: citer,
                target: cited,
                crossref: true,
                hide: false
            }
            addEdge(newEdge);
            ne++;//bean counting
        };   
        console.log('CrossRef found ' + ne + " citations")
        return(citer)
    } 
})