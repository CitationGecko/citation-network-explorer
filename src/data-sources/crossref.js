
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
    parsePaper: function(response){
       return {
            DOI: response.DOI,
            Title: response.title[0],
            Author: response.author[0].family,
            Month: response.created['date-parts'][0][1],
            Year: response.created['date-parts'][0][0],
            Timestamp: response.created.timestamp,
            Journal: response['container-title'][0],
            CitationCount: response['is-referenced-by-count'],
            References: response['reference'] ? response['reference'] : false,
            crossref: true
        };

    },
    parseReference: function(ref){
        return {
            DOI: ref.DOI ? ref.DOI : null,
            Title: ref['article-title'] ? ref['article-title'] : 'unavailable',
            Author: ref.author ? ref.author : null,
            Year: ref.year ? ref.year : null ,
            Journal: ref['journal-title'] ? ref['journal-title'] : null,
        }

    },
    parseResponse: function(response){
        let ne = 0; //For bean counting only
        let citer = crossref.parsePaper(response);
        citer = addPaper(citer,true);

        if(!citer.References){return(citer)};

        let refs = citer.References;

        for(let i=0;i<refs.length;i++){

            let cited = crossref.parseReference(refs[i]);
                        
            cited = addPaper(cited);

            addEdge({
                source: citer,
                target: cited,
                crossref: true,
                hide: false
            });
            ne++;//bean counting
        };   
        console.log('CrossRef found ' + ne + " citations")
        return(citer)
    } 
})