// Allowed event categories (used to validate the event form)
const categoryNames = [
  'Technical', 'Hackathon', 'Workshop', 'Cultural',
  'Sports', 'Competition', 'Seminar', 'Social'
];

// Add a zero in front of a one-digit number.
function pad(n) {
  return String(n).padStart(2, '0'); // 5 -> "05"
}

// today's date as "YYYY-MM-DD"
function todayString() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// ISO string -> "20 Oct 2026, 5:13 PM"  (used in the CSV file)
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

// Decide if an event is upcoming, ongoing or completed using date + time
function getStatus(event) {
  const start = new Date(event.date + 'T' + event.startTime);
  const end = new Date(event.date + 'T' + event.endTime);
  const now = new Date();
  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'completed';
}

// Returns 1, 2 or 3 if the student won that position, otherwise 0
function winnerPosition(event, studentId) {
  if (!event.results) return 0;
  if (event.results.first === studentId) return 1;
  if (event.results.second === studentId) return 2;
  if (event.results.third === studentId) return 3;
  return 0;
}

// Add extra information to an event (seats, status, organiser name ...)
function decorateEvent(event, data) {
  const registered = data.registrations.filter(function (r) {
    return r.eventId === event.id && r.status === 'registered';
  }).length;

  const organiser = data.users.find(function (u) {
    return u.id === event.organiserId;
  });

  return Object.assign({}, event, {
    registered: registered,
    seatsLeft: event.capacity - registered,
    status: getStatus(event),
    organiserName: organiser ? organiser.name : 'Unknown organiser'
  });
}

// Used for sorting events by date (earliest first)
function sortByDate(a, b) {
  return (a.date + a.startTime).localeCompare(b.date + b.startTime);
}

// Random ticket code like  EVT3-K7M2Q
function makeTicketCode(eventId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return 'EVT' + eventId + '-' + code;
}

module.exports = {
  categoryNames, todayString, formatDateTime, getStatus, winnerPosition,
  decorateEvent, sortByDate, makeTicketCode
};
