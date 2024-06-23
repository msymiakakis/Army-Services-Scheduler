function convertToGreekDate(formattedDate) {
  const englishToGreekMap = {
    Mon: "Δευ",
    Tue: "Τρι",
    Wed: "Τετ",
    Thu: "Πεμ",
    Fri: "Παρ",
    Sat: "Σαβ",
    Sun: "Κυρ",
    Jan: "Ιαν",
    Feb: "Φεβ",
    Mar: "Μαρ",
    Apr: "Απρ",
    May: "Μαϊ",
    Jun: "Ιουν",
    Jul: "Ιουλ",
    Aug: "Αυγ",
    Sep: "Σεπ",
    Oct: "Οκτ",
    Nov: "Νοε",
    Dec: "Δεκ",
  };

  // Split the formatted date into day, month, and date parts
  const parts = formattedDate.split(" ");
  const trimmedDayPart = parts[0].replace(",", "").trim(); // Remove comma and trim whitespace

  const day = englishToGreekMap[trimmedDayPart];
  const month = englishToGreekMap[parts[1]];
  const date = parts[2];

  // Return the Greek formatted date
  return `${day}, ${date} ${month}`;
}
