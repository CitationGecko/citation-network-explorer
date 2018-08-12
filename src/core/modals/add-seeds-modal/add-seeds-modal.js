    
d3.selectAll(".doi-input-button").on('click', function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('onboarding-2').style.display = "none";
    document.getElementById('doi-input-modal').style.display = "block";
})
d3.selectAll(".seed-search-button").on('click', function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('onboarding-2').style.display = "none";
    document.getElementById('import-coming-soon').style.display = "block";
})
d3.selectAll(".upload-bibtex-button").on('click', function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('onboarding-2').style.display = "none";
    document.getElementById('upload-bibtex-modal').style.display = "block";
}) 

d3.selectAll(".zotero-import-button").on('click', function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('onboarding-2').style.display = "none";
    document.getElementById('import-coming-soon').style.display = "block";
}) 
d3.selectAll(".mendeley-import-button").on('click', function() {
    document.getElementById('add-seeds-modal').style.display = "none";
    document.getElementById('onboarding-2').style.display = "none";
    document.getElementById('import-coming-soon').style.display = "block";
}) 



