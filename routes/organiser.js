// routes/organiser.js  -  everything an ORGANISER can do   (URL prefix: /api/organiser)
// ---------------------------------------------------------------
const express = require('express');
const { readData, saveData, nextId } = require('../db');
const h = require('../helpers');
const { requireOrganiser } = require('../middleware');

const router = express.Router();

// every route in this file needs a logged-in organiser
router.use(requireOrganiser);

// ---------- small helper functions ----------

// find an event that belongs to the logged-in organiser (or undefined)
function findOwnEvent(data, eventId, organiserId) {
  return data.events.find(function (e) {
    return e.id === Number(eventId) && e.organiserId === organiserId;
  });
}

// all ACTIVE registrations of an event, together with student details
function getRows(data, eventId) {
  const rows = [];
  data.registrations.forEach(function (reg) {
    if (reg.eventId === eventId && reg.status === 'registered') {
      const student = data.users.find(function (u) { return u.id === reg.studentId; });
      if (student) {
        rows.push({ reg: reg, student: student });
      }
    }
  });
  return rows;
}

// read the event form fields from req.body
function readEventForm(body, organiserName) {
  return {
    title: (body.title || '').trim(),
    description: (body.description || '').trim(),
    category: body.category || '',
    date: body.date || '',
    startTime: body.startTime || '',
    endTime: body.endTime || '',
    venue: (body.venue || '').trim(),
    price: Number(body.price) || 0,
    capacity: Number(body.capacity) || 0,
    certTitle: (body.certTitle || '').trim() || 'Certificate of Achievement',
    certMessage: (body.certMessage || '').trim() || 'In recognition of outstanding performance and dedication.',
    signerName: (body.signerName || '').trim() || organiserName,
    signerRole: (body.signerRole || '').trim() || 'Event Organiser'
  };
}

// check the form and return a list of problems (empty list = all good)
function checkEventForm(form, isNew, minCapacity) {
  const errors = [];
  if (!form.title) errors.push('Give your event a name.');
  if (!form.description) errors.push('Add a short description so students know what to expect.');
  if (!h.categoryNames.includes(form.category)) errors.push('Pick a category.');
  if (!form.date) errors.push('Choose the event date.');
  if (!form.startTime || !form.endTime) errors.push('Set the start time and end time.');
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.push('The end time must be after the start time.');
  }
  if (!form.venue) errors.push('Enter the venue.');
  if (form.price < 0) errors.push('Ticket price cannot be negative. Enter 0 for a free event.');
  if (!Number.isInteger(form.capacity) || form.capacity < 1) {
    errors.push('Capacity must be a whole number of at least 1.');
  }
  if (isNew && form.date && form.date < h.todayString()) {
    errors.push('The event date cannot be in the past.');
  }
  if (!isNew && form.capacity < minCapacity) {
    errors.push('Capacity cannot be lower than the ' + minCapacity + ' students already registered.');
  }
  return errors;
}

// ---------- DASHBOARD ----------
router.get('/dashboard', function (req, res) {
  const data = readData();
  const me = req.session.user;

  const events = data.events
    .filter(function (e) { return e.organiserId === me.id; })
    .map(function (e) {
      const ev = h.decorateEvent(e, data);
      // how many students were marked present?
      ev.present = data.registrations.filter(function (r) {
        return r.eventId === e.id && r.status === 'registered' && r.attended;
      }).length;
      return ev;
    })
    .sort(h.sortByDate)
    .reverse();

  let totalRegistrations = 0;
  let totalPresent = 0;
  let upcomingCount = 0;
  events.forEach(function (e) {
    totalRegistrations += e.registered;
    totalPresent += e.present;
    if (e.status !== 'completed') upcomingCount++;
  });

  res.json({
    events: events,
    stats: {
      events: events.length,
      upcoming: upcomingCount,
      registrations: totalRegistrations,
      present: totalPresent
    }
  });
});

// ---------- CREATE EVENT ----------
router.post('/events', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const form = readEventForm(req.body, me.name);
  const errors = checkEventForm(form, true, 0);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  const newEvent = Object.assign({}, form, {
    id: nextId(data.events),
    organiserId: me.id,
    results: null,
    createdAt: new Date().toISOString()
  });
  data.events.push(newEvent);
  saveData(data);

  res.json({ ok: true, id: newEvent.id, message: '"' + newEvent.title + '" is live. Students can register now.' });
});

// ---------- GET ONE EVENT (to fill the edit form) ----------
router.get('/events/:id', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  res.json({ event: event, registered: getRows(data, event.id).length });
});

// ---------- EDIT EVENT ----------
router.put('/events/:id', function (req, res) {
  const data = readData();
  const me = req.session.user;
  const event = findOwnEvent(data, req.params.id, me.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const form = readEventForm(req.body, me.name);
  const registeredCount = getRows(data, event.id).length;
  const errors = checkEventForm(form, false, registeredCount);

  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  Object.assign(event, form);   // copy the new values into the saved event
  saveData(data);
  res.json({ ok: true, id: event.id, message: 'Event details updated.' });
});

// ---------- DELETE EVENT ----------
router.delete('/events/:id', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // remove the event and every registration of that event
  data.events = data.events.filter(function (e) { return e.id !== event.id; });
  data.registrations = data.registrations.filter(function (r) { return r.eventId !== event.id; });
  saveData(data);

  res.json({ ok: true, message: '"' + event.title + '" was deleted.' });
});

// ---------- MANAGE EVENT (registrations, attendance, results) ----------
router.get('/events/:id/manage', function (req, res) {
  const data = readData();
  const raw = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!raw) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const rows = getRows(data, raw.id).map(function (r) {
    return {
      regId: r.reg.id,
      ticketCode: r.reg.ticketCode,
      attended: r.reg.attended,
      studentId: r.student.id,
      name: r.student.name,
      email: r.student.email,
      college: r.student.college || ''
    };
  });

  // names of the winners (if results are announced)
  const winners = [];
  if (raw.results) {
    [['first', 1], ['second', 2], ['third', 3]].forEach(function (pair) {
      const student = data.users.find(function (u) { return u.id === raw.results[pair[0]]; });
      if (student) {
        winners.push({ position: pair[1], name: student.name });
      }
    });
  }

  res.json({
    event: h.decorateEvent(raw, data),
    results: raw.results,
    rows: rows,
    winners: winners
  });
});

// ---------- SAVE ATTENDANCE ----------
router.post('/events/:id/attendance', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // the browser sends the ids of the ticked students:  { present: [3, 5, 8] }
  const presentIds = [].concat(req.body.present || []).map(Number);

  data.registrations.forEach(function (reg) {
    if (reg.eventId === event.id && reg.status === 'registered') {
      reg.attended = presentIds.includes(reg.id);
    }
  });

  let message = 'Attendance saved. ' + presentIds.length + ' student(s) marked present.';

  // a winner must be present, so remove results if a winner was marked absent
  if (event.results) {
    const winnerIds = [event.results.first, event.results.second, event.results.third];
    const stillPresent = winnerIds.every(function (id) {
      if (!id) return true;
      return data.registrations.some(function (r) {
        return r.eventId === event.id && r.studentId === id && r.status === 'registered' && r.attended;
      });
    });
    if (!stillPresent) {
      event.results = null;
      message += ' A winner was marked absent, so the results were removed. Announce them again.';
    }
  }

  saveData(data);
  res.json({ ok: true, message: message });
});

// ---------- ANNOUNCE RESULTS ----------
router.post('/events/:id/results', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const first = Number(req.body.first) || null;
  const second = Number(req.body.second) || null;
  const third = Number(req.body.third) || null;

  if (!first) {
    return res.status(400).json({ error: 'Choose at least the first place winner.' });
  }

  // the same student cannot win two positions
  const chosen = [first, second, third].filter(Boolean);
  const unique = chosen.filter(function (id, index) { return chosen.indexOf(id) === index; });
  if (unique.length !== chosen.length) {
    return res.status(400).json({ error: 'One student cannot hold two positions. Pick different students.' });
  }

  // every winner must be a registered student who was marked present
  const allPresent = chosen.every(function (id) {
    return data.registrations.some(function (r) {
      return r.eventId === event.id && r.studentId === id && r.status === 'registered' && r.attended;
    });
  });
  if (!allPresent) {
    return res.status(400).json({ error: 'Winners must be students who are marked present.' });
  }

  event.results = {
    first: first,
    second: second,
    third: third,
    note: (req.body.note || '').trim(),
    announcedAt: new Date().toISOString()
  };
  saveData(data);

  res.json({ ok: true, message: 'Results announced. Winners can now download their certificates.' });
});

// ---------- REMOVE RESULTS ----------
router.delete('/events/:id/results', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }
  event.results = null;
  saveData(data);
  res.json({ ok: true, message: 'Results removed. You can announce them again.' });
});

// ---------- CERTIFICATE PREVIEW (with a sample name) ----------
router.get('/events/:id/certificate-preview', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const type = req.query.type === 'participation' ? 'participation' : 'winner';
  res.json({
    event: h.decorateEvent(event, data),
    studentName: 'Student Name',
    type: type,
    position: type === 'winner' ? 1 : 0,
    certId: 'EVT' + event.id + '-SAMPLE',
    preview: true
  });
});

// ---------- EXPORT ATTENDEE LIST AS CSV (opens in Excel) ----------
// This is a normal link (not fetch), so the browser downloads the file.
router.get('/events/:id/export', function (req, res) {
  const data = readData();
  const event = findOwnEvent(data, req.params.id, req.session.user.id);
  if (!event) {
    return res.status(404).send('Event not found.');
  }

  function cell(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  let csv = 'Name,Email,College,Ticket Code,Attendance,Registered On\n';
  getRows(data, event.id).forEach(function (row) {
    csv += [
      cell(row.student.name),
      cell(row.student.email),
      cell(row.student.college || ''),
      cell(row.reg.ticketCode),
      cell(row.reg.attended ? 'Present' : 'Absent'),
      cell(h.formatDateTime(row.reg.registeredAt))
    ].join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="event-' + event.id + '-attendees.csv"');
  res.send(csv);
});

module.exports = router;
