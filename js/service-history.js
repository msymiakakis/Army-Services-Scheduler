document.addEventListener('DOMContentLoaded', function() {
    const soldierCalendarsContainer = document.getElementById('soldier-calendars');
    const services = JSON.parse(localStorage.getItem('services'));

    const currentYear = new Date().getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
    const lastDayOfYear = new Date(currentYear, 11, 31);

    // Check if the last day of the year is valid (e.g., for leap years)
    const isLastDayValid = (lastDayOfYear.getMonth() === 11 && lastDayOfYear.getDate() === 31);

    // If the last day is not valid, set it to the last day of the previous month (December)
    if (!isLastDayValid) {
        const lastDayOfPreviousMonth = new Date(currentYear, 11, 0);
        lastDayOfYear.setDate(lastDayOfPreviousMonth.getDate());
    }

       let defaultDates = [];
    const historyPeriod = JSON.parse(localStorage.getItem('historyPeriod'));
    const schedulingPeriod = JSON.parse(localStorage.getItem('schedulingPeriod'));

    if (historyPeriod) {
        defaultDates = [new Date(historyPeriod.startDate), new Date(historyPeriod.endDate)];
        const startDateFormatted = defaultDates[0].toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        const endDateFormatted = defaultDates[1].toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        document.getElementById('history-start-date').textContent = startDateFormatted;
        document.getElementById('history-end-date').textContent = endDateFormatted;
    }

    // Function to render calendar for each soldier
    function renderSoldierCalendar(soldier) {
        const serviceHistoryArray = soldier.serviceHistory;
    
        const serviceHistoryNamesArray = serviceHistoryArray.map(id => {
            const service = services.find(service => service.id === id);
            return service ? service.name : 'ΕΞ';
        });
    
        const serviceHistoryFlags = serviceHistoryArray.map(id => id !== 0 ? 1 : 0);
    
        // Create a div to hold the soldier's information
        const soldierDiv = document.createElement('div');
        soldierDiv.classList.add('soldier-grid');
    
        // Create an image element for the soldier
        const soldierImage = document.createElement('img');
        if (soldier.type == "gun") {
            soldierImage.src = './img/soldier.png'; // Set the image source
        } else if (soldier.type == "no-gun"){
            soldierImage.src = './img/medical.png'; // Set the image source
        }
        soldierImage.classList.add('soldier-image'); // Add a class for styling
    
        soldierDiv.appendChild(soldierImage); // Append the image to the soldier div
    
        // Create a span element for the soldier's name
        const soldierNameElement = document.createElement('span');
        soldierNameElement.textContent = soldier.name;
        soldierNameElement.style.fontSize = "22px"; // Set the font size to 18 pixels
    
        soldierDiv.appendChild(soldierNameElement); // Append the name to the info div
    
        // Create an input element for the soldier's calendar
        const calendarContainer = document.createElement('div');
        calendarContainer.id = `calendar-${soldier.id}`;
        soldierDiv.appendChild(calendarContainer); // Append the calendar input to the info div
    
        // Append the soldier div to the soldierCalendarsContainer
        soldierCalendarsContainer.appendChild(soldierDiv);
    
        // Map the serviceHistory array to dates for the current year
        const defaultDates = serviceHistoryFlags.map((value, index) => {
            if (value === 1) {
                // Calculate the date based on the index (day of the year)
                const date = new Date(currentYear, 0); // January 1st of the current year
                date.setDate(date.getDate() + index); // Add the index to get the specific date
                return date;
            } else {
                return null;
            }
        }).filter(date => date !== null); // Filter out null values

        // Initialize Flatpickr for soldier's calendar
        // Initialize Flatpickr for soldier's calendar
        // Initialize Flatpickr for soldier's calendar
        // Initialize Flatpickr for soldier's calendar
        const periodPicker = flatpickr(`#calendar-${soldier.id}`, {
            dateFormat: "Y-m-d",
            altFormat: "j F Y",
            minDate: firstDayOfYear,
            maxDate: lastDayOfYear,
            defaultDate: defaultDates,
            inline: true,
            readOnly: true,
            onReady: customizeDays, // Initial customization
            onMonthChange: customizeDays // Reapply customization when month changes
        });

        // Function to customize the appearance of all days in the calendar
        function customizeDays(selectedDates, dateStr, instance) {
            // Get all day elements in the calendar
            const dayElements = instance.days.childNodes;

            // Get the current month and year being displayed in the calendar
            const currentMonth = instance.currentMonth;
            const currentYear = instance.currentYear;

            // Calculate the total number of days in the current month
            const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            // Calculate the offset for the first day of the month
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

            // Calculate the day index offset for the current month
            let dayIndexOffset = 0;
            for (let i = 0; i < currentMonth; i++) {
                dayIndexOffset += new Date(currentYear, i + 1, 0).getDate();
            }

            // Loop through each day element
            dayElements.forEach((dayElement, index) => {
                // Calculate the day number to display
                const dayNumber = index - firstDayOfMonth + 1;

                // Calculate the day index for the serviceHistoryNamesArray
                const dayIndex = dayIndexOffset + dayNumber;


                // Check if the day number is within the range of the current month
                if (dayNumber >= 1 && dayNumber <= totalDaysInMonth) {
                    const serviceHistoryName = serviceHistoryNamesArray[dayIndex - 1]; // Adjusting for zero-based index

                    // Display the day number along with the service history name
                    dayElement.innerHTML = `<span class="day-number">${dayNumber} </span><span class="service-history-name">${serviceHistoryName}</span>`;
                    dayElement.style.fontSize = "11px"; // Set the font size to 18 pixels
                    // Find the corresponding service based on the service history name
                    const service = services.find(service => service.name === serviceHistoryName);

                    // Set the background color based on the service color
                    if (service) {
                        dayElement.style.backgroundColor = service.color;
                        dayElement.style.color = 'black';
                        dayElement.style.borderColor = service.color;
                    }
                }
            });
        }



    }
    
    // Initialize Flatpickr calendar
    const periodPicker = flatpickr("#history-period-picker", {
        mode: "range",
        dateFormat: "Y-m-d",
        minDate: firstDayOfYear,
        maxDate: lastDayOfYear,
        defaultDate: defaultDates,
        inline: true,
        onClose: function(selectedDates) {
            const startDate = selectedDates[0];
            const endDate = selectedDates[1];
            const startDateFormatted = selectedDates[0].toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
            const endDateFormatted = selectedDates[1].toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
            document.getElementById('history-start-date').textContent = startDateFormatted;
            document.getElementById('history-end-date').textContent = endDateFormatted;
            localStorage.setItem('historyPeriod', JSON.stringify({ startDate, endDate }));
        }
    });

    const soldiers = JSON.parse(localStorage.getItem('soldiers'));

    // Render calendar for each soldier
    if (soldiers && soldiers.length > 0) {
        soldiers.forEach(soldier => {
            renderSoldierCalendar(soldier);
        });
    } else {
        // If there are no soldiers available, display a message
        soldierCalendarsContainer.textContent = 'No soldiers available.';
    }


});

// Get the "Reset Service History" button element
const resetHistoryButton = document.getElementById('reset-history-btn');

const currentYear = new Date().getFullYear();
const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year

const historyPeriod = JSON.parse(localStorage.getItem('historyPeriod'));
const historyStartDate = new Date(historyPeriod.startDate);
const historyEndDate = new Date(historyPeriod.endDate);
// Calculate the difference in milliseconds between the two dates and convert it to days
const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));

// Add event listener to the button
resetHistoryButton.addEventListener('click', function() {
    // Show modal dialog for confirmation
    const confirmation = confirm("Do you want to reset the service history of all soldiers or a specific soldier?");
    
    if (confirmation) {
        // Prompt the user to choose all or a specific soldier
        const option = prompt("Enter 'all' to reset service history of all soldiers, or enter a soldier's ID to reset their service history:");

        // Get soldiers data from local storage
        let soldiers = JSON.parse(localStorage.getItem('soldiers'));

        // Check if option is 'all' to reset service history of all soldiers
        if (option === 'all') {
            // Reset service history arrays of all soldiers
            if (soldiers && soldiers.length > 0) {
                soldiers.forEach(soldier => {
                    resetServiceHistoryBetweenDates(soldier.serviceHistory, historyStartDate, historyEndDate);
                });
                alert("Service history of all soldiers has been reset.");
            } else {
                alert("There are no soldiers to reset.");
            }
        } else {
            // Reset service history of a specific soldier
            const soldierId = parseInt(option);
            const soldier = soldiers.find(soldier => soldier.id === soldierId);

            if (soldier) {
                resetServiceHistoryBetweenDates(soldier.serviceHistory, historyStartDate, historyEndDate);
                alert(`Service history of soldier with ID ${soldierId} has been reset.`);
            } else {
                alert("Soldier with the provided ID was not found.");
            }
        }

        // Update soldiers data in local storage
        localStorage.setItem('soldiers', JSON.stringify(soldiers));

        location.reload();
    }
});

// Function to reset service history between specified start and end dates
function resetServiceHistoryBetweenDates(serviceHistory, startDate, endDate) {
    // Calculate the start and end indexes based on the provided dates
    const startIndex = daysDifference(startDate, new Date(startDate.getFullYear(), 0, 1));
    const endIndex = daysDifference(endDate, new Date(startDate.getFullYear(), 0, 1));

    // Set the values between start and end indexes to 0
    for (let i = startIndex; i <= endIndex; i++) {
        serviceHistory[i] = 0;
    }
}

// Function to calculate the difference in days between two dates
function daysDifference(date1, date2) {
    const oneDay = 1000 * 60 * 60 * 24;
    const differenceMs = Math.abs(date1 - date2);
    return Math.round(differenceMs / oneDay);
}


function getDayOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
