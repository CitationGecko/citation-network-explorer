var Papers = []  //Array of paper objects with bibliographic information for each paper 
var Edges = [] //Array of edge objects, each is a pair of paper objects (source and target).

//Collection of metric functions to compute for each paper
var metrics = {  
    "localCitedBy": function(paper,Edges){
        //Count number of times cited in the edges list supplied
        return Edges.filter(e=>e.target==paper).length
    },
    "localReferences": function(paper,Edges){
        //Count number of times a paper cites another paper (in the edge list provided) 
        return Edges.filter(e=>e.source==paper).length
    },
    "seedsCitedBy": function(paper,Edges){
        //Count number of seed papers that cite the paper.
        return Edges.filter(e=>e.source.seed&e.target==paper).length;
    },
    "seedsCited": function(paper,Edges){
        //Count number of seed papers the paper cites. 
        return Edges.filter(e=>e.target.seed&e.source==paper).length;
    }
};        

//Events are triggered when something interesting happens.

var events = {}; //Object of events comprising an array of methods to run when the event is triggered.

//Function for defining new events.
defineEvent = function(name){
    events[name] = {};
    events[name].responses = [];
}
//Function for triggering a named event and passing the subject of the event.
triggerEvent = function(name,subject){
    for(let i=0;i<events[name].responses.length;i++){
        if(events[name].responses[i].listening){
            events[name].responses[i].action.call(null,subject)
        }
    }
}

defineEvent('newSeed'); //Event triggered when a new seed is added.
defineEvent('seedUpdate'); //Event triggered when more info is found on a seed i.e. title or doi.
defineEvent('newPaper'); //Event triggered when a new (non-seed) paper is added.
defineEvent('paperUpdate') //Event trigger when non-seed paper is updated with more info. 
defineEvent('newEdges') //Event triggered when new edges are added.
defineEvent('seedDeleted')


//Builds a new data source module.
function newModule(name,obj){
    window[name] = obj.methods; //add methods of module to there own namespace.
    for(event in events){
        if(obj.eventResponses[event]){ 
            events[event].responses.push(obj.eventResponses[event]); //if module has event response methods add them to the appropriate array.
        }
    } 
}

function makeSeed(paper){
    paper.seed = true;
    triggerEvent('newSeed',paper)
}

function addPaper(paper,asSeed){

    let match = matchPapers(paper,Papers)
    
    if(!match){
        paper.ID = Papers.length;
        Papers.push(paper)
        triggerEvent('newPaper',paper)
    } else {
        paper = merge(match,paper)
        //triggerEvent('paperUpdated',paper) // Ideally only triggers if there is new info.
    }

    if(asSeed&!paper.seed){makeSeed(paper)}

    return(paper)
}

function addEdge(newEdge){
    let edge = Edges.filter(function(e){
        return e.source == newEdge.source & e.target == newEdge.target;
    })
    if(edge.length==0){
        Edges.push(newEdge);
    } else {
        merge(edge[0],newEdge)
    };
}

//For a new paper this function tries to find a match in the existing database
function matchPapers(paper,Papers){
    var match;
    if(paper.microsoftID){  
        match = Papers.filter(function(p){
            return p.microsoftID==paper.microsoftID
        })[0];
    };
    if(!match && paper.doi){
        match = Papers.filter(function(p){   
            return (paper.doi.toLowerCase() == (p.doi ? p.doi.toLowerCase() : null));      
        })[0];
    };
    if(!match && paper.title && paper.author){
        match = Papers.filter(function(p){
            if(p.title){
                return (p.title.toLowerCase()==paper.title.toLowerCase()) && (paper.author.toLowerCase()==(p.author ? p.author.toLowerCase() : null))
            } 
        })[0]; 
    };  
    return(match);  
};

//Given two paper/edge objects that are deemed to be matching, this merges the info in the two.
function merge(oldrecord,newrecord){
    for(i in newrecord){
        if(oldrecord[i]==undefined || oldrecord[i]==null || oldrecord[i]==0){
            oldrecord[i]=newrecord[i];
        }
    }
    if(newrecord.seed){
        oldrecord.seed = true;
    };//If either record is marked as a seed make the merged result a seed.
    return(oldrecord)
};

//Recalculates all metrics
function updateMetrics(Papers,Edges){                   
    for(metric in metrics){
        Papers.forEach(function(p){p[metric] = metrics[metric](p,Edges)});
    }
}

//Removes seed status of a paper, deletes all edges to non-seeds and all now unconnected papers
function deleteSeed(paper){
    //Set seed status to false
    paper.seed = false; 
    //Delete edges connecting the paper to non-seeds
    Edges = Edges.filter(function(e){
        return !(((e.source == paper)&&(e.target.seed==false))||((e.target==paper)&&(e.source.seed==false)))
    })
    //Remove all non-seed Papers no longer connected to anything
    Papers = Papers.filter(function(p){
        return (Edges.map(function(e){return e.source}).includes(p) || Edges.map(function(e){return e.target}).includes(p));         
    })
    triggerEvent('seedDeleted')
};


newModule('coci', {
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
                    triggerEvent('newEdges')
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
newModule('gecko', {

    eventResponses:{
        newSeed: {
            listenting: false,
            action:  function(paper){
                let url = '/api/v1/getMockResponse?doi='+paper.doi
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
                    doi: response.doi,
                    title: response.title[0],
                    author: response.author[0].family,
                    month: response.created['date-parts'][0][1],
                    year: response.created['date-parts'][0][0],
                    timestamp: response.created.timestamp,
                    journal: response['container-title'][0],
                    citationCount: response['is-referenced-by-count'],
                    references: response['reference'] ? response['reference'] : false,
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

newModule('microsoft', {
    eventResponses:{
        newSeed: {
            listening: false,
            action: function(paper){  
                if(paper.microsoftID){
                    microsoft.sendCitedByQuery(paper.microsoftID);       
                    microsoft.sendRefQuery(paper.microsoftID);
                } else if(paper.title){
                microsoft.titleMatchSearch(paper);
                }
            }
        },
        seedUpdate: {
            listening: false,
            action: function(paper){
                if(!paper.microsoftID){
                    microsoft.titleMatchSearch(paper);
                }
            }
        },
    },
    methods:{
        apiRequest: function(request,callback){ //Send a generic request to the MAG api
            var url = '/api/v1/query/microsoft/search';
            fetch(url,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(request.toSend)
                })
                .then((res)=>res.json())
                .then(callback)
            /* xmlhttp = new XMLHttpRequest();
            //If no API key is given the request will be sent to an intermediate server which inserts the API and forwards it on to Microsoft.
            var url = '/api/v1/query/microsoft/search';
            xmlhttp.open('POST', url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    callback(this.responseText)
                } else if(this.readyState==4){
                    if(MicrosoftStatus == 'good'){
                        MicrosoftStatus = 'bad';
                        alert('The Microsoft Academic Graph is unavailable at this time. This will result in reduced coverage, especially in cited-by mode, and search by title won\'t work. Sorry for the inconvenience, please try again later.')}
                        console.log(this.responseText)
                    }
            }
            xmlhttp.send(JSON.stringify(request.toSend)); */
        },
        refQuery: function(id){ //Query for MAG API to get references of a paper from the Microsoft ID.
            return {          
                "type": "ref",
                "toSend": {
                    "path": "/paper/ReferenceIDs/cited",
                    "paper": {
                        "type": "Paper",
                        "id": [id.toString()],
                        "select":["OriginalTitle","DOI","PublishYear"]
                    },
                    "cited": {
                        "select":["OriginalTitle" , "DOI","PublishYear"],
                        "return": {
                        "type": "Paper",
                        }
                    }
                }
            }
        },
        citedByQuery: function(id){//Query for MAG API to get papers citing a paper with a specific Microsoft ID.
            return {          
                "type": "citedBy",
                "toSend": {
                    "path": "/paper/CitationIDs/citer",
                    "paper": {
                        "type": "Paper",
                        "id": [id.toString()],
                        "select":["OriginalTitle","DOI","PublishYear"]
                    },
                    "citer": {
                        "select":["OriginalTitle" , "DOI",,"PublishYear"],
                        "return": {
                        "type": "Paper",
                        }
                    }
                }
            }
        },
        titleQuery: function(title){//Query for MAG API that searches for papers with titles containing the string given by 'title'
            return {           
                "type": "title",
                "toSend": {
                    "path": "/paper/",
                    "paper": {
                        "type": "Paper",
                        "NormalizedTitle": title,
                        "select":["OriginalTitle","PublishYear","DOI"]
                    }
            
                }
            }
        },
        titleSearch: function(query){
            var request = microsoft.titleQuery(query)
            console.log('MAG: querying title "'+query+'"')
            microsoft.apiRequest(request,function(response){
                console.log('MAG: results found for title "'+query+'"')
                updateTitleSearchResults(response.Results.map(function(p){return p[0];}),1,true)
            })
        },
        titleMatchSearch: function(paper){
            var request = microsoft.titleQuery(paper.title)
            console.log('MAG: querying title "'+paper.title+'"')       
            microsoft.apiRequest(request,function(response){
                console.log('MAG: results found for title "'+paper.title+'"')
                //check for doi matches
                var match = response.Results.filter(function(p){
                    if(p[0].doi){
                        return (p[0].doi.toLowerCase()==paper.doi.toLowerCase())
                    } else {
                        return(false)
                    }
                })[0];
                if(match){
                    var ID = response.Results[0][0].CellID;               
                    microsoft.sendCitedByQuery(ID)
                    microsoft.sendRefQuery(ID)
                } else {
                    /* alert("Papers with similar titles found, please choose from table...")
                    updateTitleSearchResults(response.Results.map(function(p){return p[0];}))
                */
                }
            })
        },
        sendRefQuery: function(ID){
            console.log('MAG: querying refs for ID '+ID)
            var request = microsoft.refQuery(ID)
            microsoft.apiRequest(request,function(response){
                    if(response.Results.length){
                        console.log('MAG: founds refs for ID '+ID)
                        microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                        triggerEvent('newEdges')
                    } else {
                        console.log("No connecting papers found");
                    }
            })
        },
        sendCitedByQuery: function(ID){
            console.log('MAG: querying cited-by for ID '+ID)
            var request = microsoft.citedByQuery(ID)
            microsoft.apiRequest(request,function(response){
                    if(response.Results.length){
                        console.log('MAG: founds cited-by for ID '+ID)
                        microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                        triggerEvent('newEdges')
                    } else {
                        console.log("No connecting papers found");
                    }
            })
        },
        parsePaper: function(paper){
            return {           
                title: paper.OriginalTitle,
                author: null,
                doi: paper.DOI,
                year: paper.PublishYear,
                microsoftID: paper.CellID,
            }
        },
        parseResponse: function(response,request){
            var ne = 0; //For bean counting only
            var seedpaper = response.Results[0][0];
            seedpaper = microsoft.parsePaper(seedpaper)
            seedpaper = addPaper(seedpaper,true);
            for (let i=0; i < response.Results.length; i++) {
                var connection = response.Results[i][1];
                connection = microsoft.parsePaper(connection)
                connection = addPaper(connection);
                //Define the edges depending on request
                var edges =[];
                switch(request.type){
                    case 'ref':
                        edges = [{"source": seedpaper, "target": connection, "MAG":true, hide: false}];
                        break;
                    case 'citedBy':
                        edges = [{"source": connection, "target": seedpaper,"MAG":true, hide: false}];
                        break;    
                }
                edges.forEach(function(edge){   
                    addEdge(edge);
                    ne++; //bean counting
                });
            }
            console.log('MAG found '  + ne + " citations")
        },
    }
})
newModule('oaDOI', {
    
  eventResponses: {
    newPaper: {
      listenting: false,
      action: function(paper){
        oaDOI.getAccessStatus(paper)
      }
    }
  },
  methods:{
    getAccessStatus: function(paper) {
        if (paper.doi) {
          var url = '/api/v1/query/oadoi?doi=' + paper.doi;
          
          fetch(url).then(resp=>resp.json()).then(json=>{
            paper.OA = JSON.parse(this.responseText).data.is_oa;
          })
        }
      },

    getAllAccessStatus: function() {
        Papers.forEach(oaDOI.getAccessStatus);
    }
  }
})

/* 
document.getElementById('colorByOA').onclick = function(){
    node.attr("fill", function(d) { 
        if(d.OA==true){
            return 'green'
        }else if(d.OA==false){
            return 'red'
        }else{
            return 'grey'
        }    
    })                
} */
newModule('occ', {

    eventResponses:{
        newSeed: {
            listening: false,
            action: function(paper){
                if(paper.occID){
                    occ.getPapersCitingID(paper.occID)
                } else if(paper.doi){
                    occ.getPapersCitingdoi(paper.doi)
                }
            }
        },
        seedUpdate: {
            listening: false,
            action:function(paper){
                if(!paper.occID & paper.doi){
                    occ.citedBydoi(paper.doi)
                }
            }
        }
    },
    methods:{

        parseResponse: function(responseString, queryType){
            var response = JSON.parse(responseString);
            var ne = 0; //For bean counting only
            var newEdges = response.results.bindings;
            for(let i=0;i<newEdges.length;i++){
                let edge = newEdges[i]
                var cited = {
                    author: null,
                    doi: edge.citedDOI ? edge.citedDOI.value : null,
                    title: edge.citedTitle ? edge.citedTitle.value : null,
                    year: edge.citedYear ? edge.citedYear.value : null,
                    occID: edge.citedID.value
                }
                cited = addPaper(cited,(queryType=='refs'));
                if(!edge.citingID){break}
                var citer = {
                    Author: null,
                    doi: edge.citingDOI ? edge.citingDOI.value : null,
                    title: edge.citingTitle ? edge.citingTitle.value : null,
                    year: edge.citingYear ? edge.citingYear.value : null,
                    occID: edge.citingID.value
                }
                citer = addPaper(citer,(queryType=='citedBy'));
                let newEdge = {
                    source: citer,
                    target: cited,
                    occ: true,
                    hide: false
                };
                addEdge(newEdge);ne++
            }
            console.log('OCC found ' + ne + " citations")
        },
        sendQuery: function(query){

            let url = 'http://opencitations.net/sparql?query=' + escape(query.string);
            fetch(url,{
                headers: {
                    'Accept': 'application/sparql-results+json'
                }
            }).then((resp) => resp.text()).then((data)=> {
                occ.parseResponse(data, query.type);
                triggerEvent('newEdges')
            });

            console.log('querying OCC...');
        },
        getPapersCitedByDOI: function(doi){
            var query ={};
            query.type = 'refs'
            query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
            PREFIX dcterms: <http://purl.org/dc/terms/>\n\
            PREFIX datacite: <http://purl.org/spar/datacite/>\n\
            PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
            PREFIX biro: <http://purl.org/spar/biro/>\n\
            PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
            PREFIX c4o: <http://purl.org/spar/c4o/>\n\
            PREFIX fabio: <http://purl.org/spar/fabio/>\n\
            SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
                BIND ("'+doi+'" AS ?citingDOI)\n\
                ?citingID datacite:hasIdentifier [\n\
                            datacite:usesIdentifierScheme datacite:doi ;\n\
                            literal:hasLiteralValue ?citingDOI].\n\
                ?citingID cito:cites ?citedID.\n\
                OPTIONAL{\n\
                ?citedID datacite:hasIdentifier [\n\
                            datacite:usesIdentifierScheme datacite:doi ;\n\
                            literal:hasLiteralValue ?citedDOI].\n\
                ?citedID dcterms:title ?citedTitle.\n\
                ?citedID fabio:hasPublicationYear ?citedYear.\n\
                ?citingID dcterms:title ?citingTitle.\n\
                ?citingID fabio:hasPublicationYear ?citingYear.}\n\
            }';
            occ.sendQuery(query, occ.callback);
        },
        getPapersCitedByID: function(id){ //Queries OCC SPARQL to find references of the ID specified. Updates Papers and Edges data structures.
            var query = {};
            query.type = 'refs'
            query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
            PREFIX dcterms: <http://purl.org/dc/terms/>\n\
            PREFIX datacite: <http://purl.org/spar/datacite/>\n\
            PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
            PREFIX biro: <http://purl.org/spar/biro/>\n\
            PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
            PREFIX c4o: <http://purl.org/spar/c4o/>\n\
            PREFIX fabio: <http://purl.org/spar/fabio/>\n\
            SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
                BIND (<'+id+'> AS ?citingID)\n\
                ?citingID cito:cites ?citedID\n\
                OPTIONAL {\n\
                ?citedID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citedDOI].\n\
                    ?citedID dcterms:title ?citedTitle.\n\
                    ?citedID fabio:hasPublicationYear ?citedYear.}\n\
                OPTIONAL { \n\
                ?citingID dcterms:title ?citingTitle.\n\
                ?citingID fabio:hasPublicationYear ?citingYear.\n\
                    ?citingID datacite:hasIdentifier [\n\
                        datacite:usesIdentifierScheme datacite:doi ;\n\
                        literal:hasLiteralValue ?citingDOI ].} \n\
            }';
            occ.sendQuery(query, occ.callback);
        },
        getPapersCitingID: function(id){
            var query = {};
            query.type = 'citedBy'
            query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
            PREFIX dcterms: <http://purl.org/dc/terms/>\n\
            PREFIX datacite: <http://purl.org/spar/datacite/>\n\
            PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
            PREFIX biro: <http://purl.org/spar/biro/>\n\
            PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
            PREFIX c4o: <http://purl.org/spar/c4o/>\n\
            PREFIX fabio: <http://purl.org/spar/fabio/>\n\
            SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
                BIND (<'+id+'> AS ?citedID)\n\
                OPTIONAL {\n\
                ?citedID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citedDOI].\n\
                    ?citedID dcterms:title ?citedTitle.\n\
                    ?citedID fabio:hasPublicationYear ?citedYear.}\n\
                OPTIONAL { \n\
                ?citingID cito:cites ?citedID.\n\
                ?citingID dcterms:title ?citingTitle.\n\
                ?citingID fabio:hasPublicationYear ?citingYear.\n\
                    ?citingID datacite:hasIdentifier [\n\
                        datacite:usesIdentifierScheme datacite:doi ;\n\
                        literal:hasLiteralValue ?citingDOI ].} \n\
            }';
            occ.sendQuery(query, occ.callback);
        },
        getPapersCitingDOI: function(doi){
            var query ={};
            query.type = 'refs'
            query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
            PREFIX dcterms: <http://purl.org/dc/terms/>\n\
            PREFIX datacite: <http://purl.org/spar/datacite/>\n\
            PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
            PREFIX biro: <http://purl.org/spar/biro/>\n\
            PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
            PREFIX c4o: <http://purl.org/spar/c4o/>\n\
            PREFIX fabio: <http://purl.org/spar/fabio/>\n\
            SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
                BIND ("'+doi+'" AS ?citedDOI)\n\
                ?citedID datacite:hasIdentifier [\n\
                        datacite:usesIdentifierScheme datacite:doi ;\n\
                        literal:hasLiteralValue ?citedDOI].\n\
                OPTIONAL {\n\
                ?citedID dcterms:title ?citedTitle.\n\
                ?citedID fabio:hasPublicationYear ?citedYear.}\n\
                OPTIONAL { \n\
                ?citingID cito:cites ?citedID.\n\
                ?citingID dcterms:title ?citingTitle.\n\
                ?citingID fabio:hasPublicationYear ?citingYear.\n\
                    ?citingID datacite:hasIdentifier [\n\
                        datacite:usesIdentifierScheme datacite:doi ;\n\
                        literal:hasLiteralValue ?citingDOI ].} \n\
            }';
            occ.sendQuery(query, occ.callback);
        }
    }
})
//Functions for paper details panel
function updateInfoBox(selected){
    p = selected.__data__;
    document.getElementById('selected-paper-box').style.display ='block';
    var paperbox = d3.select('#selected-paper-box');
    paperbox.select('.paper-title').html(p.title)
    paperbox.select('.author-year').html((p.author ? p.author:'')+' '+p.year)
    paperbox.select('.doi-link').html(p.doi ? ("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>"): '')
    paperbox.select('.add-seed').html(p.seed ? 'Delete Seed':'Make Seed')
            .on('click', function(){p.seed ? deleteSeed(p) : makeSeed(p)})
    forceGraph.selectednode = p;
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}
//For paper details panel switching. 
document.getElementById('connected-list').style.display = 'none';

d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-on');
d3.select('#connected-list-button').attr('class','side-bar-button box-toggle-off');

document.getElementById('seed-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-on');
    d3.select('#connected-list-button').attr('class','side-bar-button box-toggle-off');

    document.getElementById('connected-list').style.display = 'none';
    document.getElementById('seed-list').style.display = 'block';
}

document.getElementById('connected-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-off');
    d3.select('#connected-list-button').attr('class','side-bar-button box-toggle-on');

    document.getElementById('connected-list').style.display = 'block';
    document.getElementById('seed-list').style.display = 'none';

    connectedList.print('seedsCitedBy',1);
}
newModule('forceGraph',{
    eventResponses:{
        newEdges:{
            listening:true,
            action: function(){
                updateMetrics(Papers,Edges); // update citation metrics
                forceGraph.refresh()
            }
        }
    },
    methods:{
        refresh: function(){                
            //Pick only edges that you want to display i.e. citedBy vs references
            switch(forceGraph.mode){     
                case 'ref':
                forceGraph.edges = Edges.filter(function(e){return(e.source.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});
                forceGraph.sizeMetric = 'seedsCitedBy';
                break;
                case 'citedBy':
                forceGraph.edges = Edges.filter(function(e){return(e.target.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});       
                forceGraph.sizeMetric = 'seedsCited';    
                break;
            }
            //Pick only Papers that are connected to something
            forceGraph.nodes = Papers.filter(function(p){
                let ids = forceGraph.edges.map(function(e){return(e.source)}).concat(forceGraph.edges.map(function(e){return(e.target)}));
                return(ids.includes(p.ID))
            }); 
            forceGraph.circles = forceGraph.circles.data(forceGraph.nodes,function(d){return d.ID});
            forceGraph.circles.exit().remove();
            forceGraph.circles = forceGraph.circles.enter().append("circle")
                                .merge(forceGraph.circles)
                                .attr("r", function(d){return d.seed ? 7 : 5*d[forceGraph.sizeMetric]})
                                .attr("class", function(d) { 
                                    if(d.seed){return 'seed-node node'} else {return 'node'}
                                })                                            
                                .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
                                .call(d3.drag()
                                    .on("start", forceGraph.dragstarted)
                                    .on("drag", forceGraph.dragged)
                                    .on("end", forceGraph.dragended))
                                .on("dblclick",forceGraph.hideSingles)
                                .on("click",forceGraph.highlightNode)
                                .on("mouseover",function(){updateInfoBox(this)})
            forceGraph.circles.append("title").text(function(d) { return d.title; }); //Label nodes with title on hover
            forceGraph.lines = forceGraph.lines.data(forceGraph.edges, function(d) { return d.source.ID + "-" + d.target.ID; })
            forceGraph.lines.exit().remove();
            forceGraph.lines = forceGraph.lines.enter().append("line").attr("marker-end", "url(#end)").merge(forceGraph.lines);
            // Update and restart the simulation.
            forceGraph.simulation.nodes(forceGraph.nodes).on("tick", forceGraph.ticked);
            forceGraph.simulation.force("link").links(forceGraph.edges);
            forceGraph.simulation.force("collide").initialize(forceGraph.simulation.nodes());
            forceGraph.simulation.alpha(1).restart();
            forceGraph.threshold(forceGraph.minconnections);   
            forceGraph.circles.style("opacity", 1);
            forceGraph.lines.style("opacity",1);   
        },   
        dragstarted:  function(d) {
            if (!d3.event.active) forceGraph.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },
        dragged:  function(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        },
        dragended:  function(d) {
            if (!d3.event.active) forceGraph.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        },
        hideSingles:  function(){
            let nodeid = this.__data__.ID;
            childrenids = findUniqueChildren(nodeid);
            Papers.filter(function(p){return childrenids.includes(p.ID)}).forEach(function(p){p.hide= !p.hide;});
            Edges.filter(function(e){
                let hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
                return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID);
            }).forEach(function(e){
                e.hide=true
            })
            forceGraph.circles.style("visibility", function (p) {
                return p.hide ? "hidden" : "visible" ;
            });
            forceGraph.lines.style("visibility", function(e){
                var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
                return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";
            })  
        },
        neighboring:  function(a, b) {
            return (
                forceGraph.edges.filter(function(e){
                    return e.source == a | e.target == a
                }).filter(function(e){
                    return e.source == b | e.target == b
                }).length
            )
        },
        highlightNode: function(){
            d = d3.select(this).node().__data__;
            forceGraph.circles.style("opacity", 1);
            forceGraph.lines.style("opacity",1);
            forceGraph.circles.style("opacity", function (o) {
                return forceGraph.neighboring(d, o) | forceGraph.neighboring(o, d) ? 1 : 0.15;
            });
            forceGraph.lines.style("opacity", function(o) {
                return o.source === d || o.target === d ? 1 : 0.15;
            });
            updateInfoBox(this);
            forceGraph.circles.on('mouseover',null)
            d3.event.stopPropagation();
        },
        ticked: function() {
            
                forceGraph.lines
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
        
                forceGraph.circles
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
        },
        threshold:  function(value){
            let metric;
            switch(forceGraph.mode){
                case 'ref':
                    metric = 'seedsCitedBy';
                    break;
                case 'citedBy':
                    metric = 'seedsCited';
                    break;
            } 
            Papers.forEach(function(p){
                p.hide = (p[metric]>=value || p.seed) ? false : true ;
            });
            forceGraph.circles.style("visibility", function (p) {
                return p.hide ? "hidden" : "visible" ;
            });
            var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        
            forceGraph.lines.style("visibility", function(e){     
                return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";  
            })
        }
    }
})

forceGraph.minconnections = 0;
forceGraph.mode = 'ref';
forceGraph.sizeMetric = 'seedsCitedBy';
forceGraph.selectednode = null;
forceGraph.osvg =  d3.select('#force-graph')
                        .on('click',function(){
                            forceGraph.circles.style("opacity", 1);
                            forceGraph.lines.style("opacity",1);
                            forceGraph.circles.on('mouseover',function(){updateInfoBox(this)})
                        })
                        .call(d3.zoom().on("zoom", function () {forceGraph.svg.attr("transform", d3.event.transform)}))//enable zoom by scrolling
                        .on("dblclick.zoom", null);//disable double click zooming
forceGraph.width =  document.getElementById('network-view').offsetWidth; //extract the width and height attribute (the + converts to number)
forceGraph.height =  document.getElementById('network-view').offsetHeight;
forceGraph.svg =  forceGraph.osvg.append('g');
forceGraph.lines =  forceGraph.svg.append("g").attr("class", "link").selectAll("line");
forceGraph.circles =  forceGraph.svg.append("g").attr("class", "node").selectAll("circle");
forceGraph.simulation =  d3.forceSimulation()
                            .force("link", d3.forceLink().id(function(d){return d.ID;}))
                            .force("charge", d3.forceManyBody().strength(-100))
                            .force("center", d3.forceCenter(forceGraph.width / 2, forceGraph.height / 2))
                            .force("xattract",d3.forceX())
                            .force("yattract",d3.forceY())
                            .force("collide",d3.forceCollide().radius(function(d){return (d.seed ? 7 : 5*d[forceGraph.sizeMetric])}));
                    




  
newModule('seedList',{
    eventResponses:{
        seedUpdate:{
            listening: true,
            action: function(){
                seedList.refresh()
            }
        },
        newSeed:{
            listening: true,
            action: function(){
                seedList.refresh()
            }
        }
    },
    methods: {
        refresh: function(){
            var seedpapers = Papers.filter(function(p){return p.seed});
            var paperbox = d3.select('#seed-paper-container').selectAll('.outer-paper-box')
                            .data(seedpapers,function(d){return d.ID})
            paperbox.exit().remove()
            var oldpapers = d3.select('#seed-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
            oldpapers.select('.paper-title').html(function(p){
                return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'><img class='open-icon'src='images/icons/open.svg'></a>")
            })
            oldpapers.select('.metric').html(function(p){
                return(p[metric]?p[metric]:'0')
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' '+p.year}else{return(p.year)}
            })
        
            paperbox = paperbox.enter()
                .append('div')
                .attr('class','outer-paper-box panel')
            paperbox = paperbox.append('div')
                .attr('class','inner-paper-box panel')
                .on('click',forceGraph.highlightNode)
            paperbox.append('p').attr('class','paper-title')
                .html(function(p){
                    return(p.title)
                })
            paperbox.append('p').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' '+p.year}else{return(p.year)}
                })     
        }
    }
})

newModule('connectedList',{
    eventResponses:{
        newEdges:{
            listening: true,
            action: function(){
                connectedList.print(forceGraph.sizeMetric,1)
            }
        },
        paperUpdate:{
            listening: true,
            action: function(){
                connectedList.print(forceGraph.sizeMetric,1)
            }
        }
    },
    methods:{
       
        print: function(metric,pageNum,replot){
            let pageSize = 100;
            let nonSeeds = Papers.filter(function(p){return(!p.seed)}).sort((a,b)=>b[metric]-a[metric]).slice(0,pageNum*pageSize)
            //Select all non-seeds and sort by metric.
            //Clear old table
            if(replot){
                d3.select('#connected-paper-container').selectAll('.outer-paper-box').remove();
            }
            let paperboxes = d3.select('#connected-paper-container').selectAll('.outer-paper-box')
                             .data(nonSeeds,function(d){return d.ID});
                             //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
            paperboxes.exit().remove();
        
            oldpapers = d3.select('#connected-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
            oldpapers.select('.paper-title').html(function(p){
                return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'><img class='open-icon'src='images/icons/open.svg'></a>")
            })
            oldpapers.select('.metric').html(function(p){
                return(p[metric]?p[metric]:'0')
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' '+p.year}else{return(p.year)}
            })
          
            newpapers = paperboxes.enter()
                .append('div')
                .attr('class','outer-paper-box panel')
            newpapers = newpapers.append('div')
                .attr('class','inner-paper-box panel')
                .on('click',forceGraph.highlightNode)
            newpapers.append('p').attr('class','paper-title')
                .html(function(p){
                    return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'><img class='open-icon'src='images/icons/open.svg'></a>")
                })
            newpapers.append('p').attr('class','metric')
                .html(function(p){
                    return(p[metric]?p[metric]:'')
                })
            newpapers.append('p').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' '+p.year}else{return(p.year)}
                })
           
            d3.select('#more-button').remove();
            d3.select('#connected-paper-container').append('div')
                .html('<button id="more-button" class = "button1">more...</button>')
                .attr('onclick','connectedList.print("'+metric+'",'+(pageNum+1)+')')   
        }
    }
})
function plotTimeGraph(){

    document.getElementById('timelineView').style.display = 'block';
    document.getElementById('network-view').style.display = 'none';
    timeGraph.update();
}

timeGraph = {}

timeGraph.osvg = d3.select('#timelineGraph')
                    .call(d3.zoom().on("zoom", function () {
                            let transform = d3.event.transform;
                            transform.k = 1;
                            transform.x = 0;
                            timeGraph.osvg.attr("transform", transform)
                        })
                    )//enable zoom by scrolling
                     .on("dblclick.zoom", null);//disable double click zooming; // Select svg
timeGraph.svg =  timeGraph.osvg.append('g');
timeGraph.width =  document.getElementById('network-view').offsetWidth; //extract the width and height attribute (the + converts to number)
timeGraph.height =  document.getElementById('network-view').offsetHeight;
timeGraph.nodes = Papers;
timeGraph.circles = timeGraph.svg.append("g").attr("class", "node").selectAll("circle");
timeGraph.update = function(){
    let years = timeGraph.nodes.map(p=>p.Year).filter(p=>p>1900);
    let maxYear = Math.max(...years);
    let minYear = Math.min(...years);
    //timeGraph.osvg.attr('height',(maxYear-minYear+(6-1)/12)*70);
    let y = d3.scaleLinear()
        .domain([minYear,maxYear])
        .range([0,maxYear*70])
    let yAxis = d3.axisLeft(y);
    timeGraph.nodes.sort((a,b)=>(a.year-b.year))
    timeGraph.circles = timeGraph.circles.data(timeGraph.nodes,function(d){return d.ID})
    timeGraph.circles.exit().remove();
    timeGraph.circles = timeGraph.circles.enter().append("circle")
        //.merge(timeGraph.circles)
        .attr("r", function(d){
            return d.seed ? 7 : 5*Math.max(d.seedsCited,d.seedsCitedBy);
        })
        .attr('cx',function(d){
            let year = (d.year? d.year:maxyear);
            let month = (d.month ? d.month:6);
            let a = timeGraph.width*month/12;
            let dir = year%2;
            return (a*dir + (timeGraph.width-a)*(1-dir))
        })
        .attr('cy',function(d){
            let year = (d.year? d.year:maxYear);
            let month = (d.month ? d.month:6);
            return (maxYear-year+(6-month)/12)*70;
        })
        .attr("class", function(d) { 
            if(d.seed){return 'seed-node node'} else {return 'node'};
        })                                            
        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
        .on("click",timeGraph.highlightNode)
        .on("mouseover",function(){updateInfoBox(this)})
    timeGraph.circles.append("title").text(function(d) { return d.year + ' ' + d.month; }); //Label nodes with title on hover
}





     
    document.getElementById("add-by-doi").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('doi-input-modal').style.display = "block";
    }
    document.getElementById("search-by-title").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('title-input-modal').style.display = "block";
    }
    document.getElementById("upload-bibtex").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('upload-bibtex-modal').style.display = "block";
    } 

   
var doiQuery; //Place holder for the user input field.

//Update request based on doi query inputted by the user.
var doiInput = document.querySelector("#doi-input").addEventListener("input",function(){
    doiQuery=this.value;
});

document.getElementById("doi-input").onkeydown = function(event){
    if (event.keyCode == 13){   
        addPaper({doi:doiQuery},true)
        document.getElementById('doi-input-loader').style.display = 'inline-block';
    }
}
/* //For help modal
document.getElementById('help-modal').style.display = "block";
document.getElementById('help-button').onclick = function(){
    document.getElementById('help-modal').style.display = "block";
} */
var titleQuery; //Place holder for the user input field.
//Update request based on title query inputted by the user.
var titleInput = document.querySelector("#title-input").addEventListener("input", function() {
    titleQuery = this.value;
});

document.getElementById("title-input").onkeydown = function(event){
    if (event.keyCode == 13){
        microsoft.titleSearch(titleQuery)
    }
}

function updateTitleSearchResults(results,pageNum,replot){
    
    let pageSize=50;
    papers = results.slice(0,pageNum*pageSize);
 
    document.getElementById('title-search-container').style.display = "block";
    document.getElementById('title-search-results').style.width = '70%';

    if(replot){
        d3.select('#title-search-container').selectAll('.outer-paper-box').remove();
    }
    let paperboxes = d3.select('#title-search-container').selectAll('.outer-paper-box')
                     .data(papers,function(d){return d.CellID});
                     //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
    newpapers = paperboxes.enter()
        .append('div')
        .attr('class','outer-paper-box panel')
    newpapers.append('button').attr('class','delete-seed')
        .html('<i class="fa fa-plus" color="green" aria-hidden="true"></i>')
        .on('click',function(p){
            let newSeed = {
                title: p.OriginalTitle,
                author: null,
                doi: p.DOI,
                year: p.PublishYear,
                microsoftID: p.CellID,
            };
            addPaper(newSeed,true);
        })
    newpapers = newpapers.append('div')
        .attr('class','inner-paper-box panel')
    newpapers.append('p').attr('class','paper-title')
        .html(function(p){
            return(p.OriginalTitle)
        })
    newpapers.append('p').attr('class','author-year')
        .html(function(p){
            if(p.author) {return p.author+' '+p.year}else{return(p.year)}
        })
    newpapers.append('p').attr('class','doi-link')
        .html(function(p){
            return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
        })

    d3.select('#more-button2').remove();
    d3.select('#title-search-container').append('div')
        .html('<button id="more-button2" class = "button1">more...</button>')
        .on('click',function(){updateTitleSearchResults(results,(pageNum+1))})
}
var bibtex = {
    //Importing user uploaded Bibtex
    importBibTex: function(evt) {
        let files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = function(e){
                var papers = bibtexParse.toJSON(e.target.result);
                if(papers.filter(function(p){
                    return p.entryTags.doi;
                }).length==0){
                    alert("We couldn't find any DOIs in the BibTex you uploaded please check your export settings");
                };
                for(let i=0;i<papers.length;i++){
                    if(papers[i].entryTags.doi){
                        let newSeed = {doi: papers[i].entryTags.doi}
                        addPaper(newSeed,true);
                    }; 
                };
            };
            reader.readAsText(f);       
        };
        document.getElementById('upload-bibtex-modal').style.display = "none"; //Hide modal once file selected
    },
    //Importing Example BibTex
    importExampleBibTex: function(){
        let url = window.location.href+'examples/exampleBibTex.bib'
        fetch(url).then((resp) => resp.text()).then((data)=> {
                var papers = bibtexParse.toJSON(data);
                for(let i=0;i<papers.length;i++){
                    let newSeed = {doi: papers[i].entryTags.doi}
                    addPaper(newSeed,true);
                };
                document.getElementById('upload-bibtex-modal').style.display = "none";
            }
        )
    }
}

document.getElementById('files').addEventListener('change', bibtex.importBibTex, false);

document.getElementById('demo-button').onclick = function(){
    bibtex.importExampleBibTex()
}
d3.select('#add-seeds-modal').select('div').append('button').attr('id','add-by-zotero')
    .html("<img id='zotero-square' src='images/zotero/zotero2.png'>")

document.getElementById("add-by-zotero").onclick = function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('zotero-modal').style.display = "block";
    if(!zotero.status){
        zotero.getCollections();
    }
}

var modal = d3.select('body').append('div').attr('id','zotero-modal').attr('class','modal')
    .append('div').attr('class','modal-content')
    
    modal.append('div').html("<img id='zotero-logo' src='images/zotero/zotero-logo.png'>");
    modal.append('svg').attr('id','zotero-collections');


var zotero = {
    status: false,
    getCollections: function(){

    if (!ZOTERO_USER_ID || !ZOTERO_USER_API_KEY) {
        ZOTERO_USER_ID = prompt('Enter Zotero User ID');
        ZOTERO_USER_API_KEY = prompt('Enter Zotero User API Key');
    }

        let url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections?limit=100';

        fetch(url,
            {
                headers:{'Zotero-API-Key': ZOTERO_USER_API_KEY}
            }
        ).then(resp => {
            console.log('response from Zotero!');
            zotero.totalCollections = resp.headers.get('Total-Results')
            resp.json().then(json=>{
                zotero.status = true;
                zotero.collections = json;

                if(zotero.totalCollections==zotero.collections.length){
                    zotero.displayCollections(zotero.collections);
                }

                for(let i=0;i<Math.ceil(zotero.totalCollections/100);i++){
    
                    let url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections?limit=100' + '&start=' + (100 * (i+1));
                    fetch(url,{headers:{'Zotero-API-Key': ZOTERO_USER_API_KEY}})
                        .then(resp=>resp.json())
                        .then(json => {
                            zotero.collections = zotero.collections.concat(json);
                            if(i==(Math.ceil(zotero.totalCollections/100)-1)){
                                zotero.displayCollections(zotero.collections);
                            }
                        }
                    )                    
                }
            })
        })
    },

    parseCollectionTree: function(collections){

        var tree=[];
        var parents = collections.filter(function(c){
            return(!c.data.parentCollection)
        })

        let getChildren = function(collections,ID){

            let children = collections.filter(function(c){
                return(c.data.parentCollection==ID)
            }).map(function(c){
                return({
                    name: c.data.name,
                    children: getChildren(collections,c.key),
                    key: c.key
                })
            })

            return(children)

        }

        for(var i=0;i<parents.length;i++){
            tree.push({
                name: parents[i].data.name,
                children: getChildren(collections,parents[i].key),
                key: parents[i].key
            })
        }

        return({
            name:'All Collections',
            children: tree
        })


    },

    displayCollections: function(collections){

        var margin = {top: 30, right: 20, bottom: 30, left: 20},
            width = d3.select('#zotero-modal').select('.modal-content').node().getBoundingClientRect().width,
            barHeight = 40,
            barWidth = (width - margin.left - margin.right) * 0.7;

        var i = 0,
            duration = 400,
            root;

        var svg = d3.select("#zotero-collections")
            .attr("width", width) // + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        root = d3.hierarchy(zotero.parseCollectionTree(collections));
        root.x0 = 0;
        root.y0 = 0;

        root.children.forEach(collapse);

        update(root);

        function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse)
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
        }
        function click(d) {
            /* if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d); */
            zotero.collection = d.data.key
            zotero.getItems(zotero.collection)
            document.getElementById('zotero-modal').style.display = "none";
          }

          function color(d) {
            return d._children ? "rgb(255, 199, 0)" : d.children ? "rgb(155, 155, 155)" : "rgb(250, 250, 250)";
          }

        function update(source) {

            // Compute the flattened node list.
            var nodes = root.descendants();

            var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

            d3.select("#zotero-collections").transition()
                .duration(duration)
                .attr("height", height);

            d3.select(self.frameElement).transition()
                .duration(duration)
                .style("height", height + "px");

            // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
            var index = -1;
            root.eachBefore(function(n) {
              n.x = ++index * barHeight;
              n.y = n.depth * 20;
            });

            // Update the nodes…
            var node = svg.selectAll(".zotero-folder")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

            var nodeEnter = node.enter().append("g")
                .attr("class", "zotero-folder")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .style("opacity", 0);

            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", barHeight)
                .attr("width", 0.9*barWidth)
                .style("fill", color)
                .on("click", click);

            nodeEnter.append('rect')
                .attr("y", -barHeight / 2)
                .attr("x", 0.9*barWidth)
                .attr("height", barHeight)
                .attr("width", 0.1*barWidth)
                .style("fill", 'rgb(208, 208, 208)')
                .on('click',collapse)


            nodeEnter.append("text")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text(function(d) { return d.data.name; });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1)
              .select("rect")
                .style("fill", color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .style("opacity", 0)
                .remove();

            // Stash the old positions for transition.
            root.each(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }
    },

    getItems: function(collectionID){
        url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections/' + collectionID + '/items/top';
        
        fetch(url,{
            headers: {'Zotero-API-Key':ZOTERO_USER_API_KEY}
        }).then(resp=>resp.json()).then(items=>{
            for(let i=0;i<items.length;i++){
                item = items[i];
                //item.data.title;
                //item.meta.creatorSummary;
                //item.meta.parsedDate;
                addPaper({doi:item.data.DOI},true);
            }
        })
    },

    addItem: function(paper,collection){
        let url = 'https://api.zotero.org/items/new?itemType=journalArticle'
        fetch(url).then(resp=>resp.json()).then(template=>{

            template.DOI = paper.doi
            template.title = paper.title
            template.publicationTitle = paper.journal
            template.date = paper.year
            template.creators[0].lastName = paper.author
            template.collections = [zotero.collection]

            let endpoint = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/items'
            fetch(endpoint,{
                method: 'post',
                headers:{'Zotero-API-Key': ZOTERO_USER_API_KEY},
                body:JSON.stringify([template])
            }).then(resp=>resp.json()).then(r=>console.log(r))  
        }) 
    }
}
//For forceGraph display mode toggling
document.getElementById('mode-toggle').onchange = function(){
    forceGraph.mode = (forceGraph.mode=='ref') ? 'citedBy' : 'ref';
    forceGraph.refresh()
    document.getElementById('connected-sort-by').getElementsByTagName('select')[0].value = (forceGraph.mode=='ref') ? 'seedsCitedBy' : 'seedsCited';
    connectedList.print(forceGraph.sizeMetric,1,true)
} 

//For forceGraph threshold slider
document.getElementById('threshold-input').oninput = function(){
    document.querySelector('#threshold-output').value = 'Minimum Connections: ' + this.value;
    forceGraph.threshold(this.value)
}


document.getElementById('connected-sort-by').style.display = 'none'
document.getElementById('connected-sort-by').getElementsByTagName('select')[0].onchange = function(){
    let metric = this.value;
    papers = d3.select('#connected-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
    papers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    connectedList.print(metric,1,true)    
}
// When the user clicks on the button, open the modal
document.getElementById("add-seeds-button").onclick = function() {
    document.getElementById('add-seeds-modal').style.display = "block";
}