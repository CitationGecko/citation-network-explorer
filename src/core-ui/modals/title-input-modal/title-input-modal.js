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

    d3.select('#more-button2').remove();
    d3.select('#title-search-container').append('div')
        .html('<button id="more-button2" class = "button1">more...</button>')
        .on('click',function(){updateTitleSearchResults(results,(pageNum+1))})
}