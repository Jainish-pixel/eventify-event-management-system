const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
app.use(express.json());                                  // read JSON sent by fetch() -> req.body
app.use(express.static(path.join(__dirname, 'public')));  // serve css / js / images
app.use(session({
  secret: 'eventify-secret-key',   // used to sign the session cookie
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 3 }  // login stays for 3 hours
}));

// 2. API routes  (they send JSON data)
app.use('/', require('./routes/auth'));                    // /api/me, /api/login, /api/register, /logout
app.use('/api', require('./routes/events'));               // /api/home, /api/events
app.use('/api/student', require('./routes/student'));
app.use('/api/organiser', require('./routes/organiser'));

// 3. Page routes  (they send the HTML files)
app.use('/', require('./routes/pages'));

// 4. Not found: JSON for /api urls, the 404 page for everything else
app.use('/api', function (req, res) {
  res.status(404).json({ error: 'API route not found.' });
});
app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
});

// 5. Any other error
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, function () {
  console.log('Eventify is running at http://localhost:' + PORT);
});
