
newModule('crossref', {
    eventResponses: {
        newSeed: {
            listening: true,
            action: async function(paper){
            
                if(paper.crossref!='Complete'){
                    await paper.crossref
                    paper.crossref = 'Complete'
                    triggerEvent('seedUpdate',paper);
                }
                if(paper.references){
                    paper.references.forEach((ref)=>{
                        let cited = addPaper(crossref.parseReference(ref))
                        addEdge({
                            source: paper,
                            target: cited,
                            crossref: true,
                            hide: false
                        });
                        console.log('CrossRef found ' + paper.references.length + " citations")
                    })
                    triggerEvent('newEdges')
                }
            }
        },   
        newPaper: {
            listening: true,
            action: function(paper){
                if(paper.doi){
                    console.log("querying crossRef for " +paper.doi)
                    paper.crossref = new Promise((resolve,reject)=>{
                        CrossRef.work(paper.doi,function(err,response){          
                            if(err){
                                paper.crossref = false
                                resolve('CrossRef info not found')
                            } else {
                                console.log("CrossRef data found for "+paper.doi)
                                paper.crossref = 'Complete'
                                merge(paper,crossref.parsePaper(response))
                                triggerEvent('paperUpdate')
                                resolve('CrossRef info found')
                            }
                        });
                    })   
                };  
            }
        },
    },
    methods:{
        titleSearch: function(input){

            let query = input.replace(' ','+')
            let url = `https://api.crossref.org/works?query.title=${query}`
            fetch(url).then((resp)=>resp.json()).then(json=>{
                
                items = json.message.items.map(a=>{
                    return {
                        doi: a.DOI,
                        title: a.title[0],
                        author: a.author[0].family,
                        month: a.created['date-parts'][0][1],
                        year: a.created['date-parts'][0][0],
                        timestamp: a.created.timestamp,
                        journal: a['container-title'][0]
                    }
                })
                printTable('#search-items',items)

            })
        },
        parsePaper: function(response){
        return {
                doi: response.DOI,
                title: response.title[0],
                author: response.author[0].family,
                month: response.created['date-parts'][0][1],
                year: response.created['date-parts'][0][0],
                timestamp: response.created.timestamp,
                journal: response['container-title'][0],
                citationCount: response['is-referenced-by-count'],
                references: response['reference'] ? response['reference'] : false,
                crossref: true
            };

        },
        parseReference: function(ref){
            return {
                doi: ref.DOI ? ref.DOI : null,
                title: ref['article-title'] ? ref['article-title'] : 'unavailable',
                author: ref.author ? ref.author : null,
                year: ref.year ? ref.year : null ,
                journal: ref['journal-title'] ? ref['journal-title'] : null,
            }

        },
        parseResponse: function(response){
            
            let ne = 0; //For bean counting only
            
            let citer = crossref.parsePaper(response);
            
            citer = addPaper(citer,true);

            if(!citer.references){return(citer)};

            let refs = citer.references;

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