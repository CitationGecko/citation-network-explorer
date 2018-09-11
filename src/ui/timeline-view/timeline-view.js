import { eventResponse, Edges, Papers } from "core";
import { updateInfoBox } from 'ui/info-box';
import { threshold, highlightNode} from 'ui/network-view'
import * as d3 from 'vendor/d3.v4.js' 

var listening = true;

eventResponse(listening,'seedUpdate',function(){
    timeline.refresh()
})
eventResponse(listening,'newEdges',function(){
    timeline.refresh()
})
eventResponse(listening,'paperUpdate',function(){
    timeline.refresh()
})
eventResponse(listening,'seedDeleted',function(){
    timeline.refresh()
})

export const timeline = {}

timeline.minconnections = 0;
timeline.sizeMetric = 'seedsCitedBy';
timeline.selectednode = null;       
timeline.width =  document.getElementById('timeline-view').offsetWidth; //extract the width and height attribute (the + converts to number)
timeline.height =  document.getElementById('timeline-view').offsetHeight;
timeline.svg = d3.select('#timeline-graph')
    .on('click',()=>{
        this.circles.style("opacity", 1);
        this.lines.style("opacity",1);
        this.circles.on('mouseover',p=>updateInfoBox(p))
        d3.selectAll('.paper-box').classed('selected-paper',false)
        document.getElementById('selected-paper-box').style.display ='none';
    })
timeline.lines =  timeline.svg.append("g").selectAll("line");
timeline.circles =  timeline.svg.append("g").selectAll("circle"); 
timeline.refresh = function(){                
    //Pick only edges that you want to display i.e. citedBy vs references
    this.edges = Edges.map(e=>{return {source:e.source.ID,target:e.target.ID}});
    //Pick only Papers that have a timestamp
    this.nodes = Papers.filter(function(p){return(p.timestamp)}); 

    if(!this.nodes.length){return}
    calculatePositions(this.nodes)
    // Clear all old nodes
    this.svg.selectAll('circle').remove()
    // Data bind step
    this.circles = this.circles.data(this.nodes,d=>d.ID);
    // Create new circles for new nodes
    this.circles.enter().append("circle")
        //.merge(this.circles) // Merge selection of new circles with selection of old circles
        .attr("r", d=>{return d.seed ? 10 : 5*Math.max(d.seedsCited,d.seedsCitedBy)})
        .attr("cx",d=>{
            return(5*(this.width-50)*d.yPos + 50)
        })
        .attr("cy",d=>{
            return(this.height*0.5)
        })
        .attr("class", function(d){ return (d.seed ? 'seed-node node':'node')})                                            
        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
        .on("click",p=>highlightNode(p,this))
        .on("mouseover",p=>updateInfoBox(p))
        .append("title").text(function(d) { return d.title; })  //Label nodes with title on hover        
        .style("opacity", 1);
};

function calculatePositions(nodes){
  let pos = [];
  nodes.sort(function(a, b) {
  	return a.timestamp - b.timestamp;
    })
  let minYear = nodes[0].timestamp
  let maxYear = nodes[nodes.length - 1].timestamp
  let diff = maxYear - minYear
  if(diff == 0) {
  	nodes.forEach(function(node) {
  		node.yPos = 0.5
  	})
  } else {
  	nodes.forEach(function(node) {
  		node.yPos = (node.timestamp - minYear)/diff
  	})
  }
}

  