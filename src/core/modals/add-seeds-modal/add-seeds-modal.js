     
/*     document.getElementById("add-by-doi").onclick = function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('doi-input-modal').style.display = "block";
    } */
    d3.selectAll(".seed-search-button").on('click', function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('onboarding-modal').style.display = "none";
        document.getElementById('title-input-modal').style.display = "block";
    })
    d3.selectAll(".upload-bibtex-button").on('click', function() {
        document.getElementById('add-seeds-modal').style.display = "none";
        document.getElementById('onboarding-modal').style.display = "none";
        document.getElementById('upload-bibtex-modal').style.display = "block";
    }) 

   