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
            paperbox.append('button').attr('class','delete-seed')
                .html('<i class="fa fa-times" color="red" aria-hidden="true"></i>')
                .on('click',function(p){deleteSeed(p)})
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
                connectedList.refresh()
            }
        },
        paperUpdate:{
            listening: true,
            action: function(){
                connectedList.refresh()
            }
        }
    },
    methods:{
        refresh: function(){
            updateMetrics(Papers,Edges); // update citation metrics
            var nonSeeds = Papers.filter(function(p){return(!p.seed)})
            var paperbox = d3.select('#connected-paper-container').selectAll('tr')
                            .data(nonSeeds,function(d){return d.ID});
                            //.sort((a,b)=>b.seedsCitedBy<a.seedsCitedBy)
            paperbox.exit().remove();
            var papers = d3.select('#connected-paper-container').selectAll('tr').select('td').select('.inner-paper-box')
            papers.select('.paper-title').html(function(p){
                return(p.title)
            })
            papers.select('.metric').html(function(p){
                return(p[metric]?p[metric]:'0')
            })
            papers.select('.author-year').html(function(p){
                if(p.author) {return p.author+' '+p.year}else{return(p.year)}
            })
            papers.select('.doi-link').html(function(p){
                return("<a target='_blank' href='https://doi.org/"+p.doi+"'>"+p.doi+"</a>")
            })
        }
    }
})