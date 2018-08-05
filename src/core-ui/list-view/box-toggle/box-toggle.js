//For paper details panel switching. 
document.getElementById('connected-paper-container').style.display = 'none';

d3.select('#seed-list-button').attr('class','box-toggle-on');
d3.select('#connected-list-button').attr('class','box-toggle-off');

document.getElementById('seed-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','box-toggle-on');
    d3.select('#connected-list-button').attr('class','box-toggle-off');

    document.getElementById('connected-sort-by').style.display = 'none';
    document.getElementById('add-seeds-button').style.display = 'block';

    document.getElementById('seed-paper-container').style.display = 'block';
    document.getElementById('connected-paper-container').style.display = 'none';
}

document.getElementById('connected-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','box-toggle-off');
    d3.select('#connected-list-button').attr('class','box-toggle-on');

    document.getElementById('connected-sort-by').style.display = 'block';
    document.getElementById('add-seeds-button').style.display = 'none';

    document.getElementById('connected-paper-container').style.display = 'block';
    document.getElementById('seed-paper-container').style.display = 'none';

    printConnectedList('seedsCitedBy',1);
}