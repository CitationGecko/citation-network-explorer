//Functions for paper details panel
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
