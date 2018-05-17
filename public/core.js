var Papers = []  //Array of paper objects with bibliographic information for each paper 
var Edges = [] //Array of edge objects, each is a pair of paper objects (source and target).

var doiQuery; //Place holder for the user input field.
var titleQuery; //Place holder for the user input field.

//Update request based on doi query inputted by the user.
var doiInput = document.querySelector("#doiInput").addEventListener("input",function(){
    doiQuery=this.value;
});

//Update request based on title query inputted by the user.
var titleInput = document.querySelector("#titleInput").addEventListener("input", function() {
    titleQuery = this.value;
});

function addPaper(paper){
    let match = matchPapers(paper,Papers)
    if(!match){
        paper.ID = Papers.length;
        Papers.push(paper)
    } else {
        paper = merge(match,paper)
    }
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

function makeSeed(paper){
    paper.seed = true;
    let newSeed = new Event('newSeed');
    newSeed.paper = paper;
    window.dispatchEvent(newSeed);
}

function updateSeed(paper){
    let update = new Event('seedUpdated');
    update.paper = paper;
    window.dispatchEvent(update);
}

//Attempts to add a seed paper from a MAG title search result
function addSeedFromSearchTable(id,doi){
    //Send query to microsoft
    microsoft.addSeedByID(id);
    //If DOI present query others as well
    if(doi){
        crossref.addSeed(doi);
        occ.citedByDOI(doi);
    }
};

//Add Seed from DOI input
function addSeedFromDOI(doi){
    //Query CrossRef for DOI and references
    crossref.addSeed(doi,true); //second parameter triggers microsoft search after title found by CrossRef
    //Query OCC for citedBy
    occ.citedByDOI(doi);
};

//For a new paper this function tries to find a match in the existing database
function matchPapers(paper,Papers){
    var match;
    if(paper.MicrosoftID){  
        match = Papers.filter(function(p){
            return p.ID==paper.ID
        })[0];
    };
    if(!match && paper.DOI){
        match = Papers.filter(function(p){   
            return (paper.DOI.toLowerCase() == (p.DOI ? p.DOI.toLowerCase() : null));      
        })[0];
    };
    if(!match && paper.Title && paper.Author){
        match = Papers.filter(function(p){
            if(p.Title){
                return (p.Title.toLowerCase()==paper.Title.toLowerCase()) && (paper.Author.toLowerCase()==(p.Author ? p.Author.toLowerCase() : null))
            } 
        })[0]; 
    };  
    return(match);  
};

//Given two paper/edge objects that are deemed to be matching, this merges the info in the two.
function merge(oldrecord,newrecord){
    for(i in newrecord){
        if(oldrecord[i]==undefined || oldrecord[i]==null ){
            oldrecord[i]=newrecord[i];
        }
    }
    if(newrecord.seed){
        oldrecord.seed = true;
    };//If either record is marked as a seed make the merged result a seed.
    return(oldrecord)
};

//Collection of metric functions to compute for each paper
var metrics = {  
    "citedBy": function(paper,Edges){
        //Count number of times cited in the edges list supplied
        var count = Edges.reduce(function(n, edge) {return n + (edge.target == paper)},0); //the 0 is the initial value for the reduce function and is needed to coerce booleans to number
        return count;
    },
    "references": function(paper,Edges){
        //Count number of times a paper cites another paper (in the edge list provided) 
        var count = Edges.reduce(function(n, edge) {return n + (edge.source == paper)},0);
        return count;
    },
    "seedsCitedBy": function(paper,Edges){
        //Count number of seed papers that cite the paper.
        var count = Edges.reduce(function(n, edge) {return n + ((edge.target == paper) && edge.source.seed)},0); //the 0 is the initial value for the reduce function and is needed to coerce booleans to number
        return count;
    },
    "seedsCited": function(paper,Edges){
        //Count number of seed papers the paper cites. 
        var count = Edges.reduce(function(n, edge) {return n + ((edge.source == paper) && edge.target.seed)},0);
        return count;
    }
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
    refreshGraphics();
};

function refreshGraphics(){
    updateMetrics(Papers,Edges); // update citation metrics
    updateSeedTable(); //update HTML table
    updateResultsTable(forceGraph.sizeMetric);
    forceGraph.update(Papers,Edges);
    //timeGraph.update();
};