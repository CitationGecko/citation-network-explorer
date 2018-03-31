
//Functions for sending requests to, and parsing responses from, the Microsoft Academic Graph API
MICROSOFT_API_KEY = false ; //IF YOU HAVE YOUR OWN API KEY PUT IT HERE!
MicrosoftStatus = 'good'; // Once it switches to bad after first failed request it will stop alerting the user when requests fail.
var microsoft = {
    apiRequest: function(request,callback){ //Send a generic request to the MAG api
        xmlhttp = new XMLHttpRequest();      
        var url =  window.location.href; //If no API key is given the request will be sent to an intermediate server which inserts the API and forwards it on to Microsoft.
        if(MICROSOFT_API_KEY){ //If API key is given, query the API directly
            url = "https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json"
        }
        xmlhttp.open("POST", url,true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        if(MICROSOFT_API_KEY){
            xmlhttp.setRequestHeader("Ocp-Apim-Subscription-Key", MICROSOFT_API_KEY);
        }
        xmlhttp.onreadystatechange = function () {   
            if (this.readyState == 4 && this.status == 200) {
                console.log('Response recieved from MAG!')
                callback(this.responseText)
            } else if(this.readyState==4){
                if(MicrosoftStatus == 'good'){
                    MicrosoftStatus = 'bad';
                    alert("The Microsoft Academic Graph is unavailable at this time. This will result in reduced coverage, especially in cited-by mode, and search by title won't work. Sorry for the inconvenience, please try again later.")}
                    console.log(this.responseText)
                }
        }
        xmlhttp.send(JSON.stringify(request.toSend));
        console.log('sending request to MAG... ')
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
    titleMatch: function(paper){
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
                $('#b').removeClass('active')
                $('#a').addClass('active') */
            }
        })
    },
    titleSearch: function(query){
        var request = microsoft.titleQuery(query)
        $('#titleSearchButton').html('Searching...')
        microsoft.apiRequest(request,function(response){
            var response = JSON.parse(response)
            updateSearchTable(response.Results.map(function(p){return p[0];}))
            $('#titleSearchButton').html('Search for Seed Papers')
            $('#b').removeClass('active')
            $('#a').addClass('active')
        })
    },
    sendQuery: function(request){
        microsoft.apiRequest(request,function(response){
            var response = JSON.parse(response)
                if(response.Results.length){
                    $('#add'+request.toSend.paper.id[0]).html("<button class='btn btn-success btn-sm'><span class='glyphicon glyphicon-ok'></span></button>")
                    microsoft.parseResponse(response,request); //add Papers found by request to Papers array
                    refreshGraphics();
                } else {
                    console.log("No connecting papers found");
                    $('#add'+request.toSend.paper.id[0]).html("<button class='btn btn-warning btn-sm'><span class='glyphicon glyphicon-exclamation-sign'></span></button>")
                }
        })
    },
    parseResponse: function(response,request){
        var np = 0; //For bean counting only 
        var ne = 0; //For bean counting only
        var seedpaper = response.Results[0][0];
        seedpaper = {           
            ID: uniqueID,
            Title: seedpaper.OriginalTitle,
            Author: null,
            DOI: seedpaper.DOI,
            Year: seedpaper.PublishYear,
            MicrosoftID: seedpaper.CellID,
            seed: true
        }
        let existingRecord = matchPapers(seedpaper,Papers); // Search for existing paper
        if(!existingRecord){
            oaDOI.accessQuery(seedpaper)
            Papers.push(seedpaper);np++;uniqueID++
        }else{
            seedpaper = mergePapers(existingRecord,seedpaper);
        }
        for (let i=0; i < response.Results.length; i++) {
            var connection = response.Results[i][1];
            connection = {
                ID: uniqueID,
                Title: connection.OriginalTitle,
                Author: null,
                DOI: connection.DOI,
                Year: connection.PublishYear,
                MicrosoftID: connection.CellID,
                seed: false
            }
            let existingRecord = matchPapers(connection,Papers); // Search for existing paper
            if(!existingRecord){
                oaDOI.accessQuery(connection)
                Papers.push(connection);np++;uniqueID++
            }else{
                connection= mergePapers(existingRecord,connection);
            } //for seed make sure seed status is set to true
            //Define the edges depending on request
            var edges =[];
            switch(request.type){
                case 'ref':
                    edges = [{"source": seedpaper, "target": connection, "origin":"mag"}];
                    break;
                case 'citedBy':
                    edges = [{"source": connection, "target": seedpaper,"origin":"mag"}];
                    break;    
            }
            edges.forEach(function(edge){   
                if(Edges.filter(function(e){
                    return e.source.ID == edge.source.ID & e.target.ID == edge.target.ID
                }).length == 0){
                    Edges.push(edge);ne++
                }
                edge.hide=false
            });
        }
        console.log(np + " papers and " + ne + " edges added from MAG")
    },
    addSeedByID: function(ID){      
        $('#add'+ID).html("<button  class='btn btn-info btn-sm'><div class='loader'</div></button>")
        microsoft.sendQuery(microsoft.citedByQuery(ID));       
        microsoft.sendQuery(microsoft.refQuery(ID));
    }
}

