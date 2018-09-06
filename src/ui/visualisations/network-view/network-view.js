import { eventResponse, Edges, Papers , updateMetrics } from "core";
import { surfacePaperBox } from 'ui/visualisations/list-view'
import { updateInfoBox } from 'ui/visualisations/info-box'
import * as d3 from 'vendor/d3.v4.js' 

var listening = true;

eventResponse(listening,'newSeed',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})
eventResponse(listening,'newEdges',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})
eventResponse(listening,'seedDeleted',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})

export const forceGraph = {};

forceGraph.minconnections = 0;
forceGraph.mode = 'ref';
forceGraph.sizeMetric = 'seedsCitedBy';
forceGraph.selectednode = null;
forceGraph.osvg =  d3.select('#force-graph')
    .on('click',function(){
        forceGraph.circles.style("opacity", 1);
        forceGraph.lines.style("opacity",1);
        forceGraph.circles.on('mouseover',p=>{surfacePaperBox(p)})
        d3.selectAll('.paper-box').classed('selected-paper',false)
        document.getElementById('selected-paper-box').style.display ='none';
    })
    .call(d3.zoom().on("zoom", function () {forceGraph.svg.attr("transform", d3.event.transform)}))//enable zoom by scrolling
    .on("dblclick.zoom", null);//disable double click zooming
forceGraph.width =  document.getElementById('network-view').offsetWidth; //extract the width and height attribute (the + converts to number)
forceGraph.height =  document.getElementById('network-view').offsetHeight;
forceGraph.svg =  forceGraph.osvg.append('g');
forceGraph.lines =  forceGraph.svg.append("g").attr("class", "link").selectAll("line");
forceGraph.circles =  forceGraph.svg.append("g").attr("class", "node").selectAll("circle");
forceGraph.simulation =  d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d){return d.ID;}))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(forceGraph.width / 2, forceGraph.height / 2))
    .force("xattract",d3.forceX())
    .force("yattract",d3.forceY())
    .force("collide",d3.forceCollide().radius(function(d){return (d.seed ? 7 : 5*d[forceGraph.sizeMetric])}));

forceGraph.refresh = function(){                
    //Pick only edges that you want to display i.e. citedBy vs references
    switch(this.mode){     
        case 'ref':
        this.edges = Edges.filter(function(e){return(e.source.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});
        this.sizeMetric = 'seedsCitedBy';
        break;
        case 'citedBy':
        this.edges = Edges.filter(function(e){return(e.target.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});       
        this.sizeMetric = 'seedsCited';    
        break;
    }
    this.nodeIDs = this.edges.map(function(e){return(e.source)}).concat(this.edges.map(function(e){return(e.target)}));
    //Pick only Papers that are connected to something
    this.nodes = Papers.filter((p)=>{
        return(this.nodeIDs.includes(p.ID)||p.seed)
    }); 
    this.circles = this.circles.data(this.nodes,d=>d.ID);
    this.circles.exit().remove();
    this.circles = this.circles.enter().append("circle")
        .merge(this.circles)
        .attr("r", d=>{return d.seed ? 10 : 5*d[this.sizeMetric]})
        .attr("class", function(d) { 
            if(d.seed){return 'seed-node node'} else {return 'node'}
        })                                            
        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
        .call(d3.drag()
            .on("start", (d)=>dragstarted(d,this.simulation))
            .on("drag", (d)=>dragged(d))
            .on("end", (d)=>dragended(d,this.simulation)))
        .on("dblclick",p=>(p)) // Display abstract?
        .on("click",p=>{
            surfacePaperBox(p)
            highlightNode(p,this)
        })
        .on("mouseover",p=>{
            surfacePaperBox(p)
            //updateInfoBox(p)
        })

    this.circles.append("title").text(function(d) { return d.title; }); //Label nodes with title on hover

    this.lines = this.lines.data(this.edges, function(d) { return d.source.ID + "-" + d.target.ID; })
    this.lines.exit().remove();
    this.lines = this.lines.enter().append("line").attr("marker-end", "url(#end)").merge(this.lines);
    // Update and restart the simulation.
    this.simulation.nodes(this.nodes).on("tick", ()=>tick(this));
    this.simulation.force("link").links(this.edges);
    this.simulation.force("collide").initialize(this.simulation.nodes());
    this.simulation.alpha(1).restart();   
    this.circles.style("opacity", 1);
    this.lines.style("opacity",1);
    threshold(this.minconnections,this.sizeMetric,this);   
}  

function dragstarted(d,simulation) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
};

function dragended(d,simulation) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
};

export function neighboring(a, b, edges) {
    return (
        edges.filter(function(e){
            return e.source == a | e.target == a
        }).filter(function(e){
            return e.source == b | e.target == b
        }).length
    )
};

export function highlightNode(d,graph){
    graph.circles.style("opacity", 1);
    graph.lines.style("opacity",1);
    graph.circles.style("opacity", function (o) {
        return neighboring(d, o,graph.edges) | neighboring(o, d,graph.edges) ? 1 : 0.15;
    });
    graph.lines.style("opacity", function(o) {
        return o.source === d || o.target === d ? 1 : 0.15;
    });
    graph.circles.on('mouseover',null)
    d3.event.stopPropagation();
};

function tick(graph){
    graph.lines
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    graph.circles
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
};

export function threshold(value,metric,graph){
    Papers.forEach(function(p){
        p.hide = (p[metric]>=value || p.seed) ? false : true ;
    });
    graph.circles.style("visibility", function (p) {
        return p.hide ? "hidden" : "visible" ;
    });
    var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        
    graph.lines.style("visibility", function(e){     
        return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";  
    })
}





  