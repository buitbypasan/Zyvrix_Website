const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function shouldForceHttps() {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  if (protocol !== "http:") return false;
  if (LOCAL_HOSTS.has(hostname)) return false;
  return Boolean(window.location.host);
}

function redirectToHttps() {
  const { location } = window;
  const httpsUrl = `https://${location.host}${location.pathname}${location.search}${location.hash}`;
  try {
    location.replace(httpsUrl);
    return true;
  } catch (error) {
    return false;
  }
}

export function enforceSecurePaymentContext() {
  if (typeof window === "undefined") return;
  if (window.isSecureContext || shouldForceHttps() === false) return;
  const redirected = redirectToHttps();
  if (redirected) return;
  const gatewayStatus = document.getElementById("gatewayStatus");
  if (!gatewayStatus) return;
  gatewayStatus.classList.add("callout--warning");
  gatewayStatus.textContent =
    "Card autofill requires a secure HTTPS connection. Reload this page over https to continue.";
}
