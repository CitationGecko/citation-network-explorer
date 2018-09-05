import { forceGraph } from 'ui/visualisations/network-view'
import { connectedList } from 'ui/visualisations/list-view'

//For forceGraph display mode toggling
document.getElementById('mode-toggle').onchange = function(){
    forceGraph.mode = (forceGraph.mode=='ref') ? 'citedBy' : 'ref';
    forceGraph.refresh()
    connectedList.print(forceGraph.sizeMetric,1,true)
} 