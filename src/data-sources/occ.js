newDataModule('occ', {

    eventResponses:{
        /* newSeed: function(paper){
            if(paper.occID){
                occ.getPapersCitingID(paper.occID)
            } else if(paper.DOI){
                occ.getPapersCitingDOI(paper.DOI)
            }
        },
        seedUpdate: function(paper){
            if(!paper.occID & paper.DOI){
                occ.citedByDOI(paper.DOI)
            }
        } */
    },
    parseResponse: function(responseString, queryType){
        var response = JSON.parse(responseString);
        var ne = 0; //For bean counting only
        var newEdges = response.results.bindings;
        for(let i=0;i<newEdges.length;i++){
            let edge = newEdges[i]
            var cited = {
                Author: null,
                DOI: edge.citedDOI ? edge.citedDOI.value : null,
                Title: edge.citedTitle ? edge.citedTitle.value : null,
                Year: edge.citedYear ? edge.citedYear.value : null,
                occID: edge.citedID.value
            }
            cited = addPaper(cited,(queryType=='refs'));
            if(!edge.citingID){break}
            var citer = {
                Author: null,
                DOI: edge.citingDOI ? edge.citingDOI.value : null,
                Title: edge.citingTitle ? edge.citingTitle.value : null,
                Year: edge.citingYear ? edge.citingYear.value : null,
                occID: edge.citingID.value
            }
            citer = addPaper(citer,(queryType=='citedBy'));
            let newEdge = {
                source: citer,
                target: cited,
                occ: true,
                hide: false
            };
            addEdge(newEdge);ne++
        }
        console.log('OCC found ' + ne + " citations")
    },
    sendQuery: function(query){

        let url = 'http://opencitations.net/sparql?query=' + escape(query.string);
        fetch(url,{
            headers: {
                'Accept': 'application/sparql-results+json'
            }
        }).then((resp) => resp.text()).then((data)=> {
            occ.parseResponse(data, query.type);
            refreshGraphics();
        });

         console.log('querying OCC...');
    },
    getPapersCitedByDOI: function(doi){
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
    getPapersCitedByID: function(id){ //Queries OCC SPARQL to find references of the ID specified. Updates Papers and Edges data structures.
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
    getPapersCitingID: function(id){
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
    getPapersCitingDOI: function(doi){
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
})