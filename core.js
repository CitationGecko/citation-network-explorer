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

}) 

//Attempts to add a seed paper from a MAG title search result

function addSeedFromSearchTable(id,doi){
    
        //Send query to microsoft
    
        microsoft.addSeedByID(id)
    
        //If DOI present query others as well
    
        if(doi){
            
            crossref.queryRefs(doi)
            occ.citedByDOI(doi)
        
        } 
    
    
    }

//Add Seed from DOI input

function addSeedFromDOI(doi){
    
    //Query CrossRef for DOI and references

    crossref.queryRefs(doi,true) //second parameter triggers microsoft search after title found by CrossRef

    //Query OCC for citedBy

    occ.citedByDOI(doi)

}

//Makes an existing paper into a seed paper by searching for refs and citations from all three sources

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
    
    updateInfoBox({__data__:record})

}

//For a new paper this function tries to find a match in the existing database

function matchPapers(paper,Papers){
    
        //   
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
    

//Given two paper objects that are deemed to be matching, this merges the info in the two.

function mergePapers(oldrecord,newrecord){

    for(i in newrecord){

        if(oldrecord[i]==undefined || oldrecord[i]==null ){

            oldrecord[i]=newrecord[i]
        }

    }

    oldrecord.seed = newrecord.seed ? newrecord.seed : oldrecord.seed ;//If either record is marked as a seed make the merged result a seed.

    return(oldrecord)

}

//Collection of metric functions to compute for each paper

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

//Recalculates all metrics

function updateMetrics(Papers,Edges){
                   
        for(metric in metrics){
    
            Papers.forEach(function(p){p[metric] = metrics[metric](p,Edges)})
    
        }
 
}

//Functions for updating HTML tables


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


//Removes seed status of a paper, deletes all edges to non-seeds and all now unconnected papers

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

    //Import Bibtex

    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    function handleFileSelect(evt) {
        
        var files = evt.target.files; // FileList object

        for (var i = 0, f; f = files[i]; i++) {

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = function(e){

                var papers = bibtexParse.toJSON(e.target.result)

                for(let i=0;i<papers.length;i++){

                    if(papers[i].entryTags.doi){

                        addSeedFromDOI(papers[i].entryTags.doi)
                        
                    }

                }

            }

            reader.readAsText(f)

        // files is a FileList of File objects. List some properties.
        var output = [];

            output.push('<li><strong>', escape(f.name), '</strong></li>')
            
        }
        
        document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
        
    }

   