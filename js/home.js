document.addEventListener("DOMContentLoaded", function () {
  function updateButtonState(status) {
    if (status === "1") {
      autoAssignBtn.textContent = "Αυτόματη Ανάθεση ✔️";
    } else {
      autoAssignBtn.textContent = "Αυτόματη Ανάθεση ❌";
    }
  }

  const autoAssignBtn = document.getElementById("auto-assign-btn-2");

  let autoAssignStatus = localStorage.getItem("autoAssign");
  if (autoAssignStatus === null) {
    autoAssignStatus = "1";
    localStorage.setItem("autoAssign", autoAssignStatus);
  }

  updateButtonState(autoAssignStatus);

  autoAssignBtn.addEventListener("click", function () {
    if (autoAssignStatus === "1") {
      autoAssignStatus = "0";
      localStorage.setItem("autoAssign", autoAssignStatus);
    } else {
      autoAssignStatus = "1";
      localStorage.setItem("autoAssign", autoAssignStatus);
    }
    updateButtonState(autoAssignStatus);
  });
  // Get today's date
  const now = new Date();

  const schedulingPeriod = JSON.parse(localStorage.getItem("schedulingPeriod"));
  let defaultDates = [];
  if (schedulingPeriod) {
    defaultDates = [new Date(schedulingPeriod.startDate), new Date(schedulingPeriod.endDate)];
    const startDateFormatted = defaultDates[0].toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    const endDateFormatted = defaultDates[1].toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    document.getElementById("start-date").textContent = startDateFormatted;
    document.getElementById("end-date").textContent = endDateFormatted;
  }
  // Check if the current time is past 3 PM
  if (now.getHours() >= 15) {
    // 3 PM in 24-hour format
    // If past 3 PM, consider the next day as today
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1); // Increment the date by 1 to get tomorrow's date
    tomorrow.setHours(0, 0, 0, 0); // Set the time to midnight
    today = tomorrow;
  } else {
    // If before 3 PM, consider today as today
    today = now;
  }

  // Get the current year
  const currentYear = today.getFullYear();

  // Calculate the last day of the year dynamically
  const lastDayOfYear = new Date(currentYear, 11, 31);

  // Check if the last day of the year is valid (e.g., for leap years)
  const isLastDayValid = lastDayOfYear.getMonth() === 11 && lastDayOfYear.getDate() === 31;

  // If the last day is not valid, set it to the last day of the previous month (December)
  if (!isLastDayValid) {
    const lastDayOfPreviousMonth = new Date(currentYear, 11, 0);
    lastDayOfYear.setDate(lastDayOfPreviousMonth.getDate());
  }

  // Initialize Flatpickr calendar
  const periodPicker = flatpickr("#period-picker", {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: today,
    maxDate: lastDayOfYear,
    defaultDate: defaultDates,
    inline: true,
    onClose: function (selectedDates) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      const startDateFormatted = selectedDates[0].toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
      const endDateFormatted = selectedDates[1].toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
      document.getElementById("start-date").textContent = startDateFormatted;
      document.getElementById("end-date").textContent = endDateFormatted;
      localStorage.setItem("schedulingPeriod", JSON.stringify({ startDate, endDate }));
    },
  });
});
