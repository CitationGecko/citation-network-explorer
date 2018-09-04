import * as d3 from 'vendor/d3.v4.js'
import {connectedList} from 'ui/visualisations/list-view'

document.getElementById('connected-sort-by').style.display = 'none'
document.getElementById('connected-sort-by').getElementsByTagName('select')[0].onchange = function(){
    let metric = this.value;
    papers = d3.select('#connected-paper-container').selectAll('.paper-box')
    papers.select('.metric').html(function(p){
        return(p[metric]?p[metric]:'0')
    })
    connectedList.print(metric,1,true)    
}