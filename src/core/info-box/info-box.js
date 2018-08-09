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
