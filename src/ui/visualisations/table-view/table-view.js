import * as d3 from 'vendor/d3.v4.js'
import { updatePapers } from 'core'
import { makeSeed } from '../../../core';

export function printTable(tableID,items){

    d3.select(tableID).select('tbody').selectAll('tr').remove()

    var row = d3.select(tableID).select('tbody').selectAll('tr').data(items).enter()
                .append('tr')
                .classed('table-item',true)

    row.append('td')
        .classed('table-cell table-check',true)
        .append('input')
        .classed('item-select',true)
        .attr('type','checkbox')
        .data(items)                    

    row.append('td')
        .text(item=>item.title || 'n.a')
        .classed('table-cell table-title',true)
        
    row.append('td')
        .text(item=> item.author)
        .classed('table-cell table-author',true)

    row.append('td')
        .text(item=> item.year)
        .classed('table-cell table-year',true)
    
    row.append('td')
        .text(item=>item.journal)
        .classed('table-cell table-journal',true)

    document.querySelector(`${tableID} .select-all`).onclick = (a)=>{
        var checked = document.querySelector(`${tableID} .select-all`).checked;
    
        if(checked){
            document.querySelectorAll(`${tableID} .item-select`).forEach(e=>e.checked=true)
        } else {
            document.querySelectorAll(`${tableID} .item-select`).forEach(e=>e.checked=false)
        }
    }
    
    d3.select(`${tableID} .add-selected-items`).on('click',()=>{
        var papers = d3.selectAll(`${tableID} .item-select:checked`).data()
        updatePapers(papers)
        makeSeed(papers)
    })
}