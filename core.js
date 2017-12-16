Array.prototype.unique = function() {
    return this.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
    });
}

var Papers = []  //Array of paper objects with bibliographic information for each paper 
var Edges = [] //Array of edge objects, each is a pair of paper objects (source and target).

var searchQuery; //Place holder for the user input field.
var titleQuery; //Place holder for the user input field.

//Update request based on doi query inputted by the user.
var doiInput = document.querySelector("#doiInput").addEventListener("input",function(){
    
    searchQuery=this.value

});

//Update request based on title query inputted by the user.
var titleInput = document.querySelector("#titleInput").addEventListener("input", function() {

    titleQuery = this.value;

}) 


//Attempts to add a seed paper based on the DOI given on input

function addSeedFromRecord(recordID){

    var record = Papers.filter(function(p){return(p.ID==recordID)})[0]
    
    if(record.MicrosoftID){
        
        microsoft.sendQuery(microsoft.citedByQuery(record.MicrosoftID));
        
        microsoft.sendQuery(microsoft.refQuery(record.MicrosoftID));
    
    }//if it has microsoft id this isn't going to add any new info about the paper

    if(record.occID){
        
        occ.citedByID(record.occID) //if it has occID this isn't going to add any new info about the paper
    
    }else if(record.DOI){
        
        occ.citedByDOI(record.DOI) //this could add Title, author, year info about the paper
    
    }

    if(record.DOI){
        
        crossref.queryRefs(record.DOI)
    
    } //this could add Title, author, year info about the paper
    

}

function addSeedFromSearchTable(id,doi){

    //Send query to microsoft

    microsoft.addSeedByID(id)

    //If DOI present query others as well

    if(doi){
        
        crossref.queryRefs(doi)
        occ.citedByDOI(doi)
    
    } 


}

function addSeedFromDOI(doi){
    
    //Query CrossRef for DOI and references

    crossref.queryRefs(doi,true)

    //Query OCC for citedBy

    occ.citedByDOI(doi)

}

function mergePapers(oldrecord,newrecord){

    for(i in newrecord){

        if(oldrecord[i]==undefined || oldrecord[i]==null ){

            oldrecord[i]=newrecord[i]
        }

    }

    oldrecord.seed = newrecord.seed ? newrecord.seed : oldrecord.seed

    return(oldrecord)

}



//Returns an array with the IDs of all Papers in database.

function currentPaperIDs(){

    {return Papers.map(function(p){return p.ID})}

};

//Returns an array with the IDs of all the seed Papers.

function currentSeedIDs(){

    return Papers.filter(function(p){return p.seed}).map(function(p){return p.ID})

};



function updateMetrics(Papers,Edges){
                   
        for(metric in metrics){
    
            Papers.forEach(function(p){p[metric] = metrics[metric](p,Edges)})
    
        }
 
}
   
function matchPapers(paper,Papers){


    let match = Papers.filter(function(p){return p.ID==paper.ID})[0];

    if(!match){

        if(paper.DOI){

            match = Papers.filter(function(p){
                
                    return (paper.DOI.toLowerCase() == (p.DOI ? p.DOI.toLowerCase() : null))
                        
            })[0];

        }

        if(!match){
            
            match = Papers.filter(function(p){return p.Title.toLowerCase()==paper.Title.toLowerCase()})[0];
            
        }
        
    }

    return(match)

}


function updateSeedTable(){
    
        var seedpapers = Papers.filter(function(p){return p.seed});
    
        $('#seedTable').DataTable().clear();
        $('#seedTable').DataTable().rows.add(seedpapers).draw();
    
    
}
    
function updateResultsTable(){

        var nonSeeds = Papers.filter(function(p){return(!p.seed)})
    
        $('#resultsTable').DataTable().clear();
        $('#resultsTable').DataTable().rows.add(nonSeeds).draw();
    
}

function updateSearchTable(results){
    
        $('#searchTable').DataTable().clear();
        $('#searchTable').DataTable().rows.add(results).draw();    
    
    }


//Removes seed status of a paper

function deleteSeed(ID){

        var paper = Papers.filter(function(p){return p.ID==ID})[0];
    
        //Set seed status to false

        paper.seed = false; 

        //Delete edges connecting the paper to non-seeds

        Edges = Edges.filter(function(e){

             return !(((e.source == paper)&&(e.target.seed==false))||((e.target==paper)&&(e.source.seed==false)))

        })

        //Remove all non-seed Papers no longer connected to anything

        Papers = Papers.filter(function(p){

            return Edges.map(function(e){return e.source}).includes(p) || Edges.map(function(e){return e.target}).includes(p)
                
        })
    
        //Edges = Edges.filter(function(e){return Papers.includes(e.source) & Papers.includes(e.target)})

        updateMetrics(Papers,Edges);
    
        updateSeedTable();
    
        updateResultsTable();
    
        updateGraph(Papers,Edges)

        //Change add Seed button back

        $('#add'+paper.MicrosoftID).html("<button  class='btn btn-info btn-sm' onclick = addSeedFromSearchTable('"+paper.MicrosoftID+"','"+paper.DOI+"')>Add</button>")
    
}


var metrics = {
    
            "citedBy": function(paper,Edges){
    
                //Count number of times cited in the edges list supplied
    
                var count = Edges.reduce(function(n, edge) {return n + (edge.target == paper)},0) //the 0 is the initial value for the reduce function and is needed to coerce booleans to number
    
                return count;
            },
    
            "references": function(paper,Edges){
    
                //Count number of times a paper cites another paper (in the edge list provided) 
    
                var count = Edges.reduce(function(n, edge) {return n + (edge.source == paper)},0)
    
                return count;
    
            },
    
            "seedsCitedBy": function(paper,Edges){
    
                //Count number of seed papers that cite the paper.
    
                var count = Edges.reduce(function(n, edge) {return n + ((edge.target == paper) && edge.source.seed)},0) //the 0 is the initial value for the reduce function and is needed to coerce booleans to number
    
                return count;
            },
    
            "seedsCited": function(paper,Edges){
    
            //Count number of seed papers the paper cites. 
    
            var count = Edges.reduce(function(n, edge) {return n + ((edge.source == paper) && edge.target.seed)},0)
    
            return count;
    
            }
    
        }        
