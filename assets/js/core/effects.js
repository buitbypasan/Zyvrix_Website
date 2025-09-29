export function initScrollReveal() {
  const revealables = Array.from(document.querySelectorAll(".js-reveal"));
  if (!revealables.length) return;

  const show = (el) => {
    if (!el.classList.contains("is-visible")) {
      el.classList.add("is-visible");
    }
  };

  if (!("IntersectionObserver" in window)) {
    revealables.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  revealables.forEach((el) => observer.observe(el));

  // Ensure sections already in view after hydration are revealed immediately.
  requestAnimationFrame(() => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    revealables.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
        show(el);
        observer.unobserve(el);
      }
    });
  });
}

export function initHeaderScrollEffect() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}
