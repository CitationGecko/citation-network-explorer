/* d3.select('#add-seeds-modal').select('div').append('button').attr('id','add-by-zotero')
    .html("<img id='zotero-square' src='images/zotero/zotero2.png'>")

document.getElementById("add-by-zotero").onclick = function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('zotero-modal').style.display = "block";
    if(!zotero.status){
        zotero.getCollections();
    }
}

var modal = d3.select('body').append('div').attr('id','zotero-modal').attr('class','modal')
    .append('div').attr('class','modal-content')
    
    modal.append('div').html("<img id='zotero-logo' src='images/zotero/zotero-logo.png'>");
    modal.append('svg').attr('id','zotero-collections'); */

document.querySelector('#zoteroSelectAll').onclick = (a)=>{
    var checked = document.querySelector('#zoteroSelectAll').checked;

    if(checked){
        document.querySelectorAll('#zotero-items .item-select').forEach(e=>e.checked=true)
    } else {
        document.querySelectorAll('#zotero-items .item-select').forEach(e=>e.checked=false)
    }
}

d3.select('#add-zotero-items').on('click',()=>{
    var papers = d3.selectAll('#zotero-items .item-select:checked').data()
    papers.forEach(paper=>{
        addPaper(paper,true);
    });
})

var zotero = {
    selectedItems: [],
    status: false,
    dropdown: function(){
        document.getElementById("zoteroDropdown").classList.toggle("show");
    },
    filterCollections: function(){
        var input, filter, ul, li, a, i;
        input = document.getElementById("zoteroInput");
        filter = input.value.toUpperCase();
        div = document.getElementById("zoteroDropdown");
        a = div.getElementsByTagName("div");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
            } else {
            a[i].style.display = "none";
            }
        }
    },
    getCollections: function(){

        let url = 'http://localhost:3000/services/zotero/getCollections'

        fetch(url).then(resp => {
            console.log('response from Zotero!');
            resp.json().then(json=>{
                zotero.totalCollections = json.data.length
                zotero.status = true;
                zotero.collections = json.data;
                zotero.displayCollections(zotero.collections)
            })
        })
    },

    parseCollectionTree: function(collections){

        var tree=[];
        var parents = collections.filter(function(c){
            return(!c.data.parentCollection)
        })

        let getChildren = function(collections,ID){

            let children = collections.filter(function(c){
                return(c.data.parentCollection==ID)
            }).map(function(c){
                return({
                    name: c.data.name,
                    children: getChildren(collections,c.key),
                    key: c.key
                })
            })

            return(children)

        }

        for(var i=0;i<parents.length;i++){
            tree.push({
                name: parents[i].data.name,
                children: getChildren(collections,parents[i].key),
                key: parents[i].key
            })
        }

        return({
            name:'All Collections',
            children: tree
        })


    },

    displayCollections: function(collections){

        d3.select('#zoteroDropdown')
            .selectAll('a')
                .data(collections)
                .enter()
                    .append('div')
                    .attr('class','dropdown-item')
                    .text(c=>c.name)
                    .on('click',c=>{
                        d3.select('.dropbtn').html(`<img src='/images/zotero/zotero-collection.png'>${c.name}`)
                        document.getElementById("zoteroDropdown").classList.toggle("show")
                        console.log(`adding papers from collection ${c.key}`)
                        zotero.getItems(c.key)
                    })
    },

    getItems: function(collectionID){
        
        let url = `http://localhost:3000/services/zotero/getItemsInCollection/?collectionId=${collectionID}`;
        
        fetch(url).then(resp=>resp.json()).then(json=>{

            var items = json.data.map(a=>{
                let item = a.data
                return({
                    title: item.title,
                    author: item.creators.length>0 ? item.creators[0].lastName : 'n.a',
                    year: (new Date(item.date)).getFullYear(),
                    journal: item.journalAbbreviation || item.journal,
                    doi:item.DOI
                })
            })

            printTable('#zotero-items',items)
        })
    },

    addItem: function(paper,collection){
        let url = 'https://api.zotero.org/items/new?itemType=journalArticle'
        fetch(url).then(resp=>resp.json()).then(template=>{

            template.DOI = paper.doi
            template.title = paper.title
            template.publicationTitle = paper.journal
            template.date = paper.year
            template.creators[0].lastName = paper.author
            template.collections = [zotero.collection]

            let endpoint = 'https://api.zotero.org/users/' + ZOTERO_USER_ID + '/items'
            fetch(endpoint,{
                method: 'post',
                headers:{'Zotero-API-Key': ZOTERO_USER_API_KEY},
                body:JSON.stringify([template])
            }).then(resp=>resp.json()).then(r=>console.log(r))  
        }) 
    }
}