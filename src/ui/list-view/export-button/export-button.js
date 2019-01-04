import * as d3 from 'vendor/d3.v4.js'
import { addItems } from 'integrations/zotero'
import { exportBibtex } from 'integrations/bibtex'
import { Papers } from 'core'

d3.select('#save-session').on('click',()=>{
    exportBibtex('GeckoSession.bib',Papers.filter(p=>p.seed))
    //document.getElementById('coming-soon').style.display = "block";
})

d3.select('#export-button').on('click',()=>{
    exportBibtex('GeckoPapers.bib',Papers)
    //document.getElementById('coming-soon').style.display = "block";
})
/* d3.select('#export-button').on('click',()=>{
    var selectedPapers = d3.selectAll('.selected-paper').data()
    addItems(selectedPapers);
})
 */
