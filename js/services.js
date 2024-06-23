const colors = ["#FFCCCC", "#CCFFCC", "#CCCCFF", "#FFCCFF", "#FFFFCC", "#CCFFFF", "#FF9999", "#99FF99", "#9999FF", "#FFFF99"];

// Function to save services data to local storage
function saveServices(services) {
  localStorage.setItem("services", JSON.stringify(services));
}

// Function to retrieve services data from local storage
function fetchServices() {
  const services = JSON.parse(localStorage.getItem("services"));
  if (services) {
    displayServices(services);
  } else {
    const initialServices = []; // Initialize with empty array if not available
    saveServices(initialServices);
    displayServices(initialServices);
  }
}

// Function to add a new service
function addService(newService) {
  const services = JSON.parse(localStorage.getItem("services"));

  // Check if the ID already exists
  const idExists = services.some(service => service.id === newService.id);
  if (idExists) {
    alert("Error: Service with the same ID already exists.");
    return;
  }

  // Randomly choose a color for the service
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  newService.color = randomColor;

  services.push(newService);
  saveServices(services);
  displayServices(services);
}

function removeService(serviceId) {
  serviceId = serviceId.toString();

  // Retrieve services array from local storage
  let services = JSON.parse(localStorage.getItem("services"));

  // Find the index of the service to be removed
  const index = services.findIndex(service => service.id == serviceId);

  if (index !== -1) {
    // Remove the service from the array
    services.splice(index, 1);

    // Save the updated services array to local storage
    saveServices(services);

    // Update the display of services in the UI
    displayServices(services);
  } else {
    console.log("service with ID", serviceId, "not found.");
  }
}

// Function to display services list
function displayServices(services) {
  const servicesContainer = document.getElementById("services-container");
  if (!servicesContainer) {
    console.error("Error: services-container element not found.");
    return;
  }

  servicesContainer.innerHTML = ""; // Clear previous content
  if (services && services.length > 0) {
    services.forEach(service => {
      const serviceDiv = document.createElement("div");
      serviceDiv.classList.add("service-div");
      serviceDiv.innerHTML = `<p style="margin-top: 0;">Αναγνωριστικός Αριθμός (ID): ${service.id}</p>
            <p>Υπηρεσία: ${service.name}</p>
            <p>Είδος: ${service.type == "gun" ? "Ένοπλη" : "Άοπλη"}</p>
            <label for="color-select-${service.id}"> Χρώμα:</label>
            <div class="color-selector">
                <select id="color-select-${service.id}" onchange="changeServiceColor(${service.id}, this.value)">
                    ${colors.map(color => `<option value="${color}" ${color === service.color ? "selected" : ""}>${color}</option>`).join("")}
                </select>
                <div class="color-box" style="background-color: ${service.color};"></div> <!-- Display the selected color -->
            </div>
            <p></p>
            <button onclick="removeService(${service.id})">Αφαίρεση</button>`;

      servicesContainer.appendChild(serviceDiv);
    });
  } else {
    servicesContainer.innerHTML = "<p>Δεν υπάρχουν καταχωρημένες υπηρεσίες.</p>";
  }
}

function changeServiceColor(serviceId, color) {
  // Retrieve services array from local storage
  let services = JSON.parse(localStorage.getItem("services"));

  // Check if the selected color is already assigned to another service
  const colorAlreadyExists = services.some(service => service.color === color && service.id !== serviceId);
  if (colorAlreadyExists) {
    alert("Color is already assigned to another service.");
    return; // Stop further execution
  }

  // Find the service by ID
  const service = services.find(service => service.id === serviceId);
  if (service) {
    service.color = color;
    saveServices(services);
    displayServices(services);
  } else {
    console.error("Service not found with ID:", serviceId);
  }
}

// Function to add event listeners for services page
function addServiceEventListeners() {
  // Event listener for adding a service
  const addServiceForm = document.getElementById("add-service-form");
  addServiceForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form input values
    const serviceId = document.getElementById("service-id").value;
    const serviceName = document.getElementById("service-name").value;
    const serviceType = document.getElementById("service-type").value;

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year

    // Calculate the difference in milliseconds between the two dates and convert it to days
    const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));

    // Create a new service object
    const newService = {
      id: Number(serviceId),
      name: serviceName,
      type: serviceType,
      availability: new Array(totalDaysInYear).fill(1),
      color: "",
    };

    // Add the new service
    addService(newService);

    // Clear the form fields
    addServiceForm.reset();
  });

  // Event delegation for removing a service
  const servicesContainer = document.getElementById("services-container");
  servicesContainer.addEventListener("click", function (event) {
    console.log("Clicked on services container:", event.target);
    if (event.target && event.target.matches("button.remove-service")) {
      const serviceId = event.target.dataset.id;
      console.log("Removing service with ID:", serviceId);
      removeService(serviceId);
    }
  });
}

// Call the function to add event listeners when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  fetchServices(); // Fetch services data initially
  addServiceEventListeners(); // Add event listeners for services page
});
