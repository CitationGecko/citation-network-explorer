
var occ = {
    callback: function(response,queryType){
        jsonObj = eval('(' + response + ')');
        occ.parseResponse(jsonObj,queryType);
        refreshGraphics();      
    },
    sendQuery: function(query,callback){
        var querypart = "query=" + escape(query.string);       
          // Get our HTTP request object.
        xmlhttp = new XMLHttpRequest();
         // Set up a POST with JSON result format (GET can have caching problems in browser)
         xmlhttp.open('POST', '/api/v1/queryProvider/occ', true);

         // Set up callback to get the response asynchronously.
         xmlhttp.onreadystatechange = function() {
           if(this.readyState == 4) {
             if(this.status == 200) {
               // Do something with the results
               console.log('response from OCC')
               callback(this.responseText,query.type);
             } else {
               // Some kind of error occurred.
               console.log("Sparql query error: " + this.status + " "
                   + this.responseText);
             }
           }
         };
         // Send the query to the endpoint.
         xmlhttp.send(querypart);
         console.log('querying OCC...');
    },
    refsByDOI: function(doi){
        var query ={};
        query.type = 'refs'       
        query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
        PREFIX dcterms: <http://purl.org/dc/terms/>\n\
        PREFIX datacite: <http://purl.org/spar/datacite/>\n\
        PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
        PREFIX biro: <http://purl.org/spar/biro/>\n\
        PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
        PREFIX c4o: <http://purl.org/spar/c4o/>\n\
        PREFIX fabio: <http://purl.org/spar/fabio/>\n\
        SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
            BIND ("'+doi+'" AS ?citingDOI)\n\
            ?citingID datacite:hasIdentifier [\n\
                          datacite:usesIdentifierScheme datacite:doi ;\n\
                          literal:hasLiteralValue ?citingDOI].\n\
            ?citingID cito:cites ?citedID.\n\
            OPTIONAL{\n\
            ?citedID datacite:hasIdentifier [\n\
                          datacite:usesIdentifierScheme datacite:doi ;\n\
                          literal:hasLiteralValue ?citedDOI].\n\
            ?citedID dcterms:title ?citedTitle.\n\
            ?citedID fabio:hasPublicationYear ?citedYear.\n\
            ?citingID dcterms:title ?citingTitle.\n\
              ?citingID fabio:hasPublicationYear ?citingYear.}\n\
        }';
        occ.sendQuery(query, occ.callback);
    },
    refsByID: function(id){ //Queries OCC SPARQL to find references of the ID specified. Updates Papers and Edges data structures.
        var query = {};
        query.type = 'refs'      
        query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
        PREFIX dcterms: <http://purl.org/dc/terms/>\n\
        PREFIX datacite: <http://purl.org/spar/datacite/>\n\
        PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
        PREFIX biro: <http://purl.org/spar/biro/>\n\
        PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
        PREFIX c4o: <http://purl.org/spar/c4o/>\n\
        PREFIX fabio: <http://purl.org/spar/fabio/>\n\
        SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
            BIND (<'+id+'> AS ?citingID)\n\
            ?citingID cito:cites ?citedID\n\
            OPTIONAL {\n\
            ?citedID datacite:hasIdentifier [\n\
                datacite:usesIdentifierScheme datacite:doi ;\n\
                literal:hasLiteralValue ?citedDOI].\n\
                ?citedID dcterms:title ?citedTitle.\n\
                ?citedID fabio:hasPublicationYear ?citedYear.}\n\
            OPTIONAL { \n\
            ?citingID dcterms:title ?citingTitle.\n\
            ?citingID fabio:hasPublicationYear ?citingYear.\n\
                ?citingID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citingDOI ].} \n\
        }';
        occ.sendQuery(query, occ.callback);    
    },
    citedByID: function(id){
        var query = {};
        query.type = 'citedBy'
        query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
        PREFIX dcterms: <http://purl.org/dc/terms/>\n\
        PREFIX datacite: <http://purl.org/spar/datacite/>\n\
        PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
        PREFIX biro: <http://purl.org/spar/biro/>\n\
        PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
        PREFIX c4o: <http://purl.org/spar/c4o/>\n\
        PREFIX fabio: <http://purl.org/spar/fabio/>\n\
        SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
            BIND (<'+id+'> AS ?citedID)\n\
            OPTIONAL {\n\
            ?citedID datacite:hasIdentifier [\n\
                datacite:usesIdentifierScheme datacite:doi ;\n\
                literal:hasLiteralValue ?citedDOI].\n\
                ?citedID dcterms:title ?citedTitle.\n\
                ?citedID fabio:hasPublicationYear ?citedYear.}\n\
            OPTIONAL { \n\
            ?citingID cito:cites ?citedID.\n\
            ?citingID dcterms:title ?citingTitle.\n\
            ?citingID fabio:hasPublicationYear ?citingYear.\n\
                ?citingID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citingDOI ].} \n\
        }';
        occ.sendQuery(query, occ.callback);
    },
    citedByDOI: function(doi){
        var query ={};
        query.type = 'refs'
        query.string = 'PREFIX cito: <http://purl.org/spar/cito/>\n\
        PREFIX dcterms: <http://purl.org/dc/terms/>\n\
        PREFIX datacite: <http://purl.org/spar/datacite/>\n\
        PREFIX literal: <http://www.essepuntato.it/2010/06/literalreification/>\n\
        PREFIX biro: <http://purl.org/spar/biro/>\n\
        PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n\
        PREFIX c4o: <http://purl.org/spar/c4o/>\n\
        PREFIX fabio: <http://purl.org/spar/fabio/>\n\
        SELECT ?citingID ?citingDOI ?citingTitle ?citingYear ?citedID ?citedTitle ?citedYear ?citedDOI WHERE {\n\
            BIND ("'+doi+'" AS ?citedDOI)\n\
            ?citedID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citedDOI].\n\
            OPTIONAL {\n\
            ?citedID dcterms:title ?citedTitle.\n\
            ?citedID fabio:hasPublicationYear ?citedYear.}\n\
            OPTIONAL { \n\
            ?citingID cito:cites ?citedID.\n\
            ?citingID dcterms:title ?citingTitle.\n\
            ?citingID fabio:hasPublicationYear ?citingYear.\n\
                ?citingID datacite:hasIdentifier [\n\
                    datacite:usesIdentifierScheme datacite:doi ;\n\
                    literal:hasLiteralValue ?citingDOI ].} \n\
        }';
        occ.sendQuery(query, occ.callback);
    },
    parseResponse: function(response,queryType){
        var np = 0; //For bean counting only 
        var ne = 0; //For bean counting only
        var newEdges = response.results.bindings;
        for(let i=0;i<newEdges.length;i++){
            let edge = newEdges[i]
            var cited = {
                ID: uniqueID,
                Author: null,
                DOI: edge.citedDOI ? edge.citedDOI.value : null,                            
                Title: edge.citedTitle ? edge.citedTitle.value : null,
                Year: edge.citedYear ? edge.citedYear.value : null,
                occID: edge.citedID.value,
                seed: queryType=='refs'
            }
            let existingRecord = matchPapers(cited,Papers); // Search for existing paper
            if(!existingRecord){//If it doesn't exist add it
                oaDOI.accessQuery(cited)
                Papers.push(cited);np++;uniqueID++
            }else{//If it does merge it
                cited = mergePapers(existingRecord,cited);
            }
            if(!edge.citingID){break}
            var citer = {
                ID: uniqueID,
                Author: null,
                DOI: edge.citingDOI ? edge.citingDOI.value : null,                            
                Title: edge.citingTitle ? edge.citingTitle.value : null,
                Year: edge.citingYear ? edge.citingYear.value : null,
                occID: edge.citingID.value,
                seed: queryType=='citedBy'
            }
            existingRecord = matchPapers(citer,Papers); // Search for existing paper
            if(!existingRecord){//If it doesn't exist add it
                oaDOI.accessQuery(citer)
                Papers.push(citer);np++;uniqueID++
            }else{//If it does merge it
                citer = mergePapers(existingRecord,citer);
            };
            let newEdge = {
                source: citer,
                target: cited,
                origin: 'occ',
                hide: false
            };   
            if(Edges.filter(function(e){return e.source == newEdge.source & e.target == newEdge.target}).length == 0){Edges.push(newEdge);ne++}
        }
        console.log(np + " papers and " + ne + " edges added from OCC")
    }
}