import {titleSearch} from 'data-sources/crossref'

var titleQuery; //Place holder for the user input field.
//Update request based on title query inputted by the user.
var titleInput = document.querySelector("#title-input").addEventListener("input", function() {
    titleQuery = this.value;
});

document.getElementById("title-input").onkeydown = function(event){
    if (event.keyCode == 13){

        //start loading wheel
        document.getElementById('title-input-loader').style.display = 'inline-block';
        titleSearch(titleQuery).then(()=>{
            //stop loading wheel       
            document.getElementById('title-input-loader').style.display = 'none';
        })
    }
}