var modalPage = 1;

document.addEventListener('DOMContentLoaded', function() {
  const hasViewedOnboarding = Cookies.get('viewed-onboarding');
  if(hasViewedOnboarding !== 'false') {
    showOnboardingModal();
  }
});


function showOnboardingModal() {
    document.getElementById('onboarding-modal').style.display = 'block';
    Cookies.set('viewed-onboarding', 'true');
}

function showAddInitialSeed() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'block';
  document.getElementById('onboarding-4').style.display = 'none';
}

function showSeedType() {
  document.getElementById('onboarding-1').style.display = 'none';
  document.getElementById('onboarding-2').style.display = 'none';
  document.getElementById('onboarding-4').style.display = 'block';
}

function startDemo() {
  document.getElementById('onboarding-modal').style.display = 'none';
  bibtex.importExampleBibTex();
}

