var zotero = {

    getCollections: function(){

        let url = "https://api.zotero.org/users/2657730/collections?limit=100" ;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url,true); 
        xmlhttp.setRequestHeader('Zotero-API-Key','G5lqEndEXOYyAsQo9bmiOt0N')
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
                if(this.status == 200) {
                    // Do something with the results
                    console.log('response from Zotero!');
                    collections = collections.concat(JSON.parse(this.responseText));

                    let total = this.getResponseHeader('Total-Results');

                    for(let i=1;i<Math.ceil(total/100);i++){

                        let url = "https://api.zotero.org/users/2657730/collections?key=G5lqEndEXOYyAsQo9bmiOt0N&limit=100&start="+100*(i+2) ;
                        let xmlhttp = new XMLHttpRequest();
                        xmlhttp.open('GET', url,true); 
                        xmlhttp.onreadystatechange = function() {
                            if(this.readyState == 4) {
                                if(this.status == 200) {
                                    // Do something with the results
                                    collections.concat(JSON.parse(this.responseText));
                                }
                            };
                        };
                        xmlhttp.send(null);

                    }
                    zotero.displayCollections(collections);
                }
            }
        };
        xmlhttp.send(null);
    },

    parseCollectionTree: function(collections){

        var tree=[];
        var parents = collections.filter(function(c){
            return(c.data.parentCollection=='ASQ4KNQK')
        })

        let getChildren = function(collections,ID){
            
                   
            let children = collections.filter(function(c){
                return(c.data.parentCollection==ID)
            }).map(function(c){
                return({
                    name: c.key,
                    children: getChildren(collections,c.key)
                })
            })

            return(children)

        }

        for(var i=0;i<parents.length;i++){
            tree.push(getChildren(collections,parents[i]))
        }

        return(tree)


    },

    displayCollections: function(collections){

        var paperbox = d3.select('#zoteroModal').select('.modal-content').selectAll('.outer-paper-box')
                        .data(collections,function(d){return d.key})
        paperbox.exit().remove()
        paperbox = paperbox.enter()
            .append('div')
            .attr('class','outer-paper-box panel')
        paperbox = paperbox.append('div')
            .attr('class','inner-paper-box panel')
        paperbox.append('button').attr('class','plot-button')
            .html('<i class="fab fa-hubspot" color="rgb(255, 199, 0)" aria-hidden="true"></i>')
            .attr('onclick',function(p){return('p')})
        paperbox.append('div').attr('class','zotero-collection-name')
            .html(function(p){
                return(p.data.name)
            })    
        paperbox.append('button').attr('class','folder-expand')
            .html('<i class="fas fa-angle-right" aria-hidden="true"></i>')
            .attr('onclick',function(p){return('p')})
           
    },

    getItems: function(collectionID){
        url = "https://api.zotero.org/users/2657730/collections/"+collectionID+"/items/top?key=G5lqEndEXOYyAsQo9bmiOt0N" ;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url,true); 
        xmlhttp.onreadystatechange = function() {
            if(this.readyState == 4) {
            if(this.status == 200) {
                // Do something with the results
                console.log('response from Zotero!')
                items = JSON.parse(this.responseText);

                for(let i=0;i<items.length;i++){
                    item = items[i];
                    item.data.title; 
                    console.log(item.data.DOI);
                    item.meta.creatorSummary;
                    item.meta.parsedDate;
                }
            } else {
                // Some kind of error occurred.
                //alert("oaDOI query error: " + this.status + " "+ this.responseText);
            }
            }
        };
        xmlhttp.send(null);

    },

    queryItems: function(){

        
    },

    plotCollection: function(){


    }


}