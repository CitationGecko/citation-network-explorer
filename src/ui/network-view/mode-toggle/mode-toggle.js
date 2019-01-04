import { forceGraph , updateData } from 'ui/network-view'
import { connectedList } from 'ui/list-view'

//For forceGraph display mode toggling
document.getElementById('mode-toggle').onchange = function(){
    forceGraph.mode = (forceGraph.mode=='ref') ? 'citedBy' : 'ref';
    forceGraph.filterEdges();
    connectedList.print(forceGraph.sizeMetric,1,true)
} 