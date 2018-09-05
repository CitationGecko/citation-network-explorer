import { eventResponse, Edges, Papers , updateMetrics } from "core";
import { updateInfoBox } from 'ui/visualisations/info-box'
import * as d3 from 'vendor/d3.v4.js' 

eventResponse(false,'newSeed',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})
eventResponse(false,'newEdges',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})
eventResponse(false,'seedDeleted',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    forceGraph.refresh()
})

export const forceGraph = {

    refresh: function(){                
        //Pick only edges that you want to display i.e. citedBy vs references
        switch(forceGraph.mode){     
            case 'ref':
            forceGraph.edges = Edges.filter(function(e){return(e.source.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});
            forceGraph.sizeMetric = 'seedsCitedBy';
            break;
            case 'citedBy':
            forceGraph.edges = Edges.filter(function(e){return(e.target.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});       
            forceGraph.sizeMetric = 'seedsCited';    
            break;
        }
        forceGraph.nodeIDs = forceGraph.edges.map(function(e){return(e.source)}).concat(forceGraph.edges.map(function(e){return(e.target)}));
        //Pick only Papers that are connected to something
        forceGraph.nodes = Papers.filter(function(p){
            return(forceGraph.nodeIDs.includes(p.ID)||p.seed)
        }); 
        forceGraph.circles = forceGraph.circles.data(forceGraph.nodes,function(d){return d.ID});
        forceGraph.circles.exit().remove();
        forceGraph.circles = forceGraph.circles.enter().append("circle")
                            .merge(forceGraph.circles)
                            .attr("r", function(d){return d.seed ? 10 : 5*d[forceGraph.sizeMetric]})
                            .attr("class", function(d) { 
                                if(d.seed){return 'seed-node node'} else {return 'node'}
                            })                                            
                            .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
                            .call(d3.drag()
                                .on("start", forceGraph.dragstarted)
                                .on("drag", forceGraph.dragged)
                                .on("end", forceGraph.dragended))
                            .on("dblclick",forceGraph.hideSingles)
                            .on("click",p=>forceGraph.highlightNode(p))
                            .on("mouseover",p=>updateInfoBox(p))
        forceGraph.circles.append("title").text(function(d) { return d.title; }); //Label nodes with title on hover
        forceGraph.lines = forceGraph.lines.data(forceGraph.edges, function(d) { return d.source.ID + "-" + d.target.ID; })
        forceGraph.lines.exit().remove();
        forceGraph.lines = forceGraph.lines.enter().append("line").attr("marker-end", "url(#end)").merge(forceGraph.lines);
        // Update and restart the simulation.
        forceGraph.simulation.nodes(forceGraph.nodes).on("tick", forceGraph.ticked);
        forceGraph.simulation.force("link").links(forceGraph.edges);
        forceGraph.simulation.force("collide").initialize(forceGraph.simulation.nodes());
        forceGraph.simulation.alpha(1).restart();
        forceGraph.threshold(forceGraph.minconnections);   
        forceGraph.circles.style("opacity", 1);
        forceGraph.lines.style("opacity",1);   
    },   
    dragstarted:  function(d) {
        if (!d3.event.active) forceGraph.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    },
    dragged:  function(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    },
    dragended:  function(d) {
        if (!d3.event.active) forceGraph.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    },
    hideSingles:  function(){
        let nodeid = this.__data__.ID;
        childrenids = findUniqueChildren(nodeid);
        Papers.filter(function(p){return childrenids.includes(p.ID)}).forEach(function(p){p.hide= !p.hide;});
        Edges.filter(function(e){
            let hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
            return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID);
        }).forEach(function(e){
            e.hide=true
        })
        forceGraph.circles.style("visibility", function (p) {
            return p.hide ? "hidden" : "visible" ;
        });
        forceGraph.lines.style("visibility", function(e){
            var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
            return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";
        })  
    },
    neighboring:  function(a, b) {
        return (
            forceGraph.edges.filter(function(e){
                return e.source == a | e.target == a
            }).filter(function(e){
                return e.source == b | e.target == b
            }).length
        )
    },
    highlightNode: function(d){
        forceGraph.circles.style("opacity", 1);
        forceGraph.lines.style("opacity",1);
        forceGraph.circles.style("opacity", function (o) {
            return forceGraph.neighboring(d, o) | forceGraph.neighboring(o, d) ? 1 : 0.15;
        });
        forceGraph.lines.style("opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.15;
        });
        updateInfoBox(d);
        forceGraph.circles.on('mouseover',null)
        d3.event.stopPropagation();
    },
    ticked: function() {
        
            forceGraph.lines
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
    
            forceGraph.circles
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
    },
    threshold:  function(value){
        let metric;
        switch(forceGraph.mode){
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
        forceGraph.circles.style("visibility", function (p) {
            return p.hide ? "hidden" : "visible" ;
        });
        var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        
        forceGraph.lines.style("visibility", function(e){     
            return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";  
        })
    }
}

forceGraph.minconnections = 0;
forceGraph.mode = 'ref';
forceGraph.sizeMetric = 'seedsCitedBy';
forceGraph.selectednode = null;
forceGraph.osvg =  d3.select('#force-graph')
                        .on('click',function(){
                            forceGraph.circles.style("opacity", 1);
                            forceGraph.lines.style("opacity",1);
                            forceGraph.circles.on('mouseover',p=>updateInfoBox(p))
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
                    




  