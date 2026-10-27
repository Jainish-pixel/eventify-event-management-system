// routes/events.js  -  public data: home page, event list, event details
// ---------------------------------------------------------------
// Mounted at /api, so the full URLs are
//   GET /api/home
//   GET /api/events?category=Technical&q=robot&show=upcoming
//   GET /api/events/3
// ---------------------------------------------------------------
const express = require('express');
const { readData } = require('../db');
const h = require('../helpers');

const router = express.Router();

// ---------- HOME PAGE DATA ----------
router.get('/home', function (req, res) {
  const data = readData();
  const allEvents = data.events.map(function (e) {
    return h.decorateEvent(e, data);
  });

  // events that are not finished yet, nearest first
  const upcoming = allEvents
    .filter(function (e) { return e.status !== 'completed'; })
    .sort(h.sortByDate);

  const activeRegistrations = data.registrations.filter(function (r) {
    return r.status === 'registered';
  });

  res.json({
    upcoming: upcoming.slice(0, 6),
    featured: upcoming[0] || null,
    stats: {
      events: allEvents.length,
      students: data.users.filter(function (u) { return u.role === 'student'; }).length,
      registrations: activeRegistrations.length,
      certificates: activeRegistrations.filter(function (r) { return r.attended; }).length
    }
  });
});

// ---------- ALL EVENTS (with category filter + search) ----------
router.get('/events', function (req, res) {
  const data = readData();
  const category = req.query.category || 'all';
  const q = (req.query.q || '').trim();
  const show = req.query.show || 'upcoming';   // upcoming | past | all

  let events = data.events.map(function (e) {
    return h.decorateEvent(e, data);
  });

  // how many events does each category have? (shown on the filter buttons)
  const counts = {};
  events.forEach(function (e) {
    counts[e.category] = (counts[e.category] || 0) + 1;
  });

  // filter by category
  if (category !== 'all') {
    events = events.filter(function (e) { return e.category === category; });
  }

  // filter by search text (title, venue or description)
  if (q) {
    const text = q.toLowerCase();
    events = events.filter(function (e) {
      return e.title.toLowerCase().includes(text) ||
             e.venue.toLowerCase().includes(text) ||
             e.description.toLowerCase().includes(text);
    });
  }

  // filter by upcoming / past
  if (show === 'upcoming') {
    events = events.filter(function (e) { return e.status !== 'completed'; });
  } else if (show === 'past') {
    events = events.filter(function (e) { return e.status === 'completed'; });
  }

  events.sort(h.sortByDate);
  if (show === 'past') {
    events.reverse(); // latest finished event first
  }

  res.json({ events: events, counts: counts });
});

// ---------- ONE EVENT ----------
router.get('/events/:id', function (req, res) {
  const data = readData();
  const eventId = Number(req.params.id);
  const rawEvent = data.events.find(function (e) { return e.id === eventId; });

  if (!rawEvent) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const event = h.decorateEvent(rawEvent, data);
  const user = req.session.user;

  // if a student is logged in: is he/she already registered?
  let myReg = null;
  if (user && user.role === 'student') {
    myReg = data.registrations.find(function (r) {
      return r.eventId === eventId && r.studentId === user.id && r.status === 'registered';
    }) || null;
  }

  // winners (only if the organiser announced the results)
  const winners = [];
  if (rawEvent.results) {
    [['first', 1], ['second', 2], ['third', 3]].forEach(function (pair) {
      const studentId = rawEvent.results[pair[0]];
      const student = data.users.find(function (u) { return u.id === studentId; });
      if (student) {
        winners.push({ position: pair[1], name: student.name, college: student.college });
      }
    });
  }

  const isOwner = !!(user && user.role === 'organiser' && rawEvent.organiserId === user.id);

  res.json({ event: event, myReg: myReg, winners: winners, isOwner: isOwner });
});

module.exports = router;
