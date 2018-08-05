d3.select('#add-seeds-modal').select('div').append('button').attr('id','add-by-zotero')
    .html("<img id='zotero-square' src='images/zotero/zotero2.png'>")

document.getElementById("add-by-zotero").onclick = function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('zotero-modal').style.display = "block";
    zotero.getCollections();
}

var modal = d3.select('body').append('div').attr('id','zotero-modal').attr('class','modal')
    .append('div').attr('class','modal-content')
    
    modal.append('div').html("<img id='zotero-logo' src='images/zotero/zotero-logo.png'>");
    modal.append('svg').attr('id','zotero-collections');


var zotero = {

    getCollections: function(){

      if (!ZOTERO_USER_ID || !ZOTERO_USER_API_KEY) {
        ZOTERO_USER_ID = prompt('Enter Zotero User ID');
        ZOTERO_USER_API_KEY = prompt('Enter Zotero User API Key');
      }

        let url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections?limit=100';
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url,true);
        xmlhttp.setRequestHeader('Zotero-API-Key', ZOTERO_USER_API_KEY)
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
                if(this.status == 200) {
                    // Do something with the results
                    console.log('response from Zotero!');
                    collections = JSON.parse(this.responseText);

                    let total = this.getResponseHeader('Total-Results');

                    if(total==collections.length){
                        zotero.displayCollections(collections);
                    }

                    for(let i=0;i<Math.ceil(total/100);i++){

                        let url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections?key=' + ZOTERO_USER_API_KEY + '&limit=100&start=' + (100 * (i+1));
                        let xmlhttp = new XMLHttpRequest();
                        xmlhttp.open('GET', url,true);
                        xmlhttp.onreadystatechange = function() {
                            if(this.readyState == 4) {
                                if(this.status == 200) {
                                    // Do something with the results
                                    collections = collections.concat(JSON.parse(this.responseText));

                                    if(i==(Math.ceil(total/100)-1)){
                                        zotero.displayCollections(collections);
                                    }
                                }
                            };
                        };
                        xmlhttp.send(null);

                    }

                }
            }
        };
        xmlhttp.send(null);
    },

    parseCollectionTree: function(collections){

        var tree=[];
        var parents = collections.filter(function(c){
            return(!c.data.parentCollection)
        })

        let getChildren = function(collections,ID){

            let children = collections.filter(function(c){
                return(c.data.parentCollection==ID)
            }).map(function(c){
                return({
                    name: c.data.name,
                    children: getChildren(collections,c.key),
                    key: c.key
                })
            })

            return(children)

        }

        for(var i=0;i<parents.length;i++){
            tree.push({
                name: parents[i].data.name,
                children: getChildren(collections,parents[i].key),
                key: parents[i].key
            })
        }

        return({
            name:'All Collections',
            children: tree
        })


    },

    displayCollections: function(collections){

        var margin = {top: 30, right: 20, bottom: 30, left: 20},
            width = d3.select('#zotero-modal').select('.modal-content').node().getBoundingClientRect().width,
            barHeight = 40,
            barWidth = (width - margin.left - margin.right) * 0.7;

        var i = 0,
            duration = 400,
            root;

        var svg = d3.select("#zotero-collections")
            .attr("width", width) // + margin.left + margin.right)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        root = d3.hierarchy(zotero.parseCollectionTree(collections));
        root.x0 = 0;
        root.y0 = 0;

        root.children.forEach(collapse);

        update(root);

        function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d._children.forEach(collapse)
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
        }
        function click(d) {
            /* if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d); */

            zotero.getItems(d.data.key)
            document.getElementById('zotero-modal').style.display = "none";
          }

          function color(d) {
            return d._children ? "rgb(255, 199, 0)" : d.children ? "rgb(155, 155, 155)" : "rgb(250, 250, 250)";
          }

        function update(source) {

            // Compute the flattened node list.
            var nodes = root.descendants();

            var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

            d3.select("#zotero-collections").transition()
                .duration(duration)
                .attr("height", height);

            d3.select(self.frameElement).transition()
                .duration(duration)
                .style("height", height + "px");

            // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
            var index = -1;
            root.eachBefore(function(n) {
              n.x = ++index * barHeight;
              n.y = n.depth * 20;
            });

            // Update the nodes…
            var node = svg.selectAll(".zotero-folder")
              .data(nodes, function(d) { return d.id || (d.id = ++i); });

            var nodeEnter = node.enter().append("g")
                .attr("class", "zotero-folder")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .style("opacity", 0);

            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", barHeight)
                .attr("width", 0.9*barWidth)
                .style("fill", color)
                .on("click", click);

            nodeEnter.append('rect')
                .attr("y", -barHeight / 2)
                .attr("x", 0.9*barWidth)
                .attr("height", barHeight)
                .attr("width", 0.1*barWidth)
                .style("fill", 'rgb(208, 208, 208)')
                .on('click',collapse)


            nodeEnter.append("text")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .text(function(d) { return d.data.name; });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1)
              .select("rect")
                .style("fill", color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .style("opacity", 0)
                .remove();

            // Stash the old positions for transition.
            root.each(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }
    },

    getItems: function(collectionID){
        url = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/collections/' + collectionID + '/items/top';
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url,true);
        xmlhttp.setRequestHeader('Zotero-API-Key', ZOTERO_USER_API_KEY);
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
            if(this.status == 200) {
                // Do something with the results
                console.log('response from Zotero!')
                items = JSON.parse(this.responseText);

                for(let i=0;i<items.length;i++){
                    item = items[i];
                    //item.data.title;
                    //item.meta.creatorSummary;
                    //item.meta.parsedDate;
                    addPaper({DOI:item.data.DOI},true);
                }
            } else {
                // Some kind of error occurred.
                //alert("oaDOI query error: " + this.status + " "+ this.responseText);
            }
            }
        };
        xmlhttp.send(null);

    }
}

d3.select("#addByZotero").on('click', function() {
    document.getElementById('addSeedModal').style.display = "none";
    document.getElementById('zotero-modal').style.display = "block";
    zotero.getCollections();
})