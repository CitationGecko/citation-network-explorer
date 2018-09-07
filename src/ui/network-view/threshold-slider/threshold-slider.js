import { forceGraph , threshold } from 'ui/network-view'
//For forceGraph threshold slider
document.getElementById('threshold-input').oninput = function(){
    document.querySelector('#threshold-output').value = 'Minimum Connections: ' + this.value;
    forceGraph.minconnections = this.value;
    threshold(this.value,forceGraph.sizeMetric,forceGraph)
}
