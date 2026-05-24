(function () {
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('mobOverlay');

function closeSidebar() {
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
}

function showSection(button) {
  document.querySelectorAll('.nav-btn').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.menu-section').forEach((section) => section.classList.remove('active'));
  document.getElementById(button.dataset.sectionTarget)?.classList.add('active');
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-section-target]');
  if (button) showSection(button);
});

document.getElementById('mobToggle')?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
});

overlay?.addEventListener('click', closeSidebar);

window.__mazenMenuReady = true;
})();
