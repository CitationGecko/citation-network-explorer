import * as d3 from 'vendor/d3.v4.js'
import { linkoutIcon } from 'ui/icons'
import {forceGraph} from 'ui/visualisations/network-view'
import {deleteSeed,makeSeed} from 'core'

//Functions for paper details panel
export function updateInfoBox(p){
    document.getElementById('selected-paper-box').style.display ='block';
    var paperbox = d3.select('#selected-paper-box');
    paperbox.select('.paper-title').html(`${p.title}<a target='_blank' href='https://doi.org/${p.doi}'>${linkoutIcon}</a>`)
    paperbox.select('.author-year').html((p.author ? p.author:'')+' ('+p.year+')')
    paperbox.select('.journal').html(p.journal)
    paperbox.select('.add-seed').html(p.seed ? 'Delete Seed':'Add as seed')
            .on('click', function(){p.seed ? deleteSeed(p) : makeSeed([p])})
    forceGraph.selectednode = p;
}
