import { getItems } from 'integrations/zotero'
import * as d3 from 'vendor/d3.v4.js'


document.querySelector('.dropbtn').onclick = dropdown;
document.querySelector('#zoteroInput').onkeyup = filterCollections;

function dropdown(){
    document.getElementById("zoteroDropdown").classList.toggle("hide");
};

function filterCollections(){
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
                    document.getElementById("zoteroDropdown").classList.toggle("hide")
                    console.log(`adding papers from collection ${c.key}`)
                    getItems(c.key)
                })
};