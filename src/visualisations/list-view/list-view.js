var mysvg = '<svg class="open-icon" width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="14" fill="black" fill-opacity="0" transform="translate(0 1)"/><path class="stroke1" d="M7.5 8.5L16 1M16 1H11.5M16 1V5.5" stroke="#FFC700" stroke-width="1.8"/><path class="fill1" fill-rule="evenodd" clip-rule="evenodd" d="M9.5459 3H3C2.44727 3 2 3.44775 2 4V12C2 12.5522 2.44727 13 3 13H12C12.5527 13 13 12.5522 13 12V6.6001H15V12C15 13.6567 13.6572 15 12 15H3C1.34277 15 0 13.6567 0 12V4C0 2.34326 1.34277 1 3 1H9.5459V3Z" fill="#FFC700"/></svg>'

newModule('seedList',{
    eventResponses:{
        seedUpdate:{
            listening: true,
            action: function(){
                seedList.refresh()
            }
        },
        newSeed:{
            listening: true,
            action: function(){
                seedList.refresh()
            }
        }
    },
    methods: {
        refresh: function(){
            var seedpapers = Papers.filter(function(p){return p.seed});
            var paperboxes = d3.select('#seed-paper-container').selectAll('.paper-box')
                            .data(seedpapers,function(d){return d.ID})
            paperboxes.exit().remove()
            var oldpapers = d3.select('#seed-paper-container').selectAll('.paper-box')
            
            oldpapers.select('.paper-title').html(function(p){
                return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'>"+mysvg+"</a>")
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
            })
            oldpapers.select('.journal').html(function(p){
                if(p.journal) {return p.journal}else{return('')}
            })
        
            var newpapers = paperboxes.enter()
                .append('div')
                .attr('class','paper-box')
                .on('click',forceGraph.highlightNode)

            newpapers.append('div').attr('class','paper-title')
                .html(function(p){
                    return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'>"+mysvg+"</a>")
                })
            newpapers.append('div').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
                })  
            newpapers.append('div').attr('class','journal').html(function(p){
                    if(p.journal) {return p.journal}else{return('')}
                })   
        }
    }
})

newModule('connectedList',{
    eventResponses:{
        newEdges:{
            listening: true,
            action: function(){
                connectedList.print(forceGraph.sizeMetric,1,true)
            }
        },
        paperUpdate:{
            listening: true,
            action: function(){
                connectedList.print(forceGraph.sizeMetric,1)
            }
        }
    },
    methods:{
       
        print: function(metric,pageNum,replot){
            let pageSize = 100;
            let nonSeeds = Papers.filter(function(p){return(!p.seed)}).sort((a,b)=>b[metric]-a[metric]).slice(0,pageNum*pageSize)
            //Select all non-seeds and sort by metric.
            //Clear old table
            if(replot){
                d3.select('#connected-paper-container').selectAll('.paper-box').remove();
            }
            let paperboxes = d3.select('#connected-paper-container').selectAll('.paper-box')
                             .data(nonSeeds,function(d){return d.ID});
                             //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
            paperboxes.exit().remove();
        
            var oldpapers = d3.select('#connected-paper-container').selectAll('.paper-box')
            oldpapers.select('.paper-title').html(function(p){
                return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'>"+mysvg+"</a>")
            })
            oldpapers.select('.metric').html(function(p){
                if(!p[metric]){return('')}  
                if(metric=='seedsCitedBy'){
                    return('cited by <span class="metric-count">'+p[metric]+'</span> seed papers')
                } 
                if(metric=='seedsCited'){
                    return('cites <span class="metric-count">'+p[metric]+'</span> seed papers')
                }
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
            })
            oldpapers.select('.journal').html(function(p){
                if(p.journal) {return p.journal}else{return('')}
            })
          
            var newpapers = paperboxes.enter()
                .append('div')
                .attr('class','paper-box')
                .on('click',function(p){
                    forceGraph.highlightNode(p)
                    d3.select('#make-seed').on('click',function(){makeSeed(p)})
                })
            newpapers.append('div').attr('class','paper-title')
                .html(function(p){
                    return(p.title+"<a target='_blank' href='https://doi.org/"+p.doi+"'>"+mysvg+"</a>")
                })
            
         
            newpapers.append('div').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' ('+p.year+')'}else{return(p.year)}
                })  

            newpapers.append('div').attr('class','metric')
                .html(function(p){

                    if(!p[metric]){return('')}  
                    if(metric=='seedsCitedBy'){
                        return('cited by <span class="metric-count">'+p[metric]+'</span> seed papers')
                    } 
                    if(metric=='seedsCited'){
                        return('cites <span class="metric-count">'+p[metric]+'</span> seed papers')
                    }
                })
            newpapers.append('div').attr('class','journal').html(function(p){
                    if(p.journal) {return p.journal}else{return('')}
                })  
                
            
           
            d3.select('#more-button').remove();
            d3.select('#connected-paper-container').append('div')
                .html('<button id="more-button" class = "button1">more...</button>')
                .attr('onclick','connectedList.print("'+metric+'",'+(pageNum+1)+')')   
        }
    }
})