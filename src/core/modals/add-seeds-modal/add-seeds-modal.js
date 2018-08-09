     
    document.getElementById("add-by-doi").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('doi-input-modal').style.display = "block";
    }
    document.getElementById("search-by-title").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('title-input-modal').style.display = "block";
    }
    document.getElementById("upload-bibtex").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('upload-bibtex-modal').style.display = "block";
    } 

   