import * as d3 from 'vendor/d3.v4.js'
import { addItems } from 'integrations/zotero'

d3.select('#export-button').on('click',()=>{
    document.getElementById('coming-soon').style.display = "block";
})
/* d3.select('#export-button').on('click',()=>{
    var selectedPapers = d3.selectAll('.selected-paper').data()
    addItems(selectedPapers);
})
 */
