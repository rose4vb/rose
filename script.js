const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

const logo = document.querySelector('.logo');
const menu = document.querySelector('.menu');

logo.addEventListener('click', () => {
  menu.classList.toggle('show');
});




