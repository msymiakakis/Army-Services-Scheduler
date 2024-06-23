// Code for fetching data and managing functionality

// Function to display soldier calendar
function displaySoldierCalendar(soldierId) {
  // Implement displaying soldier's calendar
  console.log("Displaying calendar for soldier with ID:", soldierId);
}

// Function to display service calendar
function displayServiceCalendar(serviceId) {
  // Implement displaying service's calendar
  console.log("Displaying calendar for service with ID:", serviceId);
}

// Function to optimize service assignments
function optimizeAssignments() {
  // Implement assignment optimization algorithm
  console.log("Optimizing assignments...");
}

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    link.addEventListener("click", function (e) {});
  });
});

// Function to show the popup
function showLocalStoragePopup() {
  document.getElementById("localStoragePopup").classList.add("show");
}

// Function to close the popup
function closeLocalStoragePopup() {
  document.getElementById("localStoragePopup").classList.remove("show");
}

// Check if user has previously accepted local storage usage
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("localStorageConsent")) {
    showLocalStoragePopup();
  }
});

// Function to handle user accepting local storage usage
function acceptLocalStorageUsage() {
  localStorage.setItem("localStorageConsent", "true");
  closeLocalStoragePopup();
}
