import bibtexParse from 'vendor/bibtexParse'
import {updatePapers} from 'core'
import { makeSeed } from '../core';
//Importing user uploaded Bibtex
export function importBibTex(evt) {
    let files = evt.target.files; // FileList object
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        reader.onload = function(e){
            var papers = bibtexParse.toJSON(e.target.result);
            let newPapers = papers.filter(p=>p.entryTags.doi).map(p=>{
                return {doi: p.entryTags.doi}
            })
            if(!newPapers.length){alert("We couldn't find any DOIs in the BibTex you uploaded please check your export settings")};
            updatePapers(newPapers)
            makeSeed(newPapers)
        };
        reader.readAsText(f);       
    };
    document.getElementById('upload-bibtex-modal').style.display = "none"; //Hide modal once file selected
    if(onboarding){
        document.getElementById('onboarding-3').style.display = "block";
    }
};
//Importing Example BibTex
export function importExampleBibTex(){
    let url = window.location.href+'examples/exampleBibTex.bib'
    fetch(url).then((resp) => resp.text()).then((data)=> {
            var papers = bibtexParse.toJSON(data);
            let newPapers = papers.filter(p=>p.entryTags.doi).map(p=>{
                return {doi: p.entryTags.doi,seed:true}
            })
            newPapers = updatePapers(newPapers);
            makeSeed(newPapers);
        }
    )
}