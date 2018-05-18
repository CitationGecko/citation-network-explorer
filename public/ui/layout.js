//For help modal
document.getElementById('helpModal').style.display = "block";
document.getElementById('helpButton').onclick = function(){
    document.getElementById('helpModal').style.display = "block";
}
//For DEMO button
document.getElementById('demoButton').onclick = function(){
    bibtex.importExampleBibTex()
}

//For paper details panel switching. 
d3.select('#seedTableButton').attr('class','table-toggle-on');
d3.select('#connectedTableButton').attr('class','table-toggle-off');

document.getElementById('connected-paper-container').style.display = 'none';

document.getElementById('seedTableButton').onclick = function(){
    d3.select('#seedTableButton').attr('class','table-toggle-on');
    d3.select('#connectedTableButton').attr('class','table-toggle-off');

    document.getElementById('connectedControls').style.display = 'none';
    document.getElementById('addSeeds').style.display = 'block';

    document.getElementById('seed-paper-container').style.display = 'block';
    document.getElementById('connected-paper-container').style.display = 'none';
}

document.getElementById('connectedTableButton').onclick = function(){
    d3.select('#seedTableButton').attr('class','table-toggle-off');
    d3.select('#connectedTableButton').attr('class','table-toggle-on');

    document.getElementById('connectedControls').style.display = 'block';
    document.getElementById('addSeeds').style.display = 'none';

    document.getElementById('connected-paper-container').style.display = 'block';
    document.getElementById('seed-paper-container').style.display = 'none';

    plotResultsTable('seedsCitedBy',1);
}

function plotTimeGraph(){

    document.getElementById('timelineView').style.display = 'block';
    document.getElementById('networkView').style.display = 'none';
    timeGraph.update();
}

//For forceGraph display mode toggling
document.getElementById('toggleMode').onchange = function(){
    forceGraph.mode = (forceGraph.mode=='ref') ? 'citedBy' : 'ref';
    forceGraph.update(Papers,Edges)
    document.getElementById('connectedControls').getElementsByTagName('select')[0].value = (forceGraph.mode=='ref') ? 'seedsCitedBy' : 'seedsCited';
    plotResultsTable(forceGraph.sizeMetric,1,true)
} 
//For forceGraph threshold slider
document.getElementById('thresholdInput').oninput = function(){
    document.querySelector('#thresholdOutput').value = 'Minimum Connections: ' + this.value;
    forceGraph.threshold(this.value)
}
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
//For toggling paper details panel
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
    document.getElementById("addbyZotero").onclick = function() {
        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('zoteroModal').style.display = "block";
        zotero.getCollections();
    }
    document.getElementById("addbyDOI").onclick = function() {
        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('doiInputModal').style.display = "block";
    }

    document.getElementById("doiInput").onkeydown = function(event){
        if (event.keyCode == 13){   
            makeSeed(addPaper({DOI:doiQuery}))
            document.getElementById('doiInputLoader').style.display = 'inline-block';
        }
    }

    document.getElementById("searchByTitle").onclick = function() {
        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('titleInputModal').style.display = "block";
    }

    document.getElementById("titleInput").onkeydown = function(event){
        if (event.keyCode == 13){
            microsoft.titleSearch(titleQuery)
        }
    }

    document.getElementById("uploadBibTex").onclick = function() {
        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('uploadBibTexModal').style.display = "block";
    }

//Functions for paper details panel

function updateSeedTable(){    
    var seedpapers = Papers.filter(function(p){return p.seed});
    var paperbox = d3.select('#seed-paper-container').selectAll('.outer-paper-box')
                    .data(seedpapers,function(d){return d.ID})

    paperbox.exit().remove()

    oldpapers = d3.select('#seed-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
    oldpapers.select('.paper-title').html(function(p){
        return(p.Title)
    })
    oldpapers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    oldpapers.select('.author-year').html(function(p){
        if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
    })
    oldpapers.select('.doi-link').html(function(p){
        return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
    })

    paperbox = paperbox.enter()
        .append('div')
        .attr('class','outer-paper-box panel')
    paperbox.append('button').attr('class','delete-seed')
        .html('<i class="fa fa-times" color="red" aria-hidden="true"></i>')
        .on('click',function(p){deleteSeed(p)})
    paperbox = paperbox.append('div')
        .attr('class','inner-paper-box panel')
        .on('click',forceGraph.highlightNode)
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
            return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
        })
};

document.getElementById('connectedControls').getElementsByTagName('select')[0].onchange = function(){
    let metric = this.value;
    papers = d3.select('#connected-paper-container').selectAll('tr').select('td').select('.inner-paper-box')
    papers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    plotResultsTable(metric,1,true)    
}

function updateResultsTable(metric){
    
    var nonSeeds = Papers.filter(function(p){return(!p.seed)})
    paperbox = d3.select('#connected-paper-container').selectAll('tr')
                     .data(nonSeeds,function(d){return d.ID});
                     //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
    paperbox.exit().remove();
    papers = d3.select('#connected-paper-container').selectAll('tr').select('td').select('.inner-paper-box')
    papers.select('.paper-title').html(function(p){
        return(p.Title)
    })
    papers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    papers.select('.author-year').html(function(p){
        if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
    })
    papers.select('.doi-link').html(function(p){
        return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
    })
}

function sortResultsTable(metric){
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById('connected-paper-container');
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.getElementsByTagName("tr");
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 0; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].__data__[metric];
        y = rows[i + 1].__data__[metric];
        // Check if the two rows should switch place:
        if (x < y) {
          // I so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}

function plotResultsTable(metric,pageNum,replot){
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
        return(p.Title)
    })
    oldpapers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    oldpapers.select('.author-year').html(function(p){
        if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
    })
    oldpapers.select('.doi-link').html(function(p){
        return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
    })
    newpapers = paperboxes.enter()
        .append('div')
        .attr('class','outer-paper-box panel')
    newpapers.append('button').attr('class','delete-seed')
        .html('<i class="fa fa-plus" color="green" aria-hidden="true"></i>')
        .on('click',function(p){
            triggerEvent('newSeed',p)
        })
    newpapers = newpapers.append('div')
        .attr('class','inner-paper-box panel')
        .on('click',forceGraph.highlightNode)
    newpapers.append('p').attr('class','paper-title')
        .html(function(p){
            return(p.Title)
        })
    newpapers.append('p').attr('class','metric')
        .html(function(p){
            return(p[metric]?p[metric]:'')
        })
    newpapers.append('p').attr('class','author-year')
        .html(function(p){
            if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
        })
    newpapers.append('p').attr('class','doi-link')
        .html(function(p){
            return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
        })

    d3.select('#moreButton').remove();
    d3.select('#connected-paper-container').append('div')
        .html('<button id="moreButton" class = "button1">more...</button>')
        .attr('onclick','plotResultsTable("'+metric+'",'+(pageNum+1)+')')
   
}

function updateSearchTable(results,pageNum,replot){
    
    let pageSize=50;
    papers = results.slice(0,pageNum*pageSize);
 
    document.getElementById('title-search-container').style.display = "block";
    document.getElementById('titleSearchResults').style.width = '70%';

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
                Title: p.OriginalTitle,
                Author: null,
                DOI: p.DOI,
                Year: p.PublishYear,
                MicrosoftID: p.CellID,
                seed: true
            };
            addPaper(newSeed);
            triggerEvent('newSeed',newSeed);      
        })
    newpapers = newpapers.append('div')
        .attr('class','inner-paper-box panel')
    newpapers.append('p').attr('class','paper-title')
        .html(function(p){
            return(p.OriginalTitle)
        })
    newpapers.append('p').attr('class','author-year')
        .html(function(p){
            if(p.Author) {return p.Author+' '+p.Year}else{return(p.Year)}
        })
    newpapers.append('p').attr('class','doi-link')
        .html(function(p){
            return("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>")
        })

    d3.select('#moreButton2').remove();
    d3.select('#title-search-container').append('div')
        .html('<button id="moreButton2" class = "button1">more...</button>')
        .on('click',function(){updateSearchTable(results,(pageNum+1))})
}

function updateInfoBox(selected){
    p = selected.__data__;
    document.getElementById('selected-paper-box').style.display ='block';
    var paperbox = d3.select('#selected-paper-box');
    paperbox.select('.paper-title').html(p.Title)
    paperbox.select('.author-year').html((p.Author ? p.Author:'')+' '+p.Year)
    paperbox.select('.doi-link').html(p.DOI ? ("<a target='_blank' href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>"): '')
    paperbox.select('.add-seed').html(p.seed ? 'Delete Seed':'Make Seed')
            .on('click', function(){p.seed ? deleteSeed(p) : triggerEvent('newSeed',p)})
    forceGraph.selectednode = p;
}


 
