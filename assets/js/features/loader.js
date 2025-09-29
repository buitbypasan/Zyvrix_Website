export function initPageLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;
  const hideLoader = () => loader.classList.add("is-hidden");
  window.addEventListener("load", () => {
    setTimeout(hideLoader, 400);
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (
      !link ||
      link.target === "_blank" ||
      link.getAttribute("download") ||
      link.hasAttribute("data-no-loader")
    ) {
      return;
    }
    loader.classList.remove("is-hidden");
  });
}
