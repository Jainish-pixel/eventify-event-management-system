// routes/student.js  -  everything a STUDENT can do   (URL prefix: /api/student)
// ---------------------------------------------------------------
const express = require('express');
const { readData, saveData, nextId } = require('../db');
const h = require('../helpers');
const { requireStudent } = require('../middleware');

const router = express.Router();

// every route in this file needs a logged-in student
router.use(requireStudent);

// Collect all ACTIVE registrations of one student with their event details
function getMyItems(data, studentId) {
  const items = [];
  data.registrations.forEach(function (reg) {
    if (reg.studentId === studentId && reg.status === 'registered') {
      const rawEvent = data.events.find(function (e) { return e.id === reg.eventId; });
      if (rawEvent) {
        items.push({
          reg: reg,
          event: h.decorateEvent(rawEvent, data),
          position: h.winnerPosition(rawEvent, studentId)   // 0 if not a winner
        });
      }
    }
  });
  return items;
}

// Sort a student’s registrations by event date.
function sortItems(a, b) {
  return h.sortByDate(a.event, b.event);
}

// ---------- DASHBOARD ----------
router.get('/dashboard', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const items = getMyItems(data, me.id);

  const upcoming = items.filter(function (i) { return i.event.status !== 'completed'; }).sort(sortItems);
  const past = items.filter(function (i) { return i.event.status === 'completed'; }).sort(sortItems).reverse();

  let attended = 0;
  let certificates = 0;
  items.forEach(function (i) {
    if (i.reg.attended) { attended++; certificates++; }  // participation certificate
    if (i.position > 0) { certificates++; }              // winner certificate
  });

  res.json({
    upcoming: upcoming,
    past: past,
    next: upcoming[0] || null,
    stats: { registered: items.length, upcoming: upcoming.length, attended: attended, certificates: certificates }
  });
});

// ---------- REGISTER FOR AN EVENT ----------
router.post('/register/:eventId', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const eventId = Number(req.params.eventId);
  const rawEvent = data.events.find(function (e) { return e.id === eventId; });

  if (!rawEvent) {
    return res.status(404).json({ error: 'That event does not exist.' });
  }

  const event = h.decorateEvent(rawEvent, data);

  if (event.status !== 'upcoming') {
    return res.status(400).json({ error: 'Registration is closed because this event has already started.' });
  }
  if (event.seatsLeft <= 0) {
    return res.status(400).json({ error: 'Sorry, this event is full.' });
  }

  // did this student register before?
  const existing = data.registrations.find(function (r) {
    return r.eventId === eventId && r.studentId === me.id;
  });

  if (existing && existing.status === 'registered') {
    return res.status(400).json({ error: 'You are already registered for this event.' });
  }

  let reg;
  if (existing) {
    // the student cancelled earlier and is registering again
    existing.status = 'registered';
    existing.attended = false;
    existing.registeredAt = new Date().toISOString();
    reg = existing;
  } else {
    reg = {
      id: nextId(data.registrations),
      eventId: eventId,
      studentId: me.id,
      ticketCode: h.makeTicketCode(eventId),
      status: 'registered',
      attended: false,
      registeredAt: new Date().toISOString()
    };
    data.registrations.push(reg);
  }

  saveData(data);
  res.json({ ok: true, regId: reg.id, message: 'You are registered. Your ticket is ready.' });
});

// ---------- CANCEL REGISTRATION ----------
router.post('/cancel/:regId', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const reg = data.registrations.find(function (r) {
    return r.id === Number(req.params.regId) && r.studentId === me.id && r.status === 'registered';
  });

  if (!reg) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  const rawEvent = data.events.find(function (e) { return e.id === reg.eventId; });
  if (h.getStatus(rawEvent) !== 'upcoming') {
    return res.status(400).json({ error: 'You can only cancel before the event starts.' });
  }

  reg.status = 'cancelled';
  saveData(data);
  res.json({ ok: true, message: 'Registration cancelled for "' + rawEvent.title + '".' });
});

// ---------- VIEW TICKET ----------
router.get('/ticket/:regId', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const reg = data.registrations.find(function (r) {
    return r.id === Number(req.params.regId) && r.studentId === me.id && r.status === 'registered';
  });

  if (!reg) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const rawEvent = data.events.find(function (e) { return e.id === reg.eventId; });
  const student = data.users.find(function (u) { return u.id === me.id; });

  res.json({
    reg: reg,
    event: h.decorateEvent(rawEvent, data),
    student: { name: student.name, email: student.email }
  });
});

// ---------- MY ATTENDANCE ----------
router.get('/attendance', function (req, res) {
  const data = readData();
  const items = getMyItems(data, req.session.user.id).sort(sortItems).reverse();

  let present = 0;
  let absent = 0;
  let pending = 0;

  const rows = items.map(function (i) {
    let state;
    if (i.reg.attended) {
      state = 'present';
      present++;
    } else if (i.event.status === 'completed') {
      state = 'absent';
      absent++;
    } else {
      state = 'pending';
      pending++;
    }
    return { reg: i.reg, event: i.event, state: state };
  });

  // percentage is calculated only from events that are finished
  const finished = present + absent;
  const percent = finished > 0 ? Math.round((present / finished) * 100) : 0;

  res.json({
    rows: rows,
    summary: { present: present, absent: absent, pending: pending, percent: percent, finished: finished }
  });
});

// ---------- MY CERTIFICATES ----------
router.get('/certificates', function (req, res) {
  const data = readData();
  const items = getMyItems(data, req.session.user.id).sort(sortItems).reverse();

  const earned = [];
  items.forEach(function (i) {
    if (i.position > 0) {
      earned.push({ type: 'winner', position: i.position, reg: i.reg, event: i.event });
    }
    if (i.reg.attended) {
      earned.push({ type: 'participation', position: 0, reg: i.reg, event: i.event });
    }
  });

  res.json({ earned: earned });
});

// ---------- DATA FOR ONE CERTIFICATE ----------
router.get('/certificate/:regId/:type', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const type = req.params.type;

  if (type !== 'participation' && type !== 'winner') {
    return res.status(404).json({ error: 'Unknown certificate type.' });
  }

  const reg = data.registrations.find(function (r) {
    return r.id === Number(req.params.regId) && r.studentId === me.id && r.status === 'registered';
  });
  if (!reg) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }

  const rawEvent = data.events.find(function (e) { return e.id === reg.eventId; });
  const position = h.winnerPosition(rawEvent, me.id);

  // rules: participation needs attendance, winner needs a position
  if (type === 'participation' && !reg.attended) {
    return res.status(403).json({ error: 'Your attendance has not been marked for this event yet.' });
  }
  if (type === 'winner' && position === 0) {
    return res.status(403).json({ error: 'You are not among the winners of this event.' });
  }

  const student = data.users.find(function (u) { return u.id === me.id; });

  res.json({
    event: h.decorateEvent(rawEvent, data),
    studentName: student.name,
    type: type,
    position: type === 'winner' ? position : 0,
    certId: 'EVT' + rawEvent.id + '-' + type.charAt(0).toUpperCase() + '-' + String(reg.id).padStart(4, '0'),
    preview: false
  });
});

module.exports = router;
