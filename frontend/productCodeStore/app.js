const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const header = document.querySelector('.site-header');
const form = document.querySelector('#contact-form');
const formMessage = document.querySelector('#form-message');
const year = document.querySelector('#year');

function closeMenu() {
  menuButton.classList.remove('open');
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
    closeMenu();
  }
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

const savedTheme = localStorage.getItem('brightside-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(savedTheme || preferredTheme);

themeButton.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme;
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('brightside-theme', nextTheme);
});

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 12);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailInput = form.querySelector('#email');

  if (!emailInput.checkValidity()) {
    formMessage.textContent = 'Please enter a valid email address.';
    emailInput.focus();
    return;
  }

  const submitButton = form.querySelector('button');
  submitButton.disabled = true;
  submitButton.textContent = 'Sent ✓';
  formMessage.textContent = `Thanks! We’ll be in touch at ${emailInput.value}.`;
  form.reset();

  window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Let\'s talk <span aria-hidden="true">→</span>';
  }, 3000);
});

year.textContent = new Date().getFullYear();