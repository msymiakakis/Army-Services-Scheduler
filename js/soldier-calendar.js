document.addEventListener('DOMContentLoaded', function() {
    const soldierCalendarsContainer = document.getElementById('soldier-calendars');

    // Function to update soldier availability
    function updateSoldierAvailability(soldierId, availabilityArray) {
        // Retrieve the soldier object from local storage
        const soldiers = JSON.parse(localStorage.getItem('soldiers'));
        const soldierIndex = soldiers.findIndex(soldier => soldier.id === soldierId);
    
        if (soldierIndex !== -1) {
            // Get the soldier object
            const soldier = soldiers[soldierIndex];
    
            // Update the soldier's availability array
            soldier.availability = availabilityArray;
    
            // Update the soldier object in the soldiers array
            soldiers[soldierIndex] = soldier;
    
            // Save the updated soldiers array back to local storage
            localStorage.setItem('soldiers', JSON.stringify(soldiers));
            
            console.log('Soldier availability updated:', soldier);
        } else {
            console.error('Soldier not found with ID:', soldierId);
        }
    }
    
    // Function to render calendar for each soldier
    function renderSoldierCalendar(soldierId, soldierName) {
        const soldierIndex = soldiers.findIndex(soldier => soldier.id === soldierId);
        let soldierType = "";
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
        const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year
    
        // Calculate the difference in milliseconds between the two dates and convert it to days
        const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));
    
        // Initialize the availability array with the length equal to the number of days in the year
        let availabilityArray = [];
    
        if (soldierIndex !== -1) {
            // Get the soldier object
            const soldier = soldiers[soldierIndex];
    
            // Update the soldier's availability array
            availabilityArray = soldier.availability;
            soldierType = soldier.type;
        } else {
            console.error('Δεν βρέθηκε οπλίτης με το παρακάτω ΑΣΜ:', soldierId);
        }
    
        // Create a div to hold the soldier's information
        const soldierDiv = document.createElement('div');
        soldierDiv.classList.add('soldier-grid');
    
        // Create an image element for the soldier
        const soldierImage = document.createElement('img');
        if (soldierType == "gun") {
            soldierImage.src = './img/soldier.png'; // Set the image source
        } else if (soldierType == "no-gun"){
            soldierImage.src = './img/medical.png'; // Set the image source
        }
        soldierImage.classList.add('soldier-image'); // Add a class for styling

        soldierDiv.appendChild(soldierImage); // Append the image to the soldier div
    
        // Create a div to hold the soldier's name and calendar
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('soldier-info');
    
        // Create a span element for the soldier's name
        const soldierNameElement = document.createElement('span');
        soldierNameElement.textContent = soldierName;
        soldierNameElement.style.fontSize = "22px"; // Set the font size to 18 pixels

        soldierDiv.appendChild(soldierNameElement); // Append the name to the info div
    
        // Create an input element for the soldier's calendar
        const calendarContainer = document.createElement('div');
        calendarContainer.id = `calendar-${soldierId}`;
        // calendarContainer.setAttribute('type', 'text'); // Set input type to text
        soldierDiv.appendChild(calendarContainer); // Append the calendar input to the info div
    
        // Append the info div to the soldier div
        // soldierDiv.appendChild(infoDiv);
    
        // Append the soldier div to the soldierCalendarsContainer
        soldierCalendarsContainer.appendChild(soldierDiv);
        const schedulingPeriod = JSON.parse(localStorage.getItem('schedulingPeriod'));
        let schedulingDates = [];
        if (schedulingPeriod) {
            schedulingDates = [new Date(schedulingPeriod.startDate), new Date(schedulingPeriod.endDate)];
        }

        // Map the availability array to dates for the current year
        const defaultDates = availabilityArray.map((value, index) => {
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
        const flatpickrInstance = flatpickr(`#calendar-${soldierId}`, {
            mode: 'multiple',
            dateFormat: 'Y-m-d',
            minDate: schedulingDates[0], // Set minimum date to today
            maxDate: schedulingDates[1], // Set maximum date to today + totalDaysInYear
            defaultDate: defaultDates,
            inline: true,
            onChange: function(selectedDates, dateStr, instance) {
                // Update soldier's availability array based on selected dates
                const availabilityArrayTemp = new Array(totalDaysInYear).fill(0); 

                selectedDates.forEach(date => {
                    const dayOfYear = getDayOfYear(date);
                    availabilityArrayTemp[dayOfYear] = 1; // Mark the day as available
                });
                updateSoldierAvailability(soldierId, availabilityArrayTemp);
            }
        });
    }
    
    function getDayOfYear(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 0);
        const diff = date - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    const soldiers = JSON.parse(localStorage.getItem('soldiers'));

    // Render calendar for each soldier
    if (soldiers && soldiers.length > 0) {
        soldiers.forEach(soldier => {
            renderSoldierCalendar(soldier.id, soldier.name);
        });
    } else {
        // If there are no soldiers available, display a message
        soldierCalendarsContainer.textContent = 'Δεν υπάρχουν διαθέσιμοι οπλίτες.';
    }
    
});
