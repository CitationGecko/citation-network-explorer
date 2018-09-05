/* import { eventResponse, Edges, Papers , updateMetrics } from "core";
import { updateInfoBox } from 'ui/visualisations/info-box'
import * as d3 from 'vendor/d3.v4.js' 

var listening = false;

eventResponse(listening,'seedUpdate',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})
eventResponse(listening,'newEdges',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})
eventResponse(listening,'seedDeleted',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})

var width =  document.getElementById('timeline-view').offsetWidth; //extract the width and height attribute (the + converts to number)
var height =  document.getElementById('timeline-view').offsetHeight;
const svg = d3.select('#timeline-graph')
    .on('click',function(){
        circles.style("opacity", 1);
        lines.style("opacity",1);
        circles.on('mouseover',p=>updateInfoBox(p))
        d3.selectAll('.paper-box').classed('selected-paper',false)
        document.getElementById('selected-paper-box').style.display ='none';
    })

var lines =  svg.append("g").selectAll("line");
var circles =  svg.append("g").selectAll("circle");

export const timeline = {}

timeline.minconnections = 0;
timeline.sizeMetric = 'seedsCitedBy';
timeline.selectednode = null;        
timeline.refresh = function(){                
    //Pick only edges that you want to display i.e. citedBy vs references
    timeline.edges = Edges.map(e=>{return {source:e.source.ID,target:e.target.ID}});
    //Pick only Papers that have a timestamp
    timeline.nodes = Papers.filter(function(p){
        return(p.timestamp)
    }); 
    calculatePositions(nodes)
    // Data bind step
    circles = svg.selectAll('circles').data(nodes,function(d){return d.ID});
    // Remove nodes that no longer exist.
    circles.exit().remove();
    // Update radius
    circles.attr("r", function(d){return d.seed ? 10 : 5*Math.max(d.seedsCited,d.seedsCitedBy)})
    // Update x position
    circles.attr("cx",function(d){return(width*0.5)})
    // Update y position
    circles.attr("cy",function(d){return(5*(height-50)*d.yPos + 50)})
    // Create new circles for new nodes
    circles.enter().append("circle")
        .merge(circles)
        .attr("r", function(d){return d.seed ? 10 : 5*Math.max(d.seedsCited,d.seedsCitedBy)})
        .attr("cx",function(d){
            return(5*(width-50)*d.yPos + 50)
        })
        .attr("cy",function(d){
            return(height*0.5)
        })
        .attr("class", function(d){ return (d.seed ? 'seed-node node':'node')})                                            
        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
        .on("click",p=>highlightNode(p))
        .on("mouseover",p=>updateInfoBox(p))
        .append("title").text(function(d) { return d.title; });  //Label nodes with title on hover        

    circles.style("opacity", 1);
};

function neighboring(a, b) {
    return (
        edges.filter(function(e){
            return e.source == a | e.target == a
        }).filter(function(e){
            return e.source == b | e.target == b
        }).length
    )
};

function highlightNode(d){
    circles.style("opacity", 1);
    lines.style("opacity",1);
    circles.style("opacity", function (o) {
        return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
    });
    lines.style("opacity", function(o) {
        return o.source === d || o.target === d ? 1 : 0.15;
    });
    updateInfoBox(d);
    circles.on('mouseover',null)
    d3.event.stopPropagation();
};

function threshold(value){
    let metric;
    switch(mode){
        case 'ref':
            metric = 'seedsCitedBy';
            break;
        case 'citedBy':
            metric = 'seedsCited';
            break;
    } 
    Papers.forEach(function(p){
        p.hide = (p[metric]>=value || p.seed) ? false : true ;
    });
    circles.style("visibility", function (p) {
        return p.hide ? "hidden" : "visible" ;
    });
    var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        
    lines.style("visibility", function(e){     
        return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";  
    })
}

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

   */