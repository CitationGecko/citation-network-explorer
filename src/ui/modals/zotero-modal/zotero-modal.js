import { filterCollections } from 'integrations/zotero'

function dropdown(){
    document.getElementById("zoteroDropdown").classList.toggle("show");
};

document.querySelector('.dropbtn').onclick = dropdown;

document.querySelector('#zoteroInput').onkeyup = filterCollections;