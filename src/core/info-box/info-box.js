//Functions for paper details panel
function updateInfoBox(p){
    document.getElementById('selected-paper-box').style.display ='block';
    var paperbox = d3.select('#selected-paper-box');
    paperbox.select('.paper-title').html(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'>"+mysvg+"</a>")
    paperbox.select('.author-year').html((p.author ? p.author:'')+' '+p.year)
    paperbox.select('.add-seed').html(p.seed ? 'Delete Seed':'Make Seed')
            .on('click', function(){p.seed ? deleteSeed(p) : makeSeed(p)})
    forceGraph.selectednode = p;
}
