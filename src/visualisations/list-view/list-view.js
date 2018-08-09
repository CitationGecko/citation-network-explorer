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
            var paperbox = d3.select('#seed-paper-container').selectAll('.outer-paper-box')
                            .data(seedpapers,function(d){return d.ID})
            paperbox.exit().remove()
            var oldpapers = d3.select('#seed-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
            oldpapers.select('.paper-title').html(function(p){
                return(p.title)
            })
            oldpapers.select('.metric').html(function(p){
                return(p[metric]?p[metric]:'0')
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' '+p.year}else{return(p.year)}
            })
            oldpapers.select('.doi-link').html(function(p){
                return("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>")
            })
            paperbox = paperbox.enter()
                .append('div')
                .attr('class','outer-paper-box panel')
            paperbox = paperbox.append('div')
                .attr('class','inner-paper-box panel')
                .on('click',forceGraph.highlightNode)
            paperbox.append('p').attr('class','paper-title')
                .html(function(p){
                    return(p.title)
                })
            paperbox.append('p').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' '+p.year}else{return(p.year)}
                })
            paperbox.append('p').attr('class','doi-link')
                .html(function(p){
                    return("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>")
                })          
        }
    }
})

newModule('connectedList',{
    eventResponses:{
        newEdges:{
            listening: true,
            action: function(){
                connectedList.print(forceGraph.sizeMetric,1)
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
                d3.select('#connected-paper-container').selectAll('.outer-paper-box').remove();
            }
            let paperboxes = d3.select('#connected-paper-container').selectAll('.outer-paper-box')
                             .data(nonSeeds,function(d){return d.ID});
                             //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
            paperboxes.exit().remove();
        
            oldpapers = d3.select('#connected-paper-container').selectAll('.outer-paper-box').select('.inner-paper-box')
            oldpapers.select('.paper-title').html(function(p){
                return(p.title)
            })
            oldpapers.select('.metric').html(function(p){
                return(p[metric]?p[metric]:'0')
            })
            oldpapers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' '+p.year}else{return(p.year)}
            })
            oldpapers.select('.doi-link').html(function(p){
                return("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>")
            })
            newpapers = paperboxes.enter()
                .append('div')
                .attr('class','outer-paper-box panel')
            newpapers = newpapers.append('div')
                .attr('class','inner-paper-box panel')
                .on('click',forceGraph.highlightNode)
            newpapers.append('p').attr('class','paper-title')
                .html(function(p){
                    return(p.title)
                })
            newpapers.append('p').attr('class','metric')
                .html(function(p){
                    return(p[metric]?p[metric]:'')
                })
            newpapers.append('p').attr('class','author-year')
                .html(function(p){
                    if(p.author) {return p.author+' '+p.year}else{return(p.year)}
                })
            newpapers.append('p').attr('class','doi-link')
                .html(function(p){
                    return("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>")
                })
        
            d3.select('#more-button').remove();
            d3.select('#connected-paper-container').append('div')
                .html('<button id="more-button" class = "button1">more...</button>')
                .attr('onclick','connectedList.print("'+metric+'",'+(pageNum+1)+')')   
        }
    }
})