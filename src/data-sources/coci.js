
newDataModule('coci', {
    eventResponses:{
        newSeed: {
            listening: true,
            action: function(paper){
                /*  let url = 'https://w3id.org/oc/index/coci/api/v1/references/'+paper.doi
                 fetch(url).then(resp=>resp.json()).then(data => {
                     coci.parseResponse(data,paper);
                 }) */
                 console.log('Querying COCI for '+paper.doi)
                 let url = 'https://w3id.org/oc/index/coci/api/v1/citations/'+paper.doi
                 fetch(url, {headers: {
                     'Accept': 'application/sparql-results+json'
                 }}).then(resp=>resp.json()).then(data => {
                     coci.parseResponse(data,paper);
                     refreshGraphics();
                 })
            }
        },
    },
    methods:{

        parseResponse: function(response,paper){
            let ne = 0; //For bean counting only
            let cited = paper;

            for(let i=0;i<response.length;i++){
                let citer = {
                    doi: response[i].citing
                };

                citer = addPaper(citer);

                let newEdge = {
                    source: citer,
                    target: cited,
                    coci: true,
                    hide: false
                }
                addEdge(newEdge);
                ne++;//bean counting
            };   
            console.log('COCI found ' + ne + " citations")
            return(cited)
        }
    }
}) 