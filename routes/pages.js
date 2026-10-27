// routes/pages.js  -  sends the HTML files to the browser
// ---------------------------------------------------------------
// The pages are plain .html files stored in the /pages folder.
// res.sendFile() sends one of them. The page then loads its own
// JavaScript, which asks the /api routes for the data.
//
// Student and organiser pages have a guard (middleware) in front,
// so a visitor who is not logged in is sent to the login page.
// ---------------------------------------------------------------
const express = require('express');
const path = require('path');
const { studentPage, organiserPage } = require('../middleware');

const router = express.Router();

// send(...) makes a route handler that sends  pages/<file>
function send(file) {
  return function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'pages', file));
  };
}

// ----- public pages -----
router.get('/', send('index.html'));
router.get('/events', send('events.html'));
router.get('/events/:id', send('event.html'));
router.get('/login', send('login.html'));
router.get('/register', send('register.html'));

// ----- student pages -----
router.get('/student/dashboard', studentPage, send('student/dashboard.html'));
router.get('/student/attendance', studentPage, send('student/attendance.html'));
router.get('/student/certificates', studentPage, send('student/certificates.html'));
router.get('/student/ticket/:regId', studentPage, send('student/ticket.html'));
router.get('/student/certificate/:regId/:type', studentPage, send('certificate.html'));

// ----- organiser pages -----
router.get('/organiser/dashboard', organiserPage, send('organiser/dashboard.html'));
router.get('/organiser/events/new', organiserPage, send('organiser/event-form.html'));
router.get('/organiser/events/:id/edit', organiserPage, send('organiser/event-form.html'));
router.get('/organiser/events/:id/manage', organiserPage, send('organiser/manage.html'));
router.get('/organiser/events/:id/certificate-preview', organiserPage, send('certificate.html'));

module.exports = router;
