document.addEventListener("DOMContentLoaded", function () {
  const serviceCalendarsContainer = document.getElementById("service-calendars");

  // Function to update service availability
  function updateServiceAvailability(serviceId, availabilityArray) {
    // Retrieve the service object from local storage
    const services = JSON.parse(localStorage.getItem("services"));
    const serviceIndex = services.findIndex(service => service.id === serviceId);

    if (serviceIndex !== -1) {
      // Get the service object
      const service = services[serviceIndex];

      // Update the service's availability array
      service.availability = availabilityArray;

      // Update the service object in the services array
      services[serviceIndex] = service;

      // Save the updated services array back to local storage
      localStorage.setItem("services", JSON.stringify(services));

      console.log("Η διαθεσιμότητα υπηρεσιών ενημερώθηκε:", service);
    } else {
      console.error("Δεν βρέθηκε υπηρεσία με αναγνωριστικό αριθμό (ID):", serviceId);
    }
  }

  // Function to render calendar for each service
  function renderServiceCalendar(serviceId, serviceName) {
    const serviceIndex = services.findIndex(service => service.id === serviceId);

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year

    // Calculate the difference in milliseconds between the two dates and convert it to days
    const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));

    // Initialize the availability array with the length equal to the number of days in the year
    let availabilityArray = [];

    if (serviceIndex !== -1) {
      // Get the service object
      const service = services[serviceIndex];

      // Update the service's availability array
      availabilityArray = service.availability;
    } else {
      console.error("Δεν βρέθηκε υπηρεσία με αναγνωριστικό αριθμό (ID):", serviceId);
    }
    // Create a div to hold the service's name and calendar
    const serviceContainer = document.createElement("div");
    serviceContainer.classList.add("service-container");

    // Create a span element for the service's name
    const serviceNameElement = document.createElement("span");
    serviceNameElement.textContent = serviceName;
    serviceNameElement.style.fontSize = "22px"; // Set the font size to 18 pixels

    // Create an input element for the service's calendar
    const calendarContainer = document.createElement("div");
    calendarContainer.id = `calendar-${serviceId}`;
    // calendarContainer.setAttribute('type', 'text'); // Set input type to text

    // Append a button that selects all available dates.
    const selectAllButton = document.createElement("button");
    selectAllButton.className = "selectAllButton";
    selectAllButton.textContent = "Επιλογή Όλων";

    // Append the service's name and calendar into the service container
    serviceContainer.appendChild(serviceNameElement);
    serviceContainer.appendChild(calendarContainer);
    serviceContainer.appendChild(selectAllButton);

    // Append the service container to the serviceCalendarsContainer
    serviceCalendarsContainer.appendChild(serviceContainer);

    const schedulingPeriod = JSON.parse(localStorage.getItem("schedulingPeriod"));
    let schedulingDates = [];
    if (schedulingPeriod) {
      schedulingDates = [new Date(schedulingPeriod.startDate), new Date(schedulingPeriod.endDate)];
    }

    // Map the availability array to dates for the current year
    const defaultDates = availabilityArray
      .map((value, index) => {
        if (value === 1) {
          // Calculate the date based on the index (day of the year)
          const date = new Date(currentYear, 0); // January 1st of the current year
          date.setDate(date.getDate() + index); // Add the index to get the specific date
          return date;
        } else {
          return null;
        }
      })
      .filter(date => date !== null); // Filter out null values

    // Initialize Flatpickr for service's calendar
    const flatpickrInstance = flatpickr(`#calendar-${serviceId}`, {
      mode: "multiple",
      dateFormat: "Y-m-d",
      minDate: schedulingDates[0], // Set minimum date to today
      maxDate: schedulingDates[1], // Set maximum date to today + totalDaysInYear
      defaultDate: defaultDates,
      inline: true,
      onChange: function (selectedDates, dateStr, instance) {
        // Update service's availability array based on selected dates
        const availabilityArrayTemp = new Array(totalDaysInYear).fill(0);

        selectedDates.forEach(date => {
          const dayOfYear = getDayOfYear(date);
          availabilityArrayTemp[dayOfYear] = 1; // Mark the day as available
        });
        updateServiceAvailability(serviceId, availabilityArrayTemp);
      },
    });

    // Handle the select all button click
    selectAllButton.onclick = () => {
      if (schedulingDates.length === 2) {
        const allDates = [];
        let currentDate = new Date(schedulingDates[0]);

        while (currentDate <= schedulingDates[1]) {
          allDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        flatpickrInstance.setDate(allDates);

        const availabilityArrayTemp = new Array(totalDaysInYear).fill(0);

        allDates.forEach(date => {
          const dayOfYear = getDayOfYear(date);
          availabilityArrayTemp[dayOfYear] = 1; // Mark the day as available
        });
        updateServiceAvailability(serviceId, availabilityArrayTemp);
      }
    };
  }

  function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  const services = JSON.parse(localStorage.getItem("services"));

  // Render calendar for each soldier
  if (services && services.length > 0) {
    services.forEach(service => {
      renderServiceCalendar(service.id, service.name);
    });
  } else {
    // If there are no services available, display a message
    serviceCalendarsContainer.textContent = "Δεν υπάρχουν καταχωρημένες υπηρεσίες.";
  }
});
