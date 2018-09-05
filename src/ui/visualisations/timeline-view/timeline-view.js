import { eventResponse, Edges, Papers , updateMetrics } from "core";
import { updateInfoBox } from 'ui/visualisations/info-box'
import * as d3 from 'vendor/d3.v4.js' 

eventResponse(true,'newSeed',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})
eventResponse(true,'newEdges',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})
eventResponse(true,'seedDeleted',function(){
    updateMetrics(Papers,Edges); // update citation metrics
    timeline.refresh()
})

export const timeline = {}

timeline.minconnections = 0;
timeline.sizeMetric = 'seedsCitedBy';
timeline.selectednode = null;
timeline.osvg = d3.select('#timeline-graph')
                    .on('click',function(){
                        timeline.circles.style("opacity", 1);
                        timeline.lines.style("opacity",1);
                        timeline.circles.on('mouseover',p=>updateInfoBox(p))
                        d3.selectAll('.paper-box').classed('selected-paper',false)
                        document.getElementById('selected-paper-box').style.display ='none';
                    })
                    .call(d3.zoom().on("zoom", function () {timeline.svg.attr("transform", d3.event.transform)}))//enable zoom by scrolling
                    .on("dblclick.zoom", null);//disable double click zooming
timeline.width =  document.getElementById('timeline-view').offsetWidth; //extract the width and height attribute (the + converts to number)
timeline.height =  document.getElementById('timeline-view').offsetHeight;
timeline.svg =  timeline.osvg.append('g');
timeline.lines =  timeline.svg.append("g").attr("class", "link").selectAll("line");
timeline.circles =  timeline.svg.append("g").attr("class", "node").selectAll("circle");
                    
timeline.refresh = function(){                
    //Pick only edges that you want to display i.e. citedBy vs references
    timeline.edges = Edges.map(e=>{return {source:e.source.ID,target:e.target.ID}});
    timeline.nodeIDs = timeline.edges.map(function(e){return(e.source)}).concat(timeline.edges.map(function(e){return(e.target)}));
    //Pick only Papers that are connected to something
    timeline.nodes = Papers.filter(function(p){
        return(timeline.nodeIDs.includes(p.ID)||p.seed)
    }); 
    timeline.circles = timeline.circles.data(timeline.nodes,function(d){return d.ID});
    timeline.circles.exit().remove();
    timeline.circles = timeline.circles.enter().append("circle")
                        .merge(timeline.circles)
                        .attr("r", function(d){return d.seed ? 10 : 5*Math.max(d.seedsCited,d.seedsCitedBy)})
                        .attr("cx",function(d){
                            return(timeline.width*timeline.nodes.indexOf(d)/timeline.nodes.length)
                        })
                        .attr("cy",function(d){
                            return(timeline.width*timeline.nodes.indexOf(d)/timeline.nodes.length)
                        })
                        .attr("class", function(d){d.seed ? 'seed-node node':'node'})                                            
                        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
                        .on("click",p=>timeline.highlightNode(p))
                        .on("mouseover",p=>updateInfoBox(p))                    
    timeline.circles.append("title").text(function(d) { return d.title; }); //Label nodes with title on hover
    
    timeline.lines = timeline.lines.data(timeline.edges, function(d) { return d.source.ID + "-" + d.target.ID; })
    timeline.lines.exit().remove();
    timeline.lines = timeline.lines.enter().append("line").attr("marker-end", "url(#end)").merge(timeline.lines);

    timeline.threshold(timeline.minconnections);   
    timeline.circles.style("opacity", 1);
    timeline.lines.style("opacity",1);   
};

timeline.neighboring = function(a, b) {
    return (
        timeline.edges.filter(function(e){
            return e.source == a | e.target == a
        }).filter(function(e){
            return e.source == b | e.target == b
        }).length
    )
};

timeline.highlightNode = function(d){
    timeline.circles.style("opacity", 1);
    timeline.lines.style("opacity",1);
    timeline.circles.style("opacity", function (o) {
        return timeline.neighboring(d, o) | timeline.neighboring(o, d) ? 1 : 0.15;
    });
    timeline.lines.style("opacity", function(o) {
        return o.source === d || o.target === d ? 1 : 0.15;
    });
    updateInfoBox(d);
    timeline.circles.on('mouseover',null)
    d3.event.stopPropagation();
};

timeline.threshold = function(value){
    let metric;
    switch(timeline.mode){
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
    timeline.circles.style("visibility", function (p) {
        return p.hide ? "hidden" : "visible" ;
    });
    var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        
    timeline.lines.style("visibility", function(e){     
        return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";  
    })
}



  