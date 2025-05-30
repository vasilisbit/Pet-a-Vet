// Manual date conversion fix test script
const year = 2025;
const month = 5; // May (0-based, so 0 = January)
const day = 29;
const hours = 9;
const minutes = 0;

console.log("Local Timezone Fix Test\n");

// Method 1: String-based creation (problematic)
const dateString = `${year}-${month + 1}-${day} ${hours}:${minutes}:00`;
const date1 = new Date(dateString);
console.log("Method 1 (string creation):");
console.log(`Input: "${dateString}"`);
console.log(`Output: ${date1}`);
console.log(`ISO: ${date1.toISOString()}`);
console.log(`UTC Hours: ${date1.getUTCHours()}`);
console.log(`Local Hours: ${date1.getHours()}`);
console.log(`Date part: ${date1.toISOString().split("T")[0]}`);

console.log("\n");

// Method 2: Component-based creation (current approach)
const date2 = new Date(year, month, day, hours, minutes, 0);
console.log("Method 2 (component creation):");
console.log(
  `Input: new Date(${year}, ${month}, ${day}, ${hours}, ${minutes}, 0)`
);
console.log(`Output: ${date2}`);
console.log(`ISO: ${date2.toISOString()}`);
console.log(`UTC Hours: ${date2.getUTCHours()}`);
console.log(`Local Hours: ${date2.getHours()}`);
console.log(`Date part: ${date2.toISOString().split("T")[0]}`);

console.log("\n");

// Method 3: Explicit UTC offset (possible solution)
const date3 = new Date(Date.UTC(year, month, day, hours, minutes, 0));
console.log("Method 3 (explicit UTC):");
console.log(
  `Input: Date.UTC(${year}, ${month}, ${day}, ${hours}, ${minutes}, 0)`
);
console.log(`Output: ${date3}`);
console.log(`ISO: ${date3.toISOString()}`);
console.log(`UTC Hours: ${date3.getUTCHours()}`);
console.log(`Local Hours: ${date3.getHours()}`);
console.log(`Date part: ${date3.toISOString().split("T")[0]}`);

console.log("\n");

// Method 4: Local date extraction
const localDate = (date) => {
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`,
  };
};

console.log("Local date extraction from all methods:");
console.log(`Method 1: ${JSON.stringify(localDate(date1))}`);
console.log(`Method 2: ${JSON.stringify(localDate(date2))}`);
console.log(`Method 3: ${JSON.stringify(localDate(date3))}`);
