//For forceGraph display mode toggling
document.getElementById('mode-toggle').onchange = function(){
    forceGraph.mode = (forceGraph.mode=='ref') ? 'citedBy' : 'ref';
    forceGraph.refresh()
    document.getElementById('connected-sort-by').getElementsByTagName('select')[0].value = (forceGraph.mode=='ref') ? 'seedsCitedBy' : 'seedsCited';
    connectedList.print(forceGraph.sizeMetric,1,true)
} 