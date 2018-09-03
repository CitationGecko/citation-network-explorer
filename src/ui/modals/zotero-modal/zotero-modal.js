import { filterCollections } from 'integrations/zotero'

function dropdown(){
    document.getElementById("zoteroDropdown").classList.toggle("hide");
};

document.querySelector('.dropbtn').onclick = dropdown;

document.querySelector('#zoteroInput').onkeyup = filterCollections;