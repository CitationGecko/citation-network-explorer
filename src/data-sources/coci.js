import {eventResponse,triggerEvent,updatePapers,updateEdges} from 'core'

eventResponse(true,'newSeed',function(papers){
    /*  let url = 'https://w3id.org/oc/index/coci/api/v1/references/'+paper.doi
     fetch(url).then(resp=>resp.json()).then(data => {
         coci.parseResponse(data,paper);
     }) */
     papers.forEach(paper=>{
        console.log(`Querying COCI for ${paper.doi}`)
        let url = `https://w3id.org/oc/index/coci/api/v1/citations/${paper.doi}`
        fetch(url, {headers: {
            'Accept': 'application/sparql-results+json'
        }}).then(resp=>resp.json()).then(data => {
           parseResponse(data,paper);
        })
     })
})

function parseResponse(response, paper){

    let newPapers = response.map(edge=>{
        return{
            doi:edge.citing
        }
    })
    newPapers = updatePapers(newPapers)

    let newEdges = newPapers.map(p=>{
        return {
            source: p,
            target: paper,
            coci: true
        }
    })
    updateEdges(newEdges)  
    console.log(`COCI found ${newEdges.length} citations`)
    return(paper)
}