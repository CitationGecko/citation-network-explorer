import {eventResponse,triggerEvent,addPaper,addEdge,merge} from 'core'
import {printTable} from 'ui/visualisations/table-view' 

eventResponse(true,'newSeed',async function(papers){
    
    console.log("querying crossRef for seed papers")
    let newseeds = await getMetadata(papers);
    newseeds = newseeds.map(parsePaper);
    triggerEvent('seedUpdate',paper);

    newseeds.filter(paper=>paper.references).forEach(paper=>{
        let newpapers = paper.references.map(parseReference)
        newpapers = await getMetadata(newpapers);
        newpapers.forEach(p=>{
            addEdge({
                source:paper,
                target:addPaper(parsePaper(p)),
                crossref:true
            })
        })
    })
        
        console.log(`CrossRef found ${paper.references.length} citations for ${paper.doi}`)
        triggerEvent('newEdges')
})

/* eventResponse(true,'newPaper',function(paper){
    if(paper.doi){
        console.log("querying crossRef for " +paper.doi)
        let url = `https://api.crossref.org/works/${paper.doi}`
        paper.crossref = fetch(url).then((resp)=>resp.json()).then(json=>{
            console.log("CrossRef data found for "+paper.doi)
            paper.crossref = 'Complete'
            merge(paper,parsePaper(json.message))
            triggerEvent('paperUpdate')
        })   
    };  
}) */

export function getMetadata(papers){

    let query = papers.filter((p)=>p.doi).map((p)=>`doi:${p.doi}`).join()
    let base = 'https://api.crossref.org/works?rows=1000&filter='
    return fetch(base+query).then((resp)=>resp.json()).then(json=>{
        return json.message.items
    })
}

export function titleSearch(input){

    let query = input.replace(' ','+')
    let url = `https://api.crossref.org/works?query.title=${query}`
    fetch(url).then((resp)=>resp.json()).then(json=>{
        const items = json.message.items.map(a=>{
            return {
                doi: a.DOI,
                title: a.title[0],
                author: a.author ? a.author[0].family : 'n.a',
                month: a.created['date-parts'][0][1],
                year: a.created['date-parts'][0][0],
                timestamp: a.created.timestamp,
                journal: a['container-title'] ? a['container-title'][0] : 'n.a'
            }
        })
        printTable('#title-search-table',items)
    })
}

function parsePaper(response){
    return {
            doi: response.DOI,
            title: response.title ? response.title[0] : 'unavailable',
            author: response.author ? response.author[0].family : '',
            month: response.created['date-parts'][0][1],
            year: response.created['date-parts'][0][0],
            timestamp: response.created.timestamp,
            journal: response['container-title'][0],
            citationCount: response['is-referenced-by-count'],
            references: response['reference'] ? response['reference'] : false,
            crossref: true
        };
}

function parseReference(ref){
    return {
        doi: ref.DOI ? ref.DOI : null,
        title: ref['article-title'] ? ref['article-title'] : 'unavailable',
        author: ref.author ? ref.author : null,
        year: ref.year ? ref.year : null ,
        journal: ref['journal-title'] ? ref['journal-title'] : null,
    }

}