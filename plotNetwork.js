
var minconnections = 0,

    mode = 'ref',

    selectednode,

    graph = {},

    osvg = d3.select('#forceGraph')
                .on('click',function(){
                    node.style("opacity", 1);
                    link.style("opacity",1);
                }), //select the svg
    
    width = document.getElementById('networkView').offsetWidth, //extract the width and height attribute (the + converts to number)

    height = document.getElementById('networkView').offsetHeight,

    svg = osvg.append('g'),

    link = svg.append("g").attr("class", "link").selectAll("line"),

    node = svg.append("g").attr("class", "node").selectAll("circle"),

    seedcolor = 'rgb(255, 199, 0)';
    nonseedcolor = 'rgb(94, 94, 94)';
    
    simulation = d3.forceSimulation()
                    .force("link", d3.forceLink().id(function(d) { return d.ID; }))
                    .force("charge", d3.forceManyBody().strength(-100))
                    .force("center", d3.forceCenter(width / 2, height / 2))
                    .force("xattract",d3.forceX())
                    .force("yattract",d3.forceY()); 

    osvg.call(d3.zoom().on("zoom", function () {svg.attr("transform", d3.event.transform)}))
    .on("dblclick.zoom", null);

    //Add arrow to end of edges

  /*   svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 2)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5"); */


function updateGraph(Papers,Edges){

    //Pick only edges that you want to display i.e. citedBy vs References

    switch(mode){
        
                case 'ref':
        
                graph.links = Edges.filter(function(e){return(e.source.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});
                
                var sizeMetric = 'seedsCitedBy';

                break;

                case 'citedBy':
        
                graph.links = Edges.filter(function(e){return(e.target.seed)}).map(function(e){return {source: e.source.ID, target: e.target.ID}});
                
                var sizeMetric = 'seedsCited';
                
                break;
    }

    //Pick only Papers that are connected to something

    graph.nodes = Papers.filter(function(p){
        
        
                var ids = graph.links.map(function(e){return(e.source)}).concat(graph.links.map(function(e){return(e.target)}));
        
                return(ids.includes(p.ID))
        
            }); 

    node = node.data(graph.nodes,function(d){return d.ID});

    node.exit().remove();
            
    node = node.enter().append("circle")
                        .merge(node)
                        .attr("r", function(d){return d.seed ? 7 : 5 + d[sizeMetric]})
                        .attr("fill", function(d) { 
                            
                            if(d.seed){return seedcolor} else {return nonseedcolor}
                        
                        })                                            
                        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended))
                        .on("dblclick",hideSingles)
                        .on("click",highlightNode)
                        .on("mouseover",function(){updateInfoBox(this)})
                        
                        
    node.append("title")
        .text(function(d) { return d.Title; }); //Label nodes with Title on hover

    link = link.data(graph.links, function(d) { return d.source.ID + "-" + d.target.ID; })

    link.exit().remove();

    link = link.enter().append("line").attr("marker-end", "url(#end)")
                .merge(link);

    // Update and restart the simulation.
    simulation.nodes(graph.nodes).on("tick", ticked);
    simulation.force("link").links(graph.links);
    simulation.alpha(1).restart();

    threshold(minconnections)
    //center_view();

}   


//Functions for implementing the animation on drag
function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}



function hideSingles(){

    
        var nodeid = this.__data__.ID;

        childrenids = findUniqueChildren(nodeid);

        Papers.filter(function(p){return childrenids.includes(p.ID)}).forEach(function(p){p.hide= !p.hide;});

        Edges.filter(function(e){
        
                    var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
    
                    return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID);
    
                }).forEach(function(e){e.hide=true})

        node.style("visibility", function (p) {
            return p.hide ? "hidden" : "visible" ;
        });
        link.style("visibility", function(e){
            
                     var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});
    
                    return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";})
        
        //updateGraph(Papers,Edges);

}

function updateInfoBox(selected){

        p = selected.__data__;

        document.getElementById('selected-paper-box').style.display ='block';
        
        var paperbox = d3.select('#selected-paper-box');

        paperbox.select('.paper-title').html(p.Title)

        paperbox.select('.author-year').html((p.Author ? p.Author:'')+' '+p.Year)
    
        paperbox.select('.doi-link').html(p.DOI ? ("<a href='https://doi.org/"+p.DOI+"'>"+p.DOI+"</a>"): '')

        var button = p.seed ? '' : "<button type='button' onclick='addSeedFromRecord(selectednode.ID)'>Make Seed</button>"
        
        paperbox.select('.add-seed').html(button)

        selectednode = p;
}

function neighboring(a, b) {
    
    return (graph.links.filter(function(e){return e.source == a | e.target == a})
                .filter(function(e){return e.source == b | e.target == b})
                .length)
    
}

function highlightNode(){

        d = d3.select(this).node().__data__;

        node.style("opacity", 1);
        link.style("opacity",1);

        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.15;
        });

        link.style("opacity", function(o) {
            return o.source === d || o.target === d ? 1 : 0.15;
        });

    updateInfoBox(this);

    d3.event.stopPropagation();

}

function ticked() {

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
    }



function threshold(value){

        switch(mode){

            case 'ref':

                var metric = 'seedsCitedBy';

                break;

            case 'citedBy':

                var metric = 'seedsCited';

                break;

        } 

        Papers.forEach(function(p){
            
            p.hide = (p[metric]>=value || p.seed) ? false : true ;
    
        });
       
        node.style("visibility", function (p) {
            return p.hide ? "hidden" : "visible" ;
        });

        var hiddenPapers = Papers.filter(function(p){return p.hide}).map(function(p){return p.ID});        

        link.style("visibility", function(e){
            
            return hiddenPapers.includes(e.source.ID) | hiddenPapers.includes(e.target.ID) ? "hidden":"visible";
        
        })

}


  