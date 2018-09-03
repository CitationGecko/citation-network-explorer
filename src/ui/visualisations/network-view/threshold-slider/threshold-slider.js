import { forceGraph } from 'ui/visualisations/network-view/forceGraph'
//For forceGraph threshold slider
document.getElementById('threshold-input').oninput = function(){
    document.querySelector('#threshold-output').value = 'Minimum Connections: ' + this.value;
    forceGraph.threshold(this.value)
}
