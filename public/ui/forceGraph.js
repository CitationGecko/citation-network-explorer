let forceGraph = {};

forceGraph.minconnections = 0;
forceGraph.mode = 'ref';
forceGraph.sizeMetric = 'seedsCitedBy';
forceGraph.selectednode = null;
forceGraph.osvg =  d3.select('#forceGraph')
                        .on('click',function(){
                            forceGraph.circles.style("opacity", 1);
                            forceGraph.lines.style("opacity",1);
                            forceGraph.circles.on('mouseover',function(){updateInfoBox(this)})
                        })
                        .call(d3.zoom().on("zoom", function () {forceGraph.svg.attr("transform", d3.event.transform)}))//enable zoom by scrolling
                        .on("dblclick.zoom", null);//disable double click zooming
forceGraph.width =  document.getElementById('networkView').offsetWidth; //extract the width and height attribute (the + converts to number)
forceGraph.height =  document.getElementById('networkView').offsetHeight;
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
forceGraph.dragstarted =  function(d) {
    if (!d3.event.active) forceGraph.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};
forceGraph.dragged =  function(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
},
forceGraph.dragended =  function(d) {
    if (!d3.event.active) forceGraph.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
};
forceGraph.hideSingles =  function(){
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
    //forceGraph.update(Papers,Edges);   
};
forceGraph.neighboring =  function(a, b) {
    return (
        forceGraph.edges.filter(function(e){
            return e.source == a | e.target == a
        }).filter(function(e){
            return e.source == b | e.target == b
        }).length
    )
};
forceGraph.highlightNode =  function(){
    d = d3.select(this).node().__data__;
    forceGraph.circles.style("opacity", 1);
    forceGraph.lines.style("opacity",1);
    forceGraph.circles.style("opacity", function (o) {
        return forceGraph.neighboring(d, o) | forceGraph.neighboring(o, d) ? 1 : 0.15;
    });
    forceGraph.lines.style("opacity", function(o) {
        return o.source === d || o.target === d ? 1 : 0.15;
    });
    updateInfoBox(this);
    forceGraph.circles.on('mouseover',null)
    d3.event.stopPropagation();
};
forceGraph.ticked =  function() {
    
        forceGraph.lines
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        forceGraph.circles
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
};
forceGraph.threshold =  function(value){
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
};
forceGraph.update =  function(Papers,Edges){                
    //Pick only edges that you want to display i.e. citedBy vs References
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
    //Pick only Papers that are connected to something
    forceGraph.nodes = Papers.filter(function(p){
        let ids = forceGraph.edges.map(function(e){return(e.source)}).concat(forceGraph.edges.map(function(e){return(e.target)}));
        return(ids.includes(p.ID))
    }); 
    forceGraph.circles = forceGraph.circles.data(forceGraph.nodes,function(d){return d.ID});
    forceGraph.circles.exit().remove();
    forceGraph.circles = forceGraph.circles.enter().append("circle")
                        .merge(forceGraph.circles)
                        .attr("r", function(d){return d.seed ? 7 : 5*d[forceGraph.sizeMetric]})
                        .attr("class", function(d) { 
                            if(d.seed){return 'seed-node node'} else {return 'node'}
                        })                                            
                        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
                        .call(d3.drag()
                            .on("start", forceGraph.dragstarted)
                            .on("drag", forceGraph.dragged)
                            .on("end", forceGraph.dragended))
                        .on("dblclick",forceGraph.hideSingles)
                        .on("click",forceGraph.highlightNode)
                        .on("mouseover",function(){updateInfoBox(this)})
    forceGraph.circles.append("title").text(function(d) { return d.Title; }); //Label nodes with Title on hover
    forceGraph.lines = forceGraph.lines.data(forceGraph.edges, function(d) { return d.source.ID + "-" + d.target.ID; })
    forceGraph.lines.exit().remove();
    forceGraph.lines = forceGraph.lines.enter().append("line").attr("marker-end", "url(#end)").merge(forceGraph.lines);
    // Update and restart the simulation.
    forceGraph.simulation.nodes(forceGraph.nodes).on("tick", forceGraph.ticked);
    forceGraph.simulation.force("link").links(forceGraph.edges);
    forceGraph.simulation.force("collide").initialize(forceGraph.simulation.nodes());
    forceGraph.simulation.alpha(1).restart();
    forceGraph.threshold(forceGraph.minconnections);      
}   
                    




  