newDataModule('gecko', {

    eventResponses:{
        newSeed: {
            listenting: false,
            action:  function(paper){
                let url = '/api/v1/getMockResponse?doi='+paper.DOI
                fetch(url).then(resp=>resp.json()).then(json => {
                    gecko.parseResponse(json.data,paper);
                })
            }
        }
    },
    methods:{
        parseResponse: function(data,paper){
            
            for(let i=0;i<data.papers.length;i++){

                paper = {
                    DOI: response.DOI,
                    Title: response.title[0],
                    Author: response.author[0].family,
                    Month: response.created['date-parts'][0][1],
                    Year: response.created['date-parts'][0][0],
                    Timestamp: response.created.timestamp,
                    Journal: response['container-title'][0],
                    CitationCount: response['is-referenced-by-count'],
                    References: response['reference'] ? response['reference'] : false,
                }

                addPaper(data.papers[i]); 
            };

            for(let i=0;i<data.edges.length;i++){
                
                let edge = data.edges[i];
                edge.source = Papers.filter(p=>p.geckoID==edge.source);
                edge.target = Papers.filter(p=>p.geckoID==edge.target);
                addEdge(edge); 
            };

            console.log('Gecko found ' + data.edges.length + " citations")
            return(cited)
        }
    }
})