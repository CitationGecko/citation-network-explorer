var bibtex = {
    //Importing user uploaded Bibtex
    importBibTex: function(evt) {
        let files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = function(e){
                var papers = bibtexParse.toJSON(e.target.result);
                if(papers.filter(function(p){
                    return p.entryTags.doi;
                }).length==0){
                    alert("We couldn't find any DOIs in the BibTex you uploaded please check your export settings");
                };
                for(let i=0;i<papers.length;i++){
                    if(papers[i].entryTags.doi){
                        let newSeed = {doi: papers[i].entryTags.doi}
                        addPaper(newSeed,true);
                    }; 
                };
            };
            reader.readAsText(f);       
        };
        document.getElementById('upload-bibtex-modal').style.display = "none"; //Hide modal once file selected
        if(onboarding){
            document.getElementById('onboarding-3').style.display = "block";
        }
    },
    //Importing Example BibTex
    importExampleBibTex: function(){
        let url = window.location.href+'examples/exampleBibTex.bib'
        fetch(url).then((resp) => resp.text()).then((data)=> {
                var papers = bibtexParse.toJSON(data);
                for(let i=0;i<papers.length;i++){
                    let newSeed = {doi: papers[i].entryTags.doi}
                    addPaper(newSeed,true);
                };
            }
        )
    }
}

document.getElementById('files').addEventListener('change', bibtex.importBibTex, false);

document.getElementById('demo-button').onclick = function(){
    bibtex.importExampleBibTex()
    document.getElementById('onboarding-1').style.display = "none";
    document.getElementById('onboarding-3').style.display = "block";

}