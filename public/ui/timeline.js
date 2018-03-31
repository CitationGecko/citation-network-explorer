timeline = d3.select('#timelineGraph') // Select svg

//Create group for papers
dots = timeline.append("g").attr("class", "node").selectAll("circle")


//