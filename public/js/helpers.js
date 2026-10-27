// public/js/helpers.js  -  small helper functions used by every page
// ---------------------------------------------------------------
// These run in the BROWSER. (The server has its own helpers.js.)
// ---------------------------------------------------------------

// All event categories (name, slug used in CSS, icon and emoji)
var categories = [
  { name: 'Technical',   slug: 'technical',   icon: 'bi-cpu',               emoji: '💻' },
  { name: 'Hackathon',   slug: 'hackathon',   icon: 'bi-lightning-charge',  emoji: '⚡' },
  { name: 'Workshop',    slug: 'workshop',    icon: 'bi-tools',             emoji: '🛠️' },
  { name: 'Cultural',    slug: 'cultural',    icon: 'bi-music-note-beamed', emoji: '🎭' },
  { name: 'Sports',      slug: 'sports',      icon: 'bi-trophy',            emoji: '🏏' },
  { name: 'Competition', slug: 'competition', icon: 'bi-award',             emoji: '🏆' },
  { name: 'Seminar',     slug: 'seminar',     icon: 'bi-mic',               emoji: '🎤' },
  { name: 'Social',      slug: 'social',      icon: 'bi-people',            emoji: '🤝' }
];

// Find the details for a category name.
function getCategory(name) {
  var found = categories.find(function (c) {
    return c.name === name;
  });
  return found || categories[categories.length - 1];
}

// IMPORTANT: makes text safe before we put it inside HTML.
// Without this, a user could type  <script>...</script>  as an event name (XSS attack).
function esc(text) {
  return String(text === undefined || text === null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Add a zero in front of a one-digit number.
function pad(n) {
  return String(n).padStart(2, '0'); // 5 -> "05"
}

// today's date as "YYYY-MM-DD"
function todayString() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// "2026-10-24" -> Date object (local time)
function toDate(dateStr) {
  var p = dateStr.split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// "2026-10-24" -> "Sat, 24 Oct 2026"
function formatDate(dateStr) {
  if (!dateStr) return '';
  return toDate(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

// "2026-10-24" -> { day: "24", month: "OCT" }  (used on the small date badge)
function dateParts(dateStr) {
  var d = toDate(dateStr);
  return {
    day: pad(d.getDate()),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  };
}

// "14:30" -> "2:30 PM"
function formatTime(t) {
  if (!t) return '';
  var p = t.split(':');
  var hours = Number(p[0]);
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return hours + ':' + p[1] + ' ' + ampm;
}

// ISO string -> "20 Oct 2026, 5:13 PM"
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

// Display a price or the word Free.
function formatPrice(price) {
  return price > 0 ? '₹' + price : 'Free';
}

// "Aarav Mehta" -> "AM"
function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(function (w) { return w[0].toUpperCase(); })
    .join('');
}

// Convert an event status code into text for the page.
function statusText(status) {
  if (status === 'upcoming') return 'Upcoming';
  if (status === 'ongoing') return 'Live now';
  return 'Completed';
}

// Return the text label for a winner’s position.
function positionLabel(n) {
  return ['', 'First Place', 'Second Place', 'Third Place'][n] || '';
}

// Return the medal emoji for a winner’s position.
function positionMedal(n) {
  return ['', '🥇', '🥈', '🥉'][n] || '';
}

// Link that adds the event to Google Calendar
function calendarLink(event) {
  var day = event.date.replace(/-/g, '');
  var start = day + 'T' + event.startTime.replace(':', '') + '00';
  var end = day + 'T' + event.endTime.replace(':', '') + '00';
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(event.title) +
    '&dates=' + start + '/' + end +
    '&location=' + encodeURIComponent(event.venue) +
    '&details=' + encodeURIComponent('Registered through Eventify');
}

// Read a value from the web address.
//   getQuery('category')  on  /events?category=Sports   ->  "Sports"
function getQuery(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Read the numbers from the address.
//   /events/7                       -> pathNumbers() = [7]
//   /student/certificate/12/winner  -> pathNumbers() = [12]
function pathNumbers() {
  return window.location.pathname.split('/').filter(function (part) {
    return part !== '' && !isNaN(Number(part));
  }).map(Number);
}
