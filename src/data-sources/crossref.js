import {eventResponse,triggerEvent,updatePapers,updateEdges,merge} from 'core'
import {printTable} from 'ui/table-view' 

eventResponse(true,'newSeed',async function(papers){
    
    console.log("querying crossRef for seed papers")
    let newSeeds = await getMetadata(papers.filter(p=>!p.crossref));
    newSeeds = newSeeds.map(parsePaper);
    newSeeds = updatePapers(newSeeds);
    triggerEvent('seedUpdate',newSeeds);

    papers.filter(paper=>paper.references).forEach(async (paper)=>{
        console.log(`CrossRef found ${paper.references.length} citations for ${paper.doi}`)
        let newPapers = paper.references.map(parseReference)
        //newPapers = updatePapers(newPapers);
        newPapers = await getMetadata(newPapers);
        newPapers = newPapers.map(parsePaper);
        newPapers = updatePapers(newPapers);
        let newEdges = newPapers.map(p=>{
            return {
                source:paper,
                target:p,
                crossref:true
            }
        })
        updateEdges(newEdges);
        triggerEvent('paperUpdate',newPapers);
    })
    
})

eventResponse(true,'newPaper',function(papers){
    
    papers = papers.filter(p=>!p.crossref && !p.seed);
    if(papers.length){
        getMetadata(papers).then(items=>{
            console.log(`CrossRef data found`) 
            updatePapers(items.map(parsePaper))
            triggerEvent('paperUpdate')
        })  
    }
})

export function getMetadata(papers){

    let dois =  papers.filter((p)=>p.doi)
    if(dois.length){
        let query = dois.map((p)=>`doi:${p.doi}`).join()
        let base = 'https://api.crossref.org/works?rows=1000&filter='
        return fetch(base+query).then((resp)=>resp.json()).then(json=>{
            return json.message.items
        })
    } else {
        return []
    }
}

export function crossrefSearch(input){

    let query = input.replace(' ','+')
    let url = `https://api.crossref.org/works?query=${query}`
    return fetch(url).then((resp)=>resp.json()).then(json=>{
        const items = json.message.items.map(parsePaper)
        printTable('#title-search-table',items)
    })
}

function parsePaper(response){

    let date = response['published-print'] ? response['published-print'] : response['created']

    return {
            doi: response.DOI,
            title: response.title ? response.title[0] : 'unavailable',
            author: response.author ? response.author[0].family : '',
            month: date['date-parts'][0][1],
            year: date['date-parts'][0][0],
            timestamp: new Date(date['date-time']),
            journal: response['container-title'] ? response['container-title'][0] : '',
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