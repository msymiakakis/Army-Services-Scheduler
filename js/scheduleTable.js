// Code for building the scheduling Table in the Assignments web page.
document.addEventListener("DOMContentLoaded", function () {
  const services = JSON.parse(localStorage.getItem("services"));
  const soldiers = JSON.parse(localStorage.getItem("soldiers"));
  const schedulingPeriod = JSON.parse(localStorage.getItem("schedulingPeriod"));
  const startDate = new Date(schedulingPeriod.startDate);
  const endDate = new Date(schedulingPeriod.endDate);
  const numberOfDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Calculate number of days

  if (
    !services ||
    !soldiers ||
    !schedulingPeriod ||
    (Array.isArray(services) && services.length === 0) ||
    (Array.isArray(soldiers) && soldiers.length === 0) ||
    !schedulingPeriod.startDate ||
    !schedulingPeriod.endDate
  ) {
    // If any are undefined, hide the table
    document.getElementById("auto-assign-btn").style.display = "none";
    document.getElementById("schedule-table").style.display = "none";
    return;
  } else {
    document.getElementById("auto-assign-btn").style.display = "block";
    document.getElementById("schedule-table").style.display = "block";
  }

  let schedulingDates = [];

  // Function to generate day headers
  function generateDayHeaders() {
    const tableHead = document.querySelector("#schedule-table thead tr");
    schedulingDates.forEach(formattedDate => {
      const greekFormattedDate = convertToGreekDate(formattedDate);
      const th = document.createElement("th");
      th.textContent = greekFormattedDate;
      tableHead.appendChild(th);
    });
  }

  // Function to generate the schedule table body
  function generateSchedule() {
    const tableBody = document.querySelector("#schedule-table tbody");
    soldiers.forEach((soldier, soldierIndex) => {
      const tr = document.createElement("tr");
      const soldierNameCell = document.createElement("td");
      soldierNameCell.textContent = `${soldier.name} (${soldier.type == "gun" ? "Ένοπλος" : "Άοπλος"})`;
      soldierNameCell.style.textAlign = "left";
      tr.appendChild(soldierNameCell);
      for (let i = 0; i < numberOfDays; i++) {
        const dayOfYear = getDayOfYear(startDate) + i;
        const serviceId = soldier.serviceHistory[dayOfYear];
        const td = document.createElement("td");
        td.dataset.soldierIndex = soldierIndex;
        td.dataset.dayOfYear = dayOfYear;
        if (serviceId) {
          const service = services.find(service => service.id === serviceId);
          td.textContent = service.name;
          td.style.backgroundColor = service.color;
          td.style.cursor = "pointer"; // Change cursor to pointer on hover
          td.classList.add("hoverable"); // Add hoverable class
        } else {
          td.textContent = "ΕΞΟΔΟΣ";
          td.style.cursor = "pointer"; // Change cursor to pointer on hover
          td.classList.add("hoverable"); // Add hoverable class
        }
        tr.appendChild(td);
      }
      tableBody.appendChild(tr);
    });
    // Add event listeners to each cell in the table after generating the table body
    document.querySelectorAll("#schedule-table tbody td").forEach(cell => {
      cell.addEventListener("click", handleCellClick);
    });
  }

  // Function to handle cell click event
  function handleCellClick(event) {
    const clickedCell = event.target;
    const soldierIndex = clickedCell.dataset.soldierIndex;
    const dayOfYear = clickedCell.dataset.dayOfYear;
    // Open modal or form for user input (selecting another soldier's service)
    // For demonstration purposes, we'll just use a prompt to simulate user input
    const newServiceName = prompt("Εισάγετε το όνομα της υπηρεσίας:");
    if (newServiceName !== null) {
      const availableServices = services.filter(service => {
        // Check if the service has availability for the specified dayOfYear
        return service.availability[dayOfYear] === 1;
      });
      const newService = availableServices.find(service => service.name === newServiceName);
      const clickedSoldier = soldiers[soldierIndex];

      if (clickedSoldier.availability[dayOfYear] === 0) {
        alert("Ο επιλεγμένος οπλίτης δεν είναι διαθέσιμος για αυτή την ημέρα.");
      } else if (!newService) {
        alert("Δεν υπάρχει τέτοια υπηρεσία ή δεν είναι διαθέσιμη εκείνη την ημέρα.");
      } else if (clickedSoldier.type === "no-gun" && clickedSoldier.type != newService.type) {
        alert("Η επιλεγμένη υπηρεσία δεν μπορεί να εκτελεστεί από τον επιλεγμένο οπλίτη.");
      } else if (newService) {
        // Find the cell of that day that has the name of newService and change values between the cells and update the soldiers serviceHistory arrays accordingly.
        const substituteIndex = Array.from(document.querySelectorAll(`#schedule-table tbody td[data-day-of-year="${dayOfYear}"]:not(:empty)`)).findIndex(
          element => element.textContent == newServiceName
        );
        const substituteCell = document.querySelector(`#schedule-table tbody td[data-soldier-index="${substituteIndex}"][data-day-of-year="${dayOfYear}"]`);

        // Update the clicked cell value with the new service
        // Update the corresponding cell value with the service of the clicked soldier
        const oldServiceId = soldiers[soldierIndex].serviceHistory[dayOfYear];
        let substituteService = [];

        if (oldServiceId === 0) {
          if (substituteIndex === -1) {
            substituteService = {
              id: 0,
              name: "ΕΞΟΔΟΣ",
              type: "no-type",
              availability: new Array(totalDaysInYear).fill(0),
              color: "",
            };
          } else {
            substituteService = {
              id: 0,
              name: "ΕΞΟΔΟΣ",
              type: soldiers[substituteIndex].type,
              availability: new Array(totalDaysInYear).fill(0),
              color: "",
            };
          }
        } else {
          substituteService = availableServices.find(service => service.id === oldServiceId);
        }

        console.log(oldServiceId);
        console.log(soldiers[substituteIndex]);
        console.log(substituteService);
        if (soldiers[soldierIndex].serviceHistory[dayOfYear] === 0 && !substituteIndex) {
          console.log(1);

          // Highlight both the clicked cell and the corresponding cell
          clickedCell.classList.add("highlight");
          substituteCell.classList.add("highlight");
          substituteCell.textContent = "ΕΞΟΔΟΣ";
          substituteCell.style.backgroundColor = clickedCell.style.backgroundColor;
          soldiers[substituteIndex].serviceHistory[dayOfYear] = 0;
          soldiers[substituteIndex].color = clickedCell.style.backgroundColor;

          clickedCell.textContent = newService.name;
          clickedCell.style.backgroundColor = newService.color;
          soldiers[soldierIndex].serviceHistory[dayOfYear] = newService.id;
          soldiers[soldierIndex].color = newService.color;

          localStorage.setItem("soldiers", JSON.stringify(soldiers));
        } else if (substituteIndex === -1) {
          clickedCell.classList.add("highlight");
          clickedCell.textContent = newService.name;
          clickedCell.style.backgroundColor = newService.color;
          soldiers[soldierIndex].serviceHistory[dayOfYear] = newService.id;
          soldiers[soldierIndex].color = newService.color;

          localStorage.setItem("soldiers", JSON.stringify(soldiers));
        } else if (soldiers[substituteIndex].type === "no-gun" && soldiers[substituteIndex].type != substituteService.type) {
          alert("Η τρέχουσα υπηρεσία δεν μπορεί να εκτελεστεί από τον αντικαταστάτη οπλίτη.");
        } else {
          // Highlight both the clicked cell and the corresponding cell
          clickedCell.classList.add("highlight");
          substituteCell.classList.add("highlight");
          // Update local storage with the modified soldiers array
          substituteCell.textContent = clickedCell.textContent;
          substituteCell.style.backgroundColor = clickedCell.style.backgroundColor;
          soldiers[substituteIndex].serviceHistory[dayOfYear] = oldServiceId;
          soldiers[substituteIndex].color = clickedCell.style.backgroundColor;

          clickedCell.textContent = newService.name;
          clickedCell.style.backgroundColor = newService.color;
          soldiers[soldierIndex].serviceHistory[dayOfYear] = newService.id;
          soldiers[soldierIndex].color = newService.color;

          localStorage.setItem("soldiers", JSON.stringify(soldiers));
        }
      } else {
        alert("Invalid service");
      }
    }
  }

  // Function to get the service name based on service id
  function getServiceName(serviceId) {
    // Find the service with the matching ID in the services array
    const service = services.find(service => service.id === serviceId);

    // Return the service name if found, or "Unknown Service" otherwise
    return service ? service.name : "ΕΞΟΔΟΣ";
  }

  function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Generate array of all day and month combinations for each day
  for (let i = 0; i < numberOfDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const formattedDate = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    schedulingDates.push(formattedDate);
  }

  // Generate day headers and schedule table body
  generateDayHeaders();
  generateSchedule();
});
