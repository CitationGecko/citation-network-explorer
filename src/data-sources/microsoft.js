
newDataModule('microsoft', {
    eventResponses:{
        newSeed: {
            listening: false,
            action: function(paper){  
                if(paper.MicrosoftID){
                    microsoft.sendCitedByQuery(paper.MicrosoftID);       
                    microsoft.sendRefQuery(paper.MicrosoftID);
                } else if(paper.Title){
                microsoft.titleMatchSearch(paper);
                }
            }
        },
        seedUpdate: {
            listening: false,
            action: function(paper){
                if(!paper.MicrosoftID){
                    microsoft.titleMatchSearch(paper);
                }
            }
        },
    },
    methods:{
        apiRequest: function(request,callback){ //Send a generic request to the MAG api
            var url = '/api/v1/query/microsoft/search';
            fetch(url,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(request.toSend)
                })
                .then((res)=>res.json())
                .then(callback)
            /* xmlhttp = new XMLHttpRequest();
            //If no API key is given the request will be sent to an intermediate server which inserts the API and forwards it on to Microsoft.
            var url = '/api/v1/query/microsoft/search';
            xmlhttp.open('POST', url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    callback(this.responseText)
                } else if(this.readyState==4){
                    if(MicrosoftStatus == 'good'){
                        MicrosoftStatus = 'bad';
                        alert('The Microsoft Academic Graph is unavailable at this time. This will result in reduced coverage, especially in cited-by mode, and search by title won\'t work. Sorry for the inconvenience, please try again later.')}
                        console.log(this.responseText)
                    }
            }
            xmlhttp.send(JSON.stringify(request.toSend)); */
        },
        refQuery: function(id){ //Query for MAG API to get references of a paper from the Microsoft ID.
            return {          
                "type": "ref",
                "toSend": {
                    "path": "/paper/ReferenceIDs/cited",
                    "paper": {
                        "type": "Paper",
                        "id": [id.toString()],
                        "select":["OriginalTitle","DOI","PublishYear"]
                    },
                    "cited": {
                        "select":["OriginalTitle" , "DOI","PublishYear"],
                        "return": {
                        "type": "Paper",
                        }
                    }
                }
            }
        },
        citedByQuery: function(id){//Query for MAG API to get papers citing a paper with a specific Microsoft ID.
            return {          
                "type": "citedBy",
                "toSend": {
                    "path": "/paper/CitationIDs/citer",
                    "paper": {
                        "type": "Paper",
                        "id": [id.toString()],
                        "select":["OriginalTitle","DOI","PublishYear"]
                    },
                    "citer": {
                        "select":["OriginalTitle" , "DOI",,"PublishYear"],
                        "return": {
                        "type": "Paper",
                        }
                    }
                }
            }
        },
        titleQuery: function(title){//Query for MAG API that searches for papers with titles containing the string given by 'title'
            return {           
                "type": "title",
                "toSend": {
                    "path": "/paper/",
                    "paper": {
                        "type": "Paper",
                        "NormalizedTitle": title,
                        "select":["OriginalTitle","PublishYear","DOI"]
                    }
            
                }
            }
        },
        titleSearch: function(query){
            var request = microsoft.titleQuery(query)
            console.log('MAG: querying title "'+query+'"')
            microsoft.apiRequest(request,function(response){
                console.log('MAG: results found for title "'+query+'"')
                updateTitleSearchResults(response.Results.map(function(p){return p[0];}),1,true)
            })
        },
        titleMatchSearch: function(paper){
            var request = microsoft.titleQuery(paper.Title)
            console.log('MAG: querying title "'+paper.Title+'"')       
            microsoft.apiRequest(request,function(response){
                console.log('MAG: results found for title "'+paper.Title+'"')
                //check for DOI matches
                var match = response.Results.filter(function(p){
                    if(p[0].DOI){
                        return (p[0].DOI.toLowerCase()==paper.DOI.toLowerCase())
                    } else {
                        return(false)
                    }
                })[0];
                if(match){
                    var ID = response.Results[0][0].CellID;               
                    microsoft.sendCitedByQuery(ID)
                    microsoft.sendRefQuery(ID)
                } else {
                    /* alert("Papers with similar titles found, please choose from table...")
                    updateTitleSearchResults(response.Results.map(function(p){return p[0];}))
                */
                }
            })
        },
        sendRefQuery: function(ID){
            console.log('MAG: querying refs for ID '+ID)
            var request = microsoft.refQuery(ID)
            microsoft.apiRequest(request,function(response){
                    if(response.Results.length){
                        console.log('MAG: founds refs for ID '+ID)
                        microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                        refreshGraphics();
                    } else {
                        console.log("No connecting papers found");
                    }
            })
        },
        sendCitedByQuery: function(ID){
            console.log('MAG: querying cited-by for ID '+ID)
            var request = microsoft.citedByQuery(ID)
            microsoft.apiRequest(request,function(response){
                    if(response.Results.length){
                        console.log('MAG: founds cited-by for ID '+ID)
                        microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                        refreshGraphics();
                    } else {
                        console.log("No connecting papers found");
                    }
            })
        },
        parsePaper: function(paper){
            return {           
                Title: paper.OriginalTitle,
                Author: null,
                DOI: paper.DOI,
                Year: paper.PublishYear,
                MicrosoftID: paper.CellID,
            }
        },
        parseResponse: function(response,request){
            var ne = 0; //For bean counting only
            var seedpaper = response.Results[0][0];
            seedpaper = microsoft.parsePaper(seedpaper)
            seedpaper = addPaper(seedpaper,true);
            for (let i=0; i < response.Results.length; i++) {
                var connection = response.Results[i][1];
                connection = microsoft.parsePaper(connection)
                connection = addPaper(connection);
                //Define the edges depending on request
                var edges =[];
                switch(request.type){
                    case 'ref':
                        edges = [{"source": seedpaper, "target": connection, "MAG":true, hide: false}];
                        break;
                    case 'citedBy':
                        edges = [{"source": connection, "target": seedpaper,"MAG":true, hide: false}];
                        break;    
                }
                edges.forEach(function(edge){   
                    addEdge(edge);
                    ne++; //bean counting
                });
            }
            console.log('MAG found '  + ne + " citations")
        },
    }
})