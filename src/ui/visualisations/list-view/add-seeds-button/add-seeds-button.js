import * as d3 from 'vendor/d3.v4.js'
// When the user clicks on the button, open the modal
document.getElementById("add-seeds-button").onclick = function() {
    document.getElementById('add-seeds-modal').style.display = "block";
}

d3.selectAll(".pick-again").on('click', function() {
    document.getElementById('import-coming-soon').style.display = "none";
    document.getElementById('add-seeds-modal').style.display = "block";
})