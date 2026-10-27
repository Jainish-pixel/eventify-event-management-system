// seed.js  -  fills the database with DEMO data
// Run it with:   npm run seed
// ---------------------------------------------------------------
const bcrypt = require('bcryptjs');
const { saveData } = require('./db');
const { makeTicketCode } = require('./helpers');

// returns a date string like "2026-10-25" that is n days from today
function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

const hash = bcrypt.hashSync('demo123', 10); // every demo account uses password: demo123
const data = { users: [], events: [], registrations: [] };

// Add a sample user to the seed data.
function addUser(name, email, role, college) {
  const id = data.users.length + 1;
  data.users.push({
    id: id, name: name, email: email, password: hash,
    role: role, college: college, createdAt: new Date().toISOString()
  });
  return id;
}

// Add a sample event to the seed data.
function addEvent(organiserId, info) {
  const id = data.events.length + 1;
  data.events.push({
    id: id,
    organiserId: organiserId,
    title: info.title,
    description: info.description,
    category: info.category,
    date: daysFromToday(info.day),
    startTime: info.start,
    endTime: info.end,
    venue: info.venue,
    price: info.price,
    capacity: info.capacity,
    certTitle: info.certTitle || 'Certificate of Achievement',
    certMessage: info.certMessage || 'In recognition of outstanding performance and dedication.',
    signerName: info.signerName,
    signerRole: info.signerRole,
    results: null,
    createdAt: new Date().toISOString()
  });
  return id;
}

// Add a sample student registration to the seed data.
function register(eventId, studentId, attended, status) {
  data.registrations.push({
    id: data.registrations.length + 1,
    eventId: eventId,
    studentId: studentId,
    ticketCode: makeTicketCode(eventId),
    status: status || 'registered',
    attended: attended === true,
    registeredAt: new Date().toISOString()
  });
}

// Set sample winner results for an event.
function setResults(eventId, first, second, third, note) {
  const event = data.events.find(function (e) { return e.id === eventId; });
  event.results = { first: first, second: second, third: third, note: note, announcedAt: new Date().toISOString() };
}

// ---------- users ----------
const org1 = addUser('Rohan Sharma', 'organiser@demo.com', 'organiser', 'CSE Department');
const org2 = addUser('Priya Kapoor', 'priya@demo.com', 'organiser', 'Cultural Committee');

const s = [];
s.push(addUser('Aarav Mehta', 'student@demo.com', 'student', 'CSE, 3rd Year'));
s.push(addUser('Simran Kaur', 'simran@demo.com', 'student', 'ECE, 3rd Year'));
s.push(addUser('Karan Verma', 'karan@demo.com', 'student', 'CSE, 2nd Year'));
s.push(addUser('Neha Gupta', 'neha@demo.com', 'student', 'IT, 3rd Year'));
s.push(addUser('Rahul Singh', 'rahul@demo.com', 'student', 'ME, 4th Year'));
s.push(addUser('Ishita Jain', 'ishita@demo.com', 'student', 'CSE, 3rd Year'));
s.push(addUser('Manpreet Singh', 'manpreet@demo.com', 'student', 'EE, 2nd Year'));
s.push(addUser('Ananya Rao', 'ananya@demo.com', 'student', 'IT, 4th Year'));
s.push(addUser('Vikram Malhotra', 'vikram@demo.com', 'student', 'CE, 3rd Year'));
s.push(addUser('Tanya Bansal', 'tanya@demo.com', 'student', 'CSE, 1st Year'));

// ---------- past events ----------
const e1 = addEvent(org1, {
  title: 'CodeStorm Hackathon 2026', category: 'Hackathon', day: -10, start: '10:00', end: '18:00',
  venue: 'CS Lab 3, Block B', price: 200, capacity: 12,
  description: 'An 8-hour hackathon where teams build a working prototype around the theme "Tech for Campus Life". Mentors from the industry review every project and the best three teams win prizes.',
  certTitle: 'Certificate of Excellence', certMessage: 'For outstanding innovation and teamwork at CodeStorm.',
  signerName: 'Dr. Rohan Sharma', signerRole: 'Head, CSE Department'
});
const e2 = addEvent(org2, {
  title: 'Inter-College Debate Championship', category: 'Competition', day: -5, start: '11:00', end: '14:00',
  venue: 'Seminar Hall A', price: 0, capacity: 20,
  description: 'Argue your case in front of a panel of judges. This year\'s motion: "Social media does more good than harm for students."',
  certTitle: 'Certificate of Achievement', certMessage: 'For exceptional reasoning and public speaking.',
  signerName: 'Priya Kapoor', signerRole: 'Cultural Committee Head'
});
const e3 = addEvent(org1, {
  title: 'Web Dev Workshop: Build with Express', category: 'Workshop', day: -2, start: '14:00', end: '16:30',
  venue: 'CS Lab 1', price: 0, capacity: 40,
  description: 'A hands-on session where you build a small REST API with Node.js and Express from scratch. Bring your laptop with Node.js installed.',
  signerName: 'Dr. Rohan Sharma', signerRole: 'Head, CSE Department'
});

// ---------- upcoming events ----------
const e4 = addEvent(org1, {
  title: 'TechFest Robotics Expo', category: 'Technical', day: 3, start: '10:00', end: '17:00',
  venue: 'Innovation Centre', price: 0, capacity: 30,
  description: 'See line-following robots, drones and student-built automation projects live. Visit the stalls, talk to the makers and vote for the People\'s Choice robot.',
  signerName: 'Dr. Rohan Sharma', signerRole: 'Head, CSE Department'
});
const e5 = addEvent(org2, {
  title: 'Rang Tarang Cultural Night', category: 'Cultural', day: 7, start: '18:00', end: '21:30',
  venue: 'Open Air Theatre', price: 150, capacity: 150,
  description: 'An evening of dance, music and drama performed by students from every department. Food stalls open from 5 PM.',
  signerName: 'Priya Kapoor', signerRole: 'Cultural Committee Head'
});
const e6 = addEvent(org1, {
  title: 'Inter-Department Cricket Cup', category: 'Sports', day: 10, start: '09:00', end: '13:00',
  venue: 'College Cricket Ground', price: 100, capacity: 16,
  description: 'Eight departments, one trophy. Register as a player or a supporter and be part of the biggest sports day of the semester.',
  certTitle: 'Certificate of Victory', certMessage: 'For sportsmanship, skill and a winning spirit.',
  signerName: 'Prof. A. K. Gill', signerRole: 'Sports Coordinator'
});
const e7 = addEvent(org1, {
  title: 'AI and Your Career: Industry Talk', category: 'Seminar', day: 5, start: '15:00', end: '16:30',
  venue: 'Auditorium', price: 0, capacity: 100,
  description: 'A senior engineer explains how AI is changing software jobs, which skills to build in your final years, and how to prepare for placements.',
  signerName: 'Dr. Rohan Sharma', signerRole: 'Head, CSE Department'
});
const e8 = addEvent(org2, {
  title: 'Campus Photography Walk', category: 'Competition', day: 14, start: '07:00', end: '10:00',
  venue: 'Central Lawn', price: 50, capacity: 25,
  description: 'Walk around the campus at sunrise and shoot your best three frames. A judge picks the top photographs and prints them for the gallery wall.',
  certTitle: 'Certificate of Creativity', certMessage: 'For an eye for detail and a creative vision.',
  signerName: 'Priya Kapoor', signerRole: 'Cultural Committee Head'
});
const e9 = addEvent(org2, {
  title: 'Open Mic Night', category: 'Social', day: 1, start: '17:30', end: '20:30',
  venue: 'Student Cafe', price: 0, capacity: 10,
  description: 'Sing, recite, joke or play. Five minutes on stage, an audience that cheers for everyone. Only 10 performer slots are available.',
  signerName: 'Priya Kapoor', signerRole: 'Cultural Committee Head'
});
const e10 = addEvent(org1, {
  title: 'Startup Pitch Day', category: 'Seminar', day: 20, start: '11:00', end: '15:00',
  venue: 'Seminar Hall B', price: 100, capacity: 60,
  description: 'Pitch your idea in 3 minutes to a panel of founders and investors. Get feedback, find co-founders and win seed credits.',
  certTitle: 'Certificate of Merit', certMessage: 'For a promising idea and a confident pitch.',
  signerName: 'Dr. Rohan Sharma', signerRole: 'Head, CSE Department'
});

// ---------- registrations ----------
// Event 1 - Hackathon (students 0 to 7 registered, 0 to 5 present)
[0, 1, 2, 3, 4, 5, 6, 7].forEach(function (i) { register(e1, s[i], i <= 5); });
setResults(e1, s[0], s[1], s[2], 'Great ideas and clean demos from every team.');

// Event 2 - Debate
[0, 1, 3, 5, 6, 8].forEach(function (i) { register(e2, s[i], i === 0 || i === 3 || i === 5 || i === 6); });
setResults(e2, s[3], s[0], s[5], 'A close contest. Congratulations to all speakers.');

// Event 3 - Workshop (student 0 was absent, so the demo student shows an "Absent" record)
[0, 2, 4, 6, 7, 9].forEach(function (i) { register(e3, s[i], i !== 0 && i !== 9); });

// Upcoming events
[0, 1, 2, 3].forEach(function (i) { register(e4, s[i]); });
[0, 4, 5].forEach(function (i) { register(e5, s[i]); });
[1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (i) { register(e6, s[i]); });
[0, 1, 2, 3, 4, 5, 6].forEach(function (i) { register(e7, s[i]); });
[3, 7].forEach(function (i) { register(e8, s[i]); });
[1, 2, 3, 4, 5, 6, 7, 8].forEach(function (i) { register(e9, s[i]); });
register(e10, s[9]);
register(e7, s[9], false, 'cancelled'); // an example of a cancelled registration

saveData(data);
console.log('Demo data created.');
console.log('Organiser login : organiser@demo.com / demo123');
console.log('Student login   : student@demo.com   / demo123');
