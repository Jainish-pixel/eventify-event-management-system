// db.js
// ---------------------------------------------------------------
// Our "database" is a simple JSON file (data/db.json).
// It stores three lists:  users, events, registrations.
// We read the whole file, change the lists in memory and save it back.
// ---------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Save the data object into the JSON file
function saveData(data) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true }); // create /data folder if missing
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Read the JSON file and return it as a JavaScript object
function readData() {
  if (!fs.existsSync(DB_FILE)) {
    // first run: create an empty database
    saveData({ users: [], events: [], registrations: [] });
  }
  const text = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(text);
}

// Give the next free id for a list (highest id + 1)
function nextId(list) {
  let max = 0;
  list.forEach(function (item) {
    if (item.id > max) {
      max = item.id;
    }
  });
  return max + 1;
}

module.exports = { readData, saveData, nextId };
