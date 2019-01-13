import {crossrefSearch} from 'data-sources/crossref'

var query;

//Update request based on title query inputted by the user.
document.querySelector("#title-input").addEventListener("input", function() {
    query = this.value;
});

document.getElementById("title-input").onkeydown = function(event){
    if (event.keyCode == 13){

        //start loading wheel
        document.getElementById('title-input-loader').style.display = 'inline-block';
        crossrefSearch(query).then(()=>{
            //stop loading wheel       
            document.getElementById('title-input-loader').style.display = 'none';
        })
    }
}