// =========================
// GLOBAL STATE
// =========================
let currentUser = null;


// =========================
// NAVIGATION FUNCTION
// =========================
function navigateTo(hash) {
  window.location.hash = hash;
}


// =========================
// ROUTING HANDLER
// =========================
function handleRouting() {

  const hash = window.location.hash || "#/";

  // Hide all pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  // Determine page ID
  let pageId = hash.replace("#/", "");
  if (pageId === "") pageId = "home";

  let pageElement = document.getElementById(`${pageId}-page`);

  if (!pageElement) {
    pageElement = document.getElementById("home-page");
  }

  // =========================
  // PROTECTED ROUTES
  // =========================

  const protectedRoutes = [
    "profile",
    "requests",
    "employees",
    "departments",
    "accounts"
  ];

  // If not logged in → redirect
  if (protectedRoutes.includes(pageId) && !currentUser) {
    return navigateTo("#/login");
  }

  // If not admin → block admin routes
  const adminRoutes = [
    "employees",
    "departments",
    "accounts"
  ];

  if (adminRoutes.includes(pageId) && currentUser?.role !== "admin") {
    return navigateTo("#/");
  }

  // Show selected page
  pageElement.classList.add("active");
}


// =========================
// EVENTS
// =========================
window.addEventListener("hashchange", handleRouting);

// Default route on load
if (!window.location.hash) {
  window.location.hash = "#/";
}

// Initialize
handleRouting();
