// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        if(onboarding){
            document.getElementById('onboarding-3').style.display = "block";
        }
    }
}