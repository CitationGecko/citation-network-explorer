//For threshold slider

    document.getElementById('thresholdInput').oninput = function(){

        document.querySelector('#thresholdOutput').value = this.value;


    }


//For Seed Papers Side bar

    document.getElementById('collapseBar').onclick = hideSideBar;

    function hideSideBar(){

        document.getElementById('seedPapers').style.display='none';

        var icon = document.getElementById('collapse-seeds-icon');

        icon.classList.remove('fa-chevron-left');

        icon.classList.add('fa-chevron-right');

        document.getElementById('collapseBar').onclick = showSideBar;

    }

    function showSideBar(){

        document.getElementById('seedPapers').style.display='block';

        var icon = document.getElementById('collapse-seeds-icon');

        icon.classList.remove('fa-chevron-right');

        icon.classList.add('fa-chevron-left');

        document.getElementById('collapseBar').onclick = hideSideBar;

    }

//For addSeedModals

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    } 

    // When the user clicks on the button, open the modal
    document.getElementById("addSeeds").onclick = function() {

        document.getElementById('addSeedModal').style.display = "block";
    }
   
    document.getElementById("addbyDOI").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('doiInputModal').style.display = "block";
    }

    document.getElementById("doiInput").onkeydown = function(){
        
        if (event.keyCode == 13){addSeedFromDOI(doiQuery)}

    }

    document.getElementById("searchByTitle").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('titleInputModal').style.display = "block";
    }

    document.getElementById("titleInput").onkeydown = function(){
        
        if (event.keyCode == 13){}
        
    }

    document.getElementById("uploadBibTex").onclick = function() {

        document.getElementById('addSeedModal').style.display = "none";
        document.getElementById('uploadBibTexModal').style.display = "block";
    }