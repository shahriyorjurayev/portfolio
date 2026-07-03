document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  initHeaderScroll();
  initMobileMenu();
  initScrollSpy();
  initScrollReveal();
  initCounters();
  initContactRotator();
  initAchievements();
  initProjectsMarquee();
});

/**
 * Duplicates a marquee track's items into two identical, back-to-back halves
 * that each cover at least the container width. Combined with a `translateX(-50%)`
 * keyframe this guarantees a seamless loop with no gap, regardless of how few
 * source items there are or how wide the viewport is.
 */
function buildSeamlessMarquee(track, resetSource) {
  if (!track) return;
  if (resetSource || !track._marqueeSource) {
    track._marqueeSource = Array.from(track.children).map((el) => el.cloneNode(true));
  }
  const baseItems = track._marqueeSource;
  if (!baseItems.length) return;

  const containerWidth = (track.parentElement || track).getBoundingClientRect().width || window.innerWidth;

  track.innerHTML = "";
  let i = 0;
  while (track.scrollWidth < containerWidth || i % baseItems.length !== 0) {
    track.appendChild(baseItems[i % baseItems.length].cloneNode(true));
    i++;
  }

  Array.from(track.children).forEach((el) => track.appendChild(el.cloneNode(true)));
}

function initHeaderScroll() {
  const header = document.getElementById("header");
  const progressBar = document.getElementById("progressBar");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });
}

function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("mainNav");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("open");
  });

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      nav.classList.remove("open");
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("data-section") === id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll(".counter");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initContactRotator() {
  const el = document.getElementById("contactRotator");
  const prefixEl = document.getElementById("contactPrefix");
  const suffixEl = document.getElementById("contactSuffix");
  if (!el) return;

  let currentLang = localStorage.getItem("portfolio-lang") || "uz";
  let idx = 0;

  function renderStatic() {
    const dict = translations[currentLang] || translations.uz;
    prefixEl.textContent = dict.contactPrefix || "";
    suffixEl.textContent = dict.contactSuffix || "";
  }

  function renderWord() {
    const list = (translations[currentLang] && translations[currentLang].contactRotate) || translations.uz.contactRotate;
    el.textContent = list[idx % list.length];
    el.classList.remove("fade-swap");
    void el.offsetWidth;
    el.classList.add("fade-swap");
    idx++;
  }

  renderStatic();
  renderWord();
  setInterval(renderWord, 2600);

  document.addEventListener("langchange", (e) => {
    currentLang = e.detail;
    idx = 0;
    renderStatic();
    renderWord();
  });
}

const ACHIEVEMENT_ICONS = [
  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
];

function initAchievements() {
  const track = document.getElementById("achievementsTrack");
  if (!track) return;

  function render(lang) {
    const list = (translations[lang] && translations[lang].achievements) || translations.uz.achievements;
    track.innerHTML = list
      .map((text, i) => {
        const iconPath = ACHIEVEMENT_ICONS[i % ACHIEVEMENT_ICONS.length];
        return `<span class="achievements__chip"><svg class="icon-inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg> ${text}</span>`;
      })
      .join("");
    buildSeamlessMarquee(track, true);
  }

  render(localStorage.getItem("portfolio-lang") || "uz");
  document.addEventListener("langchange", (e) => render(e.detail));
}

function initProjectsMarquee() {
  const track = document.getElementById("projectsTrack");
  if (!track) return;

  buildSeamlessMarquee(track);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => buildSeamlessMarquee(track), 300);
  });
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString("en-US") + (progress >= 1 ? suffix : "");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
