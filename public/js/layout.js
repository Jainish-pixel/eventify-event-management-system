// public/js/layout.js  -  the part that is the same on every page
// ---------------------------------------------------------------
// Every HTML page contains two empty boxes:
//     <div id="site-header"></div>   and   <div id="site-footer"></div>
// This file fills them with the menu and the footer.
//
// Order of work:
//   1. ask the server who is logged in      (GET /api/me)
//   2. draw the header and the footer
//   3. show a message (toast) if there is one waiting
//   4. call  startPage(user)  - the function written in the page's own js file
//
// This file must be the LAST script on the page, so that startPage already exists.
// ---------------------------------------------------------------

var currentUser = null;

// ---------- header ----------
function headerHtml(user) {
  var here = window.location.pathname;

  function active(prefix, exact) {
    if (exact) return here === prefix ? 'active' : '';
    return here.indexOf(prefix) === 0 ? 'active' : '';
  }

  var links = '<a href="/" class="' + active('/', true) + '">Home</a>' +
              '<a href="/events" class="' + active('/events') + '">Events</a>';
  var dropdownLinks = '';

  if (user && user.role === 'student') {
    links += '<a href="/student/dashboard" class="' + active('/student/dashboard') + '">My events</a>' +
             '<a href="/student/attendance" class="' + active('/student/attendance') + '">Attendance</a>' +
             '<a href="/student/certificates" class="' + active('/student/certificates') + '">Certificates</a>';
    dropdownLinks = '<a href="/student/dashboard"><i class="bi bi-grid"></i> My events</a>' +
                    '<a href="/student/attendance"><i class="bi bi-check2-square"></i> Attendance</a>' +
                    '<a href="/student/certificates"><i class="bi bi-award"></i> Certificates</a>';
  } else if (user && user.role === 'organiser') {
    links += '<a href="/organiser/dashboard" class="' + active('/organiser/dashboard') + '">Dashboard</a>' +
             '<a href="/organiser/events/new" class="' + active('/organiser/events/new') + '">Create event</a>';
    dropdownLinks = '<a href="/organiser/dashboard"><i class="bi bi-grid"></i> Dashboard</a>' +
                    '<a href="/organiser/events/new"><i class="bi bi-plus-circle"></i> Create event</a>';
  }

  var actions;
  if (user) {
    actions = '' +
      '<div class="user-menu">' +
        '<button class="user-btn" id="userBtn" type="button" aria-haspopup="true">' +
          '<span class="avatar">' + esc(initials(user.name)) + '</span>' +
          '<span class="user-name">' + esc(user.name.split(' ')[0]) + '</span>' +
          '<i class="bi bi-chevron-down"></i>' +
        '</button>' +
        '<div class="dropdown" id="userDropdown">' +
          '<div class="dropdown-head">' +
            '<strong>' + esc(user.name) + '</strong>' +
            '<span>' + esc(user.email) + '</span>' +
            '<em class="role-tag role-' + user.role + '">' + user.role + '</em>' +
          '</div>' +
          dropdownLinks +
          '<a href="/logout" class="logout"><i class="bi bi-box-arrow-right"></i> Log out</a>' +
        '</div>' +
      '</div>';
  } else {
    actions = '<a href="/login" class="btn btn-ghost btn-sm">Log in</a>' +
              '<a href="/register" class="btn btn-primary btn-sm">Sign up</a>';
  }

  return '' +
    '<header class="nav-wrap no-print">' +
      '<nav class="navbar" id="navbar">' +
        '<a href="/" class="brand">' +
          '<span class="brand-mark"><i class="bi bi-ticket-perforated-fill"></i></span>' +
          '<span class="brand-name">Eventify</span>' +
        '</a>' +
        '<button class="nav-toggle" id="navToggle" type="button" aria-label="Open menu"><i class="bi bi-list"></i></button>' +
        '<div class="nav-links">' + links + '</div>' +
        '<div class="nav-actions">' +
          '<button class="icon-btn" id="themeToggle" type="button" aria-label="Switch light or dark theme"><i class="bi bi-moon-stars"></i></button>' +
          actions +
        '</div>' +
      '</nav>' +
    '</header>';
}

// ---------- footer ----------
function footerHtml() {
  return '' +
    '<footer class="footer no-print">' +
      '<div class="container footer-grid">' +
        '<div class="footer-brand">' +
          '<a href="/" class="brand brand-light">' +
            '<span class="brand-mark"><i class="bi bi-ticket-perforated-fill"></i></span>' +
            '<span class="brand-name">Eventify</span>' +
          '</a>' +
          '<p>One place for every workshop, fest and competition on campus. Register, attend and collect your certificate.</p>' +
        '</div>' +
        '<div>' +
          '<h4>Explore</h4>' +
          '<a href="/events">All events</a>' +
          '<a href="/events?show=past">Past events</a>' +
          '<a href="/events?category=Hackathon&show=all">Hackathons</a>' +
        '</div>' +
        '<div>' +
          '<h4>For students</h4>' +
          '<a href="/register?role=student">Create account</a>' +
          '<a href="/login?role=student">Student login</a>' +
        '</div>' +
        '<div>' +
          '<h4>For organisers</h4>' +
          '<a href="/register?role=organiser">Host an event</a>' +
          '<a href="/login?role=organiser">Organiser login</a>' +
        '</div>' +
      '</div>' +
      '<div class="container footer-bottom">' +
        '<span>Eventify, a college event management project built with Node.js, Express and plain HTML, CSS and JavaScript.</span>' +
      '</div>' +
    '</footer>';
}

// ---------- toast message (small popup) ----------
function showToast(type, text) {
  var old = document.getElementById('toast');
  if (old) old.remove();

  var icon = 'bi-info-circle-fill';
  if (type === 'success') icon = 'bi-check-circle-fill';
  if (type === 'error') icon = 'bi-exclamation-triangle-fill';

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type + ' no-print';
  toast.id = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<i class="bi ' + icon + '"></i><span>' + esc(text) + '</span>' +
    '<button type="button" class="toast-close" aria-label="Dismiss"><i class="bi bi-x-lg"></i></button>';
  document.body.appendChild(toast);

  function hideToast() {
    toast.classList.add('hide');
    setTimeout(function () { toast.remove(); }, 350);
  }
  toast.querySelector('.toast-close').addEventListener('click', hideToast);
  setTimeout(hideToast, 5500);
}

// ---------- menu behaviour ----------
function setupHeader() {
  // dark / light theme
  var themeToggle = document.getElementById('themeToggle');
  function updateThemeIcon() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  }
  updateThemeIcon();
  themeToggle.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    try { localStorage.setItem('theme', newTheme); } catch (e) {}
    updateThemeIcon();
  });

  // mobile menu
  document.getElementById('navToggle').addEventListener('click', function () {
    document.getElementById('navbar').classList.toggle('open');
  });

  // user dropdown
  var userBtn = document.getElementById('userBtn');
  var userDropdown = document.getElementById('userDropdown');
  if (userBtn) {
    userBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function () {
      userDropdown.classList.remove('open');
    });
  }
}

// ---------- start ----------
// apply the saved theme as early as possible (no white flash)
try {
  var savedTheme = localStorage.getItem('theme');
  if (savedTheme) { document.documentElement.setAttribute('data-theme', savedTheme); }
} catch (e) {}

api('/api/me')
  .then(function (data) {
    currentUser = data.user;

    document.getElementById('site-header').innerHTML = headerHtml(currentUser);
    var footer = document.getElementById('site-footer');
    if (footer) footer.innerHTML = footerHtml();
    setupHeader();

    // a message saved by the previous page (see flashNext in api.js)
    try {
      var saved = sessionStorage.getItem('flash');
      if (saved) {
        sessionStorage.removeItem('flash');
        var message = JSON.parse(saved);
        showToast(message.type, message.text);
      }
    } catch (e) {}

    // now the page can use the data
    if (typeof startPage === 'function') {
      try {
        startPage(currentUser);
      } catch (err) {
        console.error(err);
      }
    }
  })
  .catch(function () {
    document.body.insertAdjacentHTML('afterbegin',
      '<p style="padding:2rem;font-family:sans-serif">Could not reach the server. Is it running?</p>');
  });
