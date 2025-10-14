// Basic interactive logic: carousel, nav mobile open/close, year
document.addEventListener("DOMContentLoaded", function () {
  // Set footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // mobile menu toggles
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenu = document.getElementById("closeMenu");
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.remove("hidden");
    mobileMenu.setAttribute("aria-hidden", "false");
  });
  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    mobileMenu.setAttribute("aria-hidden", "true");
  });

  // carousel functionality
  const slides = Array.from(document.querySelectorAll('.carousel .slide'));
  let idx = 0;
  const show = i => {
    slides.forEach((s, j) => s.classList.toggle('show', j === i));
  };
  show(idx);
  // auto rotate
  let auto = setInterval(() => { idx = (idx + 1) % slides.length; show(idx); }, 6000);

  // prev/next buttons
  document.querySelector('.carousel-prev').addEventListener('click', () => { clearInterval(auto); idx = (idx-1+slides.length)%slides.length; show(idx); auto = setInterval(()=>{ idx=(idx+1)%slides.length; show(idx);},6000);});
  document.querySelector('.carousel-next').addEventListener('click', () => { clearInterval(auto); idx = (idx+1)%slides.length; show(idx); auto = setInterval(()=>{ idx=(idx+1)%slides.length; show(idx);},6000);});
});
