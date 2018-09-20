import {forceGraph} from 'ui/network-view'
import {connectedList} from 'ui/list-view'
import { importExampleBibTex } from 'integrations/bibtex'
import * as d3 from 'vendor/d3.v4.js'

export var onboarding = {complete:false};

document.addEventListener('DOMContentLoaded', function() {
  const hasViewedOnboarding = false ;//Cookies.get('viewed-onboarding');
  if(hasViewedOnboarding !== 'false') {
    showOnboardingModal();
  }
});

function showOnboardingModal() {
    document.getElementById('onboarding-1').style.display = 'block';
    //Cookies.set('viewed-onboarding', 'true');
}

export function showAddInitialSeed() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'block';
  document.getElementById('onboarding-3').style.display = 'none';
}

document.querySelector('#start-discovery').onclick = showAddInitialSeed;
document.querySelector('.pick-again').onclick = showAddInitialSeed;
document.querySelector('#demo-button').onclick = ()=>{
  importExampleBibTex();
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-3').style.display = "block";
}


function showSeedType() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'none';
  document.getElementById('onboarding-3').style.display = 'block';
}

d3.selectAll('.cited-by-mode').on('click',function(){
  document.getElementById("mode-toggle").checked = false;
  forceGraph.mode = 'ref';
  forceGraph.filterEdges()
  connectedList.print(forceGraph.sizeMetric,1,true)
  onboarding.complete = true;
  document.getElementById('onboarding-3').style.display = 'none';
  document.getElementById('onboarding-4').style.display = 'block';
})

d3.selectAll('.citing-mode').on('click',function(){
  document.getElementById("mode-toggle").checked = true;
  forceGraph.mode = 'citedBy';
  forceGraph.filterEdges();
  connectedList.print(forceGraph.sizeMetric,1,true)
  onboarding.complete = true;
  document.getElementById('onboarding-3').style.display = 'none';
  document.getElementById('onboarding-4').style.display = 'block';
})

document.getElementById('lets-go').onclick = function(){
  document.getElementById('onboarding-4').style.display = "none";
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
      event.target.style.display = "none";
      if(!onboarding.complete){
          document.getElementById('onboarding-3').style.display = "block";
      }
  }
}