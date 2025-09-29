export function initThemeToggle() {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", savedTheme === "dark");
    }
  }
  if (!themeToggle) return;
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggle.setAttribute("aria-pressed", String(next === "dark"));
  });
}
