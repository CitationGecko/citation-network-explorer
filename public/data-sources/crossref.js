var crossref = {
    //Sends a query (queryStr) to endpoint and executes callback on response
    queryRefs: function(doi,followup){

        console.log("querying crossRef...")
        CrossRef.work(doi,function(err,res){

            console.log("response from CrossRef!")

            let seed = crossref.parseRefs(res)
            
            updateMetrics(Papers,Edges); // update citation metrics
            
            updateSeedTable(); //update HTML table
        
            updateResultsTable(); //update HTML table;
        
            updateGraph(Papers,Edges);

            if(followup){

                microsoft.titleMatch(seed)

            }
            
        })
        
    },   

    parseRefs: function(response){

        let np = 0; //For bean counting only 
        let ne = 0; //For bean counting only

        let citer = {

            ID: uniqueID,
            DOI: response.DOI,
            Title: response.title[0],
            Author: response.author[0].family,
            Month: response.created['date-parts'][0][1],
            Year: response.created['date-parts'][0][0],
            Journal: response['container-title'][0],
            CitationCount: response['is-referenced-by-count'],
            seed: true

        }

        let existingRecord = matchPapers(citer,Papers); // Search for existing paper
        
        if(!existingRecord){//If it doesn't exist add it
            
            oaDOI.accessQuery(citer)
            Papers.push(citer);np++;uniqueID++
        
        }else{//If it does merge it
            
            citer = mergePapers(existingRecord,citer);
        
        }  

        if(!response.reference){return(citer)} 

        let refs = response.reference

        for(let i=0;i<refs.length;i++){

            let cited = {

                ID: uniqueID,
                DOI: refs[i].DOI ? refs[i].DOI : null,
                Title: refs[i]['article-title'] ? refs[i]['article-title'] : 'unavailable',
                Author: refs[i].author ? refs[i].author : null,
                Year: refs[i].year ? refs[i].year : null ,
                Journal: refs[i]['journal-title'] ? refs[i]['journal-title'] : null,
                seed: false
            }

            //if you have DOI query crossRef for more info.

            if(cited.DOI){
                crossref.getDetails(cited)
            }

            let existingRecord = matchPapers(cited,Papers); // Search for existing paper
            
            if(!existingRecord){//If it doesn't exist add it
                
                oaDOI.accessQuery(cited)
            
                Papers.push(cited);np++;uniqueID++
            
            }else{//If it does merge it
                
                cited = mergePapers(existingRecord,cited);
            
            }

            let newEdge = {

                source: citer,
                target: cited,
                origin: "crossref",
                hide: false

            }
            if(Edges.filter(function(e){
                return e.source == newEdge.source & e.target == newEdge.target;
                }).length == 0){
                    Edges.push(newEdge);ne++
                }
        }   
    
        console.log(np + " papers and " + ne + " edges added from CrossRef")

        return(citer)

    },

    getDetails: function(paper){

        CrossRef.work(paper.DOI,function(err,response){
            
            paper.Title = response.title[0];
            paper.Author= response.author[0].family;
            paper.Month= response.created['date-parts'][0][1];
            paper.Year= response.created['date-parts'][0][0];
            paper.Journal= response['container-title'][0];
            paper.CitationCount= response['is-referenced-by-count'];

        })

    } 

}
