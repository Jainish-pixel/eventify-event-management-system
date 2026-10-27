// routes/auth.js  -  who am I, register, login, logout
// ---------------------------------------------------------------
// These routes return JSON. The pages (login.html, register.html)
// send the form data with fetch() and show the answer.
// ---------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcryptjs');
const { readData, saveData, nextId } = require('../db');

const router = express.Router();

// Where should each role go after login?
function dashboardFor(role) {
  return role === 'organiser' ? '/organiser/dashboard' : '/student/dashboard';
}

// ---------- WHO IS LOGGED IN? ----------
// Every page calls this first so that the menu can show the right links.
router.get('/api/me', function (req, res) {
  res.json({ user: req.session.user || null });
});

// ---------- LOGIN ----------
router.post('/api/login', function (req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const role = req.body.role === 'organiser' ? 'organiser' : 'student';

  const data = readData();
  const found = data.users.find(function (u) {
    return u.email === email;
  });

  // 1. email must exist and the password must match the saved hash
  if (!found || !bcrypt.compareSync(password, found.password)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  // 2. the chosen login type must match the account type
  if (found.role !== role) {
    return res.status(400).json({
      error: 'This account is registered as ' + found.role + '. Choose the "' + found.role + '" tab to log in.'
    });
  }

  // 3. save the user in the session (this is what keeps the user logged in)
  req.session.user = { id: found.id, name: found.name, email: found.email, role: found.role };
  res.json({ ok: true, redirect: dashboardFor(found.role), name: found.name });
});

// ---------- REGISTER ----------
router.post('/api/register', function (req, res) {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const confirm = req.body.confirmPassword || '';
  const role = req.body.role === 'organiser' ? 'organiser' : 'student';
  const college = (req.body.college || '').trim();

  const data = readData();

  // validation: check one rule at a time
  let error = null;
  if (!name || !email || !password) {
    error = 'Please fill in your name, email and password.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    error = 'Enter a valid email address, like name@college.edu.';
  } else if (password.length < 6) {
    error = 'Use a password with at least 6 characters.';
  } else if (password !== confirm) {
    error = 'The two passwords do not match.';
  } else if (data.users.find(function (u) { return u.email === email; })) {
    error = 'An account with this email already exists. Try logging in.';
  }

  if (error) {
    return res.status(400).json({ error: error });
  }

  // create the new user (never save the plain password, save the hash)
  const newUser = {
    id: nextId(data.users),
    name: name,
    email: email,
    password: bcrypt.hashSync(password, 10),
    role: role,
    college: college,
    createdAt: new Date().toISOString()
  };
  data.users.push(newUser);
  saveData(data);

  req.session.user = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  res.json({ ok: true, redirect: dashboardFor(role), name: newUser.name });
});

// ---------- LOGOUT ----------
router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

module.exports = router;
