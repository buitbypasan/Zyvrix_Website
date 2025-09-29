// Handle the mobile navigation drawer without duplicating markup across pages.
export function initMobileNav() {
  const toggle = document.getElementById("mobileNavToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (!toggle || !mobileNav) return;
  const closeNav = () => {
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("hidden", "hidden");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };
  const openNav = () => {
    mobileNav.classList.add("is-open");
    mobileNav.removeAttribute("hidden");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };
  closeNav();
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeNav();
    } else {
      openNav();
      const firstLink = mobileNav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });
  mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a") || event.target === mobileNav) {
      closeNav();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeNav();
    }
  });
}
