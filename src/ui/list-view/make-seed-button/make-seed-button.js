import * as d3 from 'vendor/d3.v4.js'
import { makeSeed } from 'core'

d3.select('#make-seed-button').on('click',()=>{
    var selectedPapers = d3.selectAll('.selected-paper').data()
    makeSeed(selectedPapers)
})