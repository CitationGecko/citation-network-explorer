timeGraph = {}

timeGraph.osvg = d3.select('#timelineGraph')
                    .call(d3.zoom().on("zoom", function () {
                            let transform = d3.event.transform;
                            transform.k = 1;
                            transform.x = 0;
                            timeGraph.osvg.attr("transform", transform)
                        })
                    )//enable zoom by scrolling
                     .on("dblclick.zoom", null);//disable double click zooming; // Select svg
timeGraph.svg =  timeGraph.osvg.append('g');
timeGraph.width =  document.getElementById('networkView').offsetWidth; //extract the width and height attribute (the + converts to number)
timeGraph.height =  document.getElementById('networkView').offsetHeight;
timeGraph.nodes = Papers;
timeGraph.circles = timeGraph.svg.append("g").attr("class", "node").selectAll("circle");
timeGraph.update = function(){
    let years = timeGraph.nodes.map(p=>p.Year).filter(p=>p>1900);
    let maxYear = Math.max(...years);
    let minYear = Math.min(...years);
    //timeGraph.osvg.attr('height',(maxYear-minYear+(6-1)/12)*70);
    let y = d3.scaleLinear()
        .domain([minYear,maxYear])
        .range([0,maxYear*70])
    let yAxis = d3.axisLeft(y);
    timeGraph.nodes.sort((a,b)=>(a.Year-b.Year))
    timeGraph.circles = timeGraph.circles.data(timeGraph.nodes,function(d){return d.ID})
    timeGraph.circles.exit().remove();
    timeGraph.circles = timeGraph.circles.enter().append("circle")
        //.merge(timeGraph.circles)
        .attr("r", function(d){
            return d.seed ? 7 : 5*Math.max(d.seedsCited,d.seedsCitedBy);
        })
        .attr('cx',function(d){
            let year = (d.Year? d.Year:maxYear);
            let month = (d.Month ? d.Month:6);
            let a = timeGraph.width*month/12;
            let dir = year%2;
            return (a*dir + (timeGraph.width-a)*(1-dir))
        })
        .attr('cy',function(d){
            let year = (d.Year? d.Year:maxYear);
            let month = (d.Month ? d.Month:6);
            return (maxYear-year+(6-month)/12)*70;
        })
        .attr("class", function(d) { 
            if(d.seed){return 'seed-node node'} else {return 'node'};
        })                                            
        .style("visibility", function (d) {return d.hide == 1 ? "hidden" : "visible";})
        .on("click",timeGraph.highlightNode)
        .on("mouseover",function(){updateInfoBox(this)})
    timeGraph.circles.append("title").text(function(d) { return d.Year + ' ' + d.Month; }); //Label nodes with Title on hover
}




