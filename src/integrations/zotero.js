import * as d3 from 'vendor/d3.v4.js'
import { printTable } from 'ui/visualisations/table-view'

export var zotero = {
    collections:[],
    totalCollections:0,
    status:false
};

export function filterCollections(){
    var input, filter, div, ul, li, a, i;
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
};

export function getCollections(){
    let url = '/services/zotero/getCollections'
    fetch(url).then(resp => {
        console.log('response from Zotero!');
        resp.json().then(json=>{
            zotero.totalCollections = json.data.length;
            zotero.status = true;
            zotero.collections = json.data;
            displayCollections(zotero.collections)
        })
    })
};

export function parseCollectionTree(collections){

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
};

export function displayCollections(collections){

    d3.select('#zoteroDropdown')
        .selectAll('a')
            .data(collections)
            .enter()
                .append('div')
                .attr('class','dropdown-item')
                .html(c=>`<img src='/images/zotero/zotero-collection.png'>${c.name}`)
                .on('click',c=>{
                    d3.select('.dropbtn').html(`<img src='/images/zotero/zotero-collection.png'>${c.name}`)
                    document.getElementById("zoteroDropdown").classList.toggle("show")
                    console.log(`adding papers from collection ${c.key}`)
                    getItems(c.key)
                })
};

export function getItems(collectionID){
        
    let url = `/services/zotero/getItemsInCollection/?collectionId=${collectionID}`;
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
        printTable('#zotero-import-table',items)
    })
};

export function addItem(paper, collection){
    let url = 'https://api.zotero.org/items/new?itemType=journalArticle'
    fetch(url).then(resp=>resp.json()).then(template=>{

        template.DOI = paper.doi
        template.title = paper.title
        template.publicationTitle = paper.journal
        template.date = paper.year
        template.creators[0].lastName = paper.author
        template.collections = [zotero.collection]

        let endpoint = `https://api.zotero.org/users/${ZOTERO_USER_ID}/items`
        fetch(endpoint,{
            method: 'post',
            headers:{'Zotero-API-Key': ZOTERO_USER_API_KEY},
            body:JSON.stringify([template])
        }).then(resp=>resp.json()).then(r=>console.log(r))  
    }) 
};