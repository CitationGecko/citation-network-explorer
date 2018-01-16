
//Functions for sending requests to, and parsing responses from, the Microsoft Academic Graph API

//MICROSOFT_API_KEY = undefined;

if(!window.MICROSOFT_API_KEY){

    MICROSOFT_API_KEY = prompt("For the best results please enter an API key for the Microsoft Academic Graph")

}

var microsoft = {

    apiRequest: function(request,callback){

        xmlhttp = new XMLHttpRequest();
        var url =  "http://localhost:3000"; //"https://westus.api.cognitive.microsoft.com/academic/v1.0/graph/search?mode=json"
        xmlhttp.open("POST", url);//, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
       // xmlhttp.setRequestHeader("Ocp-Apim-Subscription-Key", MICROSOFT_API_KEY);
        xmlhttp.onreadystatechange = function () {
    
            if (this.readyState == 4 && this.status == 200) {
                console.log('Response recieved from MAG!')
                callback(this.responseText)
            }

        }
        xmlhttp.send(JSON.stringify(request.toSend));

        console.log('sending request to MAG... ')

    },

    refQuery: function(id){

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

    citedByQuery: function(id){

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

    titleQuery: function(title){

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
        
                    updateMetrics(Papers,Edges); // update citation metrics
        
                    updateSeedTable(); //update HTML table
        
                    updateResultsTable(); //update HTML table;
        
                    updateGraph(Papers,Edges);
        
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
                
                if(Edges.filter(function(e){return e.source.ID == edge.source.ID & e.target.ID == edge.target.ID}).length == 0){
                    
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

