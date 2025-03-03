// Function to save soldiers data to local storage
function saveSoldiers(soldiers) {
  localStorage.setItem("soldiers", JSON.stringify(soldiers));
}

// Function to retrieve soldiers data from local storage
function fetchSoldiers() {
  const soldiers = JSON.parse(localStorage.getItem("soldiers"));
  if (soldiers) {
    displaySoldiers(soldiers);
  } else {
    const initialSoldiers = []; // Initialize with empty array if not available
    saveSoldiers(initialSoldiers);
    displaySoldiers(initialSoldiers);
  }
}

// Function to add a new soldier
function addSoldier(newSoldier) {
  const soldiers = JSON.parse(localStorage.getItem("soldiers"));

  // Check if the ID already exists
  const idExists = soldiers.some(soldier => soldier.id === newSoldier.id);
  if (idExists) {
    alert("Σφάλμα: Το ΑΣΜ που εισάγατε χρησιμοποιείται.");
    return;
  }

  soldiers.push(newSoldier);
  saveSoldiers(soldiers);
  displaySoldiers(soldiers);
}

// Function to remove a soldier by ID
function removeSoldier(soldierId) {
  soldierId = soldierId.toString();

  // Retrieve soldiers array from local storage
  let soldiers = JSON.parse(localStorage.getItem("soldiers"));

  // Find the index of the soldier to be removed
  const index = soldiers.findIndex(soldier => soldier.id == soldierId);

  if (index !== -1) {
    // Remove the soldier from the array
    soldiers.splice(index, 1);

    // Save the updated soldiers array to local storage
    saveSoldiers(soldiers);

    // Update the display of soldiers in the UI
    displaySoldiers(soldiers);
  } else {
    console.log("Ο οπλίτης με ΑΣΜ", soldierId, "δεν βρέθηκε.");
  }
}

// Function to display soldiers list
function displaySoldiers(soldiers) {
  const soldiersContainer = document.getElementById("soldiers-container");
  if (!soldiersContainer) {
    console.error("Σφάλμα: το στοιχείο soldiers-container δεν βρέθηκε.");
    return;
  }

  soldiersContainer.innerHTML = ""; // Clear previous content
  if (soldiers && soldiers.length > 0) {
    soldiers.forEach(soldier => {
      const soldierType = soldier.type;
      const soldierDiv = document.createElement("div");
      soldierDiv.classList.add("soldier-div");
      // Create an image element for the soldier
      const soldierImage = document.createElement("img");
      if (soldierType == "gun") {
        soldierImage.src = "../img/soldier.png"; // Set the image source
      } else if (soldierType == "no-gun") {
        soldierImage.src = "../img/medical.png"; // Set the image source
      }
      soldierImage.classList.add("soldier-image"); // Add a class for styling

      soldierDiv.appendChild(soldierImage); // Append the image to the soldier div

      const line = document.createElement("hr");
      line.classList.add("image-divider"); // Add a class for styling

      // Append the <hr> element to the soldierDiv
      soldierDiv.appendChild(line);
      // Create paragraph elements for soldier information
      const soldierIdParagraph = document.createElement("p");
      soldierIdParagraph.innerHTML = `<strong>ΑΣΜ:</strong> ${soldier.id}`;
      soldierDiv.appendChild(soldierIdParagraph);

      const soldierNameParagraph = document.createElement("p");
      soldierNameParagraph.innerHTML = `<strong>Ον/μο:</strong> ${soldier.name}`;
      soldierDiv.appendChild(soldierNameParagraph);

      const soldierTypeParagraph = document.createElement("p");
      soldierTypeParagraph.innerHTML = `<strong>Τύπος:</strong> ${soldier.type == "gun" ? "Ένοπλος" : "Άοπλος"}`;
      soldierDiv.appendChild(soldierTypeParagraph);

      // Create a button element for removing the soldier
      const removeButton = document.createElement("button");
      removeButton.textContent = "Αφαίρεση";
      removeButton.classList.add("soldierButton");
      removeButton.addEventListener("click", function () {
        removeSoldier(soldier.id);
      });
      soldierDiv.appendChild(removeButton);

      // Append the soldier div to the soldiers container
      soldiersContainer.appendChild(soldierDiv);
    });
  } else {
    soldiersContainer.innerHTML = "<p>Δεν υπάρχουν καταχωρημένοι οπλίτες.</p>";
  }
}

// Function to add event listeners for soldiers page
function addSoldierEventListeners() {
  // Event listener for adding a soldier
  const addSoldierForm = document.getElementById("add-soldier-form");
  addSoldierForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get form input values
    const soldierId = document.getElementById("soldier-id").value;
    const soldierName = document.getElementById("soldier-name").value;
    const soldierType = document.getElementById("soldier-type").value;

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of the current year
    const nextYearStartDate = new Date(currentYear + 1, 0, 1); // January 1st of the next year

    // Calculate the difference in milliseconds between the two dates and convert it to days
    const totalDaysInYear = Math.floor((nextYearStartDate - startDate) / (1000 * 60 * 60 * 24));

    // Create a new soldier object
    const newSoldier = {
      id: Number(soldierId),
      name: soldierName,
      type: soldierType,
      availability: new Array(totalDaysInYear).fill(1),
      serviceHistory: new Array(totalDaysInYear).fill(0),
    };

    // Add the new soldier
    addSoldier(newSoldier);

    // Clear the form fields
    addSoldierForm.reset();
  });

  // Event delegation for removing a soldier
  const soldiersContainer = document.getElementById("soldiers-container");
  soldiersContainer.addEventListener("click", function (event) {
    console.log("Clicked on soldiers container:", event.target);
    if (event.target && event.target.matches("button.remove-soldier")) {
      const soldierId = event.target.dataset.id;
      console.log("Αφαιρέθηκε ο οπλίτης με ΑΣΜ:", soldierId);
      removeSoldier(soldierId);
    }
  });
}

// Call the function to add event listeners when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  fetchSoldiers(); // Fetch soldiers data initially
  addSoldierEventListeners(); // Add event listeners for soldiers page
});
