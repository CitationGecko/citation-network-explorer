var onboarding = true;

document.addEventListener('DOMContentLoaded', function() {
  const hasViewedOnboarding = Cookies.get('viewed-onboarding');
  if(hasViewedOnboarding !== 'false') {
    showOnboardingModal();
  }
});


function showOnboardingModal() {
    document.getElementById('onboarding-1').style.display = 'block';
    Cookies.set('viewed-onboarding', 'true');
}

function showAddInitialSeed() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'block';
  document.getElementById('onboarding-3').style.display = 'none';
}

function showSeedType() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'none';
  document.getElementById('onboarding-3').style.display = 'block';
}

d3.selectAll('.cited-by-mode').on('click',function(){
  document.getElementById("mode-toggle").checked = false;
  forceGraph.mode = 'ref';
  forceGraph.refresh()
  connectedList.print(forceGraph.sizeMetric,1,true)
  onboarding = false;
  document.getElementById('onboarding-3').style.display = 'none';
  document.getElementById('onboarding-4').style.display = 'block';
})

d3.selectAll('.citing-mode').on('click',function(){
  document.getElementById("mode-toggle").checked = true;
  forceGraph.mode = 'citedBy';
  forceGraph.refresh()
  connectedList.print(forceGraph.sizeMetric,1,true)
  onboarding = false;
  document.getElementById('onboarding-3').style.display = 'none';
  document.getElementById('onboarding-4').style.display = 'block';
})

document.getElementById('lets-go').onclick = function(){
  document.getElementById('onboarding-4').style.display = "none";
}