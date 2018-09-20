export var Papers = []  //Array of paper objects with bibliographic information for each paper 
export var Edges = [] //Array of edge objects, each is a pair of paper objects (source and target).

export var authInfo;

fetch('/services/user/getAuthInfo').then(resp=>resp.json()).then(json=>authInfo=json)

///// EVENTS

//Events are triggered when something interesting happens.

export var events = {}; //Object of events comprising an array of methods to run when the event is triggered.

//Function for defining new events.
export function defineEvent(name){
    events[name] = {};
    events[name].responses = [];
}
//Function for triggering a named event and passing the subject of the event.
export function triggerEvent(name,subject){
    for(let i=0;i<events[name].responses.length;i++){
        events[name].responses[i].call(null,subject)
    }
}
// Function for adding a response function to an event.
export function eventResponse(listening,name,action){
    if(listening){
        events[name].responses.push(action); //if module has event response methods add them to the appropriate array.
    }
}

defineEvent('newSeed'); //Event triggered when a new seed is added.
defineEvent('seedUpdate'); //Event triggered when more info is found on a seed i.e. title or doi.
defineEvent('newPaper'); //Event triggered when a new (non-seed) paper is added.
defineEvent('paperUpdate') //Event trigger when non-seed paper is updated with more info. 
defineEvent('newEdges') //Event triggered when new edges are added.
defineEvent('seedDeleted') //Event triggered when seeds are deleted.

///// ADDING AND REMOVING PAPERS

// Convert a paper to a seed paper.
export function makeSeed(papers){
    papers.forEach(p=>{
        p.seed = true;
    })
    triggerEvent('newSeed',papers)
}

// Removes seed status of a paper, deletes all edges to non-seeds and all now unconnected papers
export function deleteSeed(paper){
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
    triggerEvent('seedDeleted',paper)
};


// Add a new paper to the database
export function updatePapers(papers){
    
    let newPapers = [];
    papers = papers.map(paper=>{
        let match = matchPapers(paper,Papers)
        if(!match){
            paper.ID = Papers.length;
            Papers.push(paper);
            newPapers.push(paper);
        } else {
            paper = merge(match,paper)
            //triggerEvent('paperUpdated',paper) // Ideally only triggers if there is new info.
        }
        return(paper)
    })
    if(newPapers.length){
        triggerEvent('newPaper',newPapers)
    }
    return(papers)
}
// Add a new edge to the database.
export function updateEdges(edges){

    let newEdges = [];
    edges.forEach(edge=>{
        let matchedEdge = Edges.filter(function(e){
            return e.source == edge.source & e.target == edge.target;
        })[0];
        if(!matchedEdge){
            Edges.push(edge)
            newEdges.push(edge);
        } else {
            merge(matchedEdge,edge)
        };
    }) 
    if(newEdges.length){
        triggerEvent('newEdges',newEdges)
    }
}

//For a new paper this function tries to find a match in the existing database
export function matchPapers(paper,Papers){
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
export function merge(oldRecord,newRecord){
    for(let i in newRecord){
        oldRecord[i] = oldRecord[i] ? oldRecord[i] : newRecord[i];
    }
    oldRecord.seed = oldRecord.seed || newRecord.seed;//If either record is marked as a seed make the merged result a seed.
    return(oldRecord)
};

////  METRICS

//Collection of metric functions to compute for each paper
export var metrics = {  
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

//Recalculates all metrics
export function updateMetrics(){                   
    for(let metric in metrics){
        Papers.forEach(function(p){p[metric] = metrics[metric](p,Edges)});
    }
}

eventResponse(true,'newEdges',updateMetrics)
eventResponse(true,'seedDeleted',updateMetrics)