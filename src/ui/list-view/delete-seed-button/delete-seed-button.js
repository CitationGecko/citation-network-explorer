import { selectedPapers } from "ui/network-view";
import { deleteSeed } from "core";

document.getElementById('delete-seed').onclick = function(){
    selectedPapers.filter(p=>p.seed).forEach(deleteSeed)
}

/* document.addEventListener('keydown', (event) => {
    if(event.key == 'Delete' || event.key == 'Backspace'){
        selectedPapers.filter(p=>p.seed).forEach(deleteSeed)
    };
}); */