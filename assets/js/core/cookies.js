export function initCookieBanner() {
  const cookieBanner = document.getElementById("cookieBanner");
  const openCookie = document.getElementById("openCookie");
  const consent = localStorage.getItem("cookieConsent");
  const showCookie = () => {
    if (cookieBanner) cookieBanner.style.display = "flex";
  };
  const hideCookie = () => {
    if (cookieBanner) cookieBanner.style.display = "none";
  };
  if (!consent) showCookie();
  if (openCookie) {
    openCookie.addEventListener("click", (event) => {
      event.preventDefault();
      showCookie();
    });
  }
  if (cookieBanner) {
    cookieBanner.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-cookie]");
      if (!btn) return;
      localStorage.setItem("cookieConsent", btn.getAttribute("data-cookie"));
      hideCookie();
    });
  }
}
