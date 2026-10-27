// Allow only logged-in students to continue.
function requireStudent(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please log in as a student to continue.' });
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ error: 'This action is only for students.' });
  }
  next(); // everything is fine, go to the route
}

// Allow only logged-in organisers to continue.
function requireOrganiser(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please log in as an organiser to continue.' });
  }
  if (req.session.user.role !== 'organiser') {
    return res.status(403).json({ error: 'This action is only for organisers.' });
  }
  next();
}

// Check access before showing a student page.
function studentPage(req, res, next) {
  if (!req.session.user) return res.redirect('/login?role=student&need=1');
  if (req.session.user.role !== 'student') return res.redirect('/organiser/dashboard');
  next();
}

// Check access before showing an organiser page.
function organiserPage(req, res, next) {
  if (!req.session.user) return res.redirect('/login?role=organiser&need=1');
  if (req.session.user.role !== 'organiser') return res.redirect('/student/dashboard');
  next();
}

module.exports = { requireStudent, requireOrganiser, studentPage, organiserPage };
