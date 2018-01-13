//For threshold slider

    function updateThreshold(val) {
        document.querySelector('#thresholdOutput').value = val;
    }

//For addSeedModal


    // When the user clicks on the button, open the modal
    document.getElementById("addSeeds").onclick = function() {

        document.getElementById('addSeedModal').style.display = "block";
    }
   
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == document.getElementById('addSeedModal')) {
            event.target.style.display = "none";
        }
    } 

//For Seed Papers Side bar
document.getElementById('collapseBar').onclick = hideSideBar;

function hideSideBar(){

    document.getElementById('toCollapse').style.display='none';

}