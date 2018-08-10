//For paper details panel switching. 
document.getElementById('connected-list').style.display = 'none';

d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-on');

document.getElementById('seed-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-on');
    d3.select('#connected-list-button').attr('class','side-bar-button box-toggle-off');

    document.getElementById('connected-list').style.display = 'none';
    document.getElementById('seed-list').style.display = 'block';
}

document.getElementById('connected-list-button').onclick = function(){
    d3.select('#seed-list-button').attr('class','side-bar-button box-toggle-off');
    d3.select('#connected-list-button').attr('class','side-bar-button box-toggle-on');

    document.getElementById('connected-list').style.display = 'block';
    document.getElementById('seed-list').style.display = 'none';

    connectedList.print('seedsCitedBy',1,true);
}