import { eventResponse, Papers } from "core";
import { forceGraph, highlightNode } from 'ui/visualisations/network-view'
import * as d3 from 'vendor/d3.v4.js'
import { linkoutIcon } from 'ui/icons'

export const seedList = {}
export const connectedList = {}

eventResponse(true,'newEdges',function(){
    connectedList.print(forceGraph.sizeMetric,1,true)
})
eventResponse(true,'paperUpdate',function(){
    connectedList.print(forceGraph.sizeMetric,1)
})
eventResponse(true,'seedUpdate',function(){
    seedList.refresh()
})
eventResponse(true,'newSeed',function(){
    seedList.refresh()
})
eventResponse(true,'seedDeleted',function(){
    seedList.refresh()
    connectedList.print(forceGraph.sizeMetric,1)
})

seedList.refresh = function(){
    var seedpapers = Papers.filter(function(p){return p.seed});
    var paperboxes = d3.select('#seed-paper-container').selectAll('.paper-box')
        .data(seedpapers,function(d){return d.ID})
    paperboxes.exit().remove()    
    var newpapers = paperboxes.enter()
        .append('div')
        .attr('class','paper-box')
        .on('click',function(p){
            highlightNode(p,forceGraph);
            d3.selectAll('.paper-box').classed('selected-paper',false)
            d3.select(this).classed('selected-paper',true)
        })
    newpapers.append('div').attr('class','paper-title')
    newpapers.append('div').attr('class','author-year')
    newpapers.append('div').attr('class','journal')
    
    paperboxes = newpapers.merge(paperboxes)
    paperboxes.select('.paper-title').html(function(p){
        return(`${p.title}<a target='_blank' href='https://doi.org/${p.doi}'>${linkoutIcon}</a>`)
    })
    paperboxes.select('.author-year').html(function(p){
        if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
    })
    paperboxes.select('.journal').html(function(p){
        if(p.journal) {return p.journal}else{return('')}
    })
};

connectedList.print = function(metric,pageNum,replot){
    let pageSize = 100;
    let nonSeeds = Papers.filter(function(p){return(!p.seed)}).sort((a,b)=>b[metric]-a[metric]).slice(0,pageNum*pageSize)
    //Select all non-seeds and sort by metric.
    //Clear old table
    if(replot){
        d3.select('#connected-paper-container').selectAll('.paper-box').remove();
    }
    let paperboxes = d3.select('#connected-paper-container').selectAll('.paper-box')
        .data(nonSeeds,function(d){return d.ID});
    
    paperboxes.exit().remove();
    var newpapers = paperboxes.enter()
        .append('div')
        .attr('class','paper-box')
        .on('click',function(p){
            highlightNode(p,forceGraph)
            d3.selectAll('.paper-box').classed('selected-paper',false)
            d3.select(this).classed('selected-paper',true)
            d3.select('#make-seed').on('click',function(){makeSeed([p])})
        })
    newpapers.append('div').attr('class','paper-title')
    newpapers.append('div').attr('class','author-year')  
    newpapers.append('div').attr('class','metric')
    newpapers.append('div').attr('class','journal')

    paperboxes = newpapers.merge(paperboxes)
    paperboxes.select('.paper-title').html(function(p){
        return(`${p.title}<a target='_blank' href='https://doi.org/${p.doi}'>${linkoutIcon}</a>`)
    })
    paperboxes.select('.metric').html(function(p){
        if(!p[metric]){return('')}  
        if(metric=='seedsCitedBy'){
            return('cited by <span class="metric-count">'+p[metric]+'</span> seed papers')
        } 
        if(metric=='seedsCited'){
            return('cites <span class="metric-count">'+p[metric]+'</span> seed papers')
        }
    })
    paperboxes.select('.author-year').html(function(p){
        if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
    })
    paperboxes.select('.journal').html(function(p){
        if(p.journal) {return p.journal}else{return('')}
    })

    d3.select('#more-button').remove();
    d3.select('#connected-paper-container')
        .append('div')
        .append('button')
        .attr('id',"more-button")
        .attr('class',"button1")
        .text('more...')
        .on('click',()=>connectedList.print(metric,pageNum+1))
};
