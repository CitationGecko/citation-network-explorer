//For connected papers tabs

document.getElementById('tableTab').onclick = function(){

    document.getElementById('networkView').style.display='none';
    document.getElementById('tableView').style.display='block';

}

document.getElementById('networkTab').onclick = function(){

    document.getElementById('tableView').style.display='none';
    document.getElementById('networkView').style.display='block';

}

//For threshold slider

    document.getElementById('thresholdInput').oninput = function(){

        document.querySelector('#thresholdOutput').value = this.value;

        threshold(this.value)


    }


//For Seed Papers Side bar

    document.getElementById('collapseBar').onclick = hideSideBar;

    function hideSideBar(){

        document.getElementById('seedPapers').style.display='none';

        var icon = document.getElementById('collapse-seeds-icon');

        icon.classList.remove('fa-chevron-left');

        icon.classList.add('fa-chevron-right');

        document.getElementById('collapseBar').onclick = showSideBar;

    }

    function showSideBar(){

        document.getElementById('seedPapers').style.display='block';

        var icon = document.getElementById('collapse-seeds-icon');

        icon.classList.remove('fa-chevron-right');

        icon.classList.add('fa-chevron-left');

        document.getElementById('collapseBar').onclick = hideSideBar;

    }

//For addSeedModals

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    } 

    // When the user clicks on the button, open the modal
    document.getElementById("addSeeds").onclick = function() {

        document.getElementById('addSeedModal').style.display = "block";
    }
   
    document.getElementById("addbyDOI").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('doiInputModal').style.display = "block";
    }

    document.getElementById("doiInput").onkeydown = function(){
        
        if (event.keyCode == 13){addSeedFromDOI(doiQuery)}

    }

    document.getElementById("searchByTitle").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('titleInputModal').style.display = "block";
    }

    document.getElementById("titleInput").onkeydown = function(){
        
        if (event.keyCode == 13){
            microsoft.titleSearch(titleQuery)
        }
        
    }

    document.getElementById("uploadBibTex").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('uploadBibTexModal').style.display = "block";
    }

//Functions for updating HTML tables


function updateSeedTable(){    
    
    var seedpapers = Papers.filter(function(p){return p.seed});

    var paperbox = d3.select('#seed-paper-container').selectAll('.seed-paper-box')
                    .data(seedpapers)
                    .enter()
                    .append('div')
                    .attr('class','seed-paper-box panel')
        
    paperbox.append('button').attr('class','delete-seed')
            .html('<i class="fa fa-times" color="white" aria-hidden="true"></i>')
    
    paperbox.append('p').attr('class','paper-title')
            .html(function(p){
                return(p.Title)
            })

    paperbox.append('p').attr('class','author-year')
            .html(function(p){
                if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
            })
    
    paperbox.append('p').attr('class','doi-link')
            .html(function(p){
                return("<a href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
            })
}
 
function updateResultsTable(){

     var nonSeeds = Papers.filter(function(p){return(!p.seed)})
 
     $('#resultsTable').DataTable().clear();
     $('#resultsTable').DataTable().rows.add(nonSeeds).draw();
 
}

function updateSearchTable(results){


     $('#searchTable').DataTable().clear();
     $('#searchTable').DataTable().rows.add(results).draw();   
     
     document.getElementById('table-container').style.display = "block";

     document.getElementById('titleSearchResults').style.width = '70%';
     document.getElementById('searchTable').style.width = '100%';


 
 }

 $(document).ready(function() {


    $('#searchTable').DataTable({
        data: [],
        columns: [
        { "data": "OriginalTitle" },
        { "data": "PublishYear" },
        { "data": "DOI","render": function(data,type,row){return "<a href='https://doi.org/"+data+"'>"+data+"</a>"}},
        { "data": "CellID","render": function(data,type,row){
            
            return "<button  class='btn btn-info btn-sm' onclick = addSeedFromSearchTable('"+data+"','"+row.DOI+"')>Add</button>"
            
            }
        
        }

    ]});

    $('#resultsTable').DataTable( {
        data: [],
        columns: [
            { "data": "Title" },
            { "data": "Author"},
            { "data": "Year" },
            { "data": "DOI","render": function(data,type,row){return "<a target='_blank' href='https://doi.org/"+data+"'>"+data+"</a>"}},
            { "data": "seedsCited"},
            { "data": "seedsCitedBy"},
            { "data": "ID","render": function(data,type,row){
                
                if(row.seed){return "<button class='btn btn-success btn-sm'><span class='glyphicon glyphicon-ok'></span></button>"}else{
                    return "<button class='btn btn-info btn-sm' onclick = addSeedFromRecord('"+data+"')>Add</button>"}
                }      
            }
        ]
} );

})

 