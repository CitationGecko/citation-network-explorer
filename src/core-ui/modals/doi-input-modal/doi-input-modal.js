var doiQuery; //Place holder for the user input field.

//Update request based on doi query inputted by the user.
var doiInput = document.querySelector("#doi-input").addEventListener("input",function(){
    doiQuery=this.value;
});

document.getElementById("doi-input").onkeydown = function(event){
    if (event.keyCode == 13){   
        makeSeed(addPaper({DOI:doiQuery}))
        document.getElementById('doi-input-loader').style.display = 'inline-block';
    }
}