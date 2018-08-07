
newDataModule('crossref', {
    eventResponses: {
        newSeed: {
            listening: false,
            action: async function(paper){
            
                if(paper.crossref!='Complete'){
                    await paper.crossref
                    paper.crossref = 'Complete'
                    triggerEvent('seedUpdate',paper);
                }
                if(paper.References){
                    paper.References.forEach((ref)=>{
                        let cited = addPaper(crossref.parseReference(ref))
                        addEdge({
                            source: paper,
                            target: cited,
                            crossref: true,
                            hide: false
                        });
                        console.log('CrossRef found ' + paper.References.length + " citations")
                    })
                }
                refreshGraphics();         
            }
        },   
        newPaper: {
            listening: false,
            action: function(paper){
                if(paper.DOI){
                    console.log("querying crossRef for " +paper.DOI)
                    paper.crossref = new Promise((resolve,reject)=>{
                        CrossRef.work(paper.DOI,function(err,response){          
                            if(err){
                                paper.crossref = false
                                resolve('CrossRef info not found')
                            } else {
                                console.log("CrossRef data found for "+paper.DOI)
                                paper.crossref = 'Complete'
                                merge(paper,crossref.parsePaper(response))
                                updateConnectedList(forceGraph.sizeMetric);
                                resolve('CrossRef info found')
                            }
                        });
                    })   
                };  
            }
        },
    },
    methods:{
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
    }
})