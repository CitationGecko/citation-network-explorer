
//Functions for sending requests to, and parsing responses from, the Microsoft Academic Graph API

MicrosoftStatus = 'good'; // Once it switches to bad after first failed request it will stop alerting the user when requests fail.

newDataModule('microsoft', {
    eventResponses:{
        newSeed: function(paper){  
            if(paper.MicrosoftID){
                microsoft.sendQuery(microsoft.citedByQuery(paper.MicrosoftID));       
                microsoft.sendQuery(microsoft.refQuery(paper.MicrosoftID));
            } else if(paper.Title){
               microsoft.titleMatchSearch(paper);
            }
        },
        seedUpdate: function(paper){
            if(!paper.MicrosoftID){
                microsoft.titleMatchSearch(paper);
            }
        },
    },
    apiRequest: function(request,callback){ //Send a generic request to the MAG api
        xmlhttp = new XMLHttpRequest();
        //If no API key is given the request will be sent to an intermediate server which inserts the API and forwards it on to Microsoft.
        var url = '/api/v1/query/microsoft/search';
        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log('Response recieved from MAG!')
                callback(this.responseText)
            } else if(this.readyState==4){
                if(MicrosoftStatus == 'good'){
                    MicrosoftStatus = 'bad';
                    alert('The Microsoft Academic Graph is unavailable at this time. This will result in reduced coverage, especially in cited-by mode, and search by title won\'t work. Sorry for the inconvenience, please try again later.')}
                    console.log(this.responseText)
                }
        }
        xmlhttp.send(JSON.stringify(request.toSend));
        console.log('sending request to MAG... ');
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
        microsoft.apiRequest(request,function(response){
            var response = JSON.parse(response)
            updateSearchTable(response.Results.map(function(p){return p[0];}),1,true)
        })
    },
    titleMatchSearch: function(paper){
        var request = microsoft.titleQuery(paper.Title)       
        microsoft.apiRequest(request,function(response){
            var response = JSON.parse(response)
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
                microsoft.sendQuery(microsoft.citedByQuery(ID))
                microsoft.sendQuery(microsoft.refQuery(ID))
            } else {
                /* alert("Papers with similar titles found, please choose from table...")
                updateSearchTable(response.Results.map(function(p){return p[0];}))
             */
            }
        })
    },
    sendQuery: function(request){
        microsoft.apiRequest(request,function(response){
            var response = JSON.parse(response)
                if(response.Results.length){
                    microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                    refreshGraphics();
                } else {
                    console.log("No connecting papers found");
                }
        })
    },
    parseResponse: function(response,request){
        var ne = 0; //For bean counting only
        var seedpaper = response.Results[0][0];
        seedpaper = {           
            Title: seedpaper.OriginalTitle,
            Author: null,
            DOI: seedpaper.DOI,
            Year: seedpaper.PublishYear,
            MicrosoftID: seedpaper.CellID,
            seed: true
        }
        seedpaper = addPaper(seedpaper);
        for (let i=0; i < response.Results.length; i++) {
            var connection = response.Results[i][1];
            connection = {
                Title: connection.OriginalTitle,
                Author: null,
                DOI: connection.DOI,
                Year: connection.PublishYear,
                MicrosoftID: connection.CellID,
                seed: false
            }
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
})