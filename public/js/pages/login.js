// public/js/pages/login.js  -  login form
// ---------------------------------------------------------------
// We do not let the browser submit the form normally.
// We read the values, send them with fetch (POST /api/login) and
// look at the answer: error -> show it, success -> go to dashboard.
// ---------------------------------------------------------------

var form = document.getElementById('loginForm');
var messageBox = document.getElementById('formMessage');
var submitBtn = document.getElementById('submitBtn');

// Display a message beside the form.
function showMessage(type, text) {
  var icon = type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
  messageBox.innerHTML = '<div class="alert alert-' + type + '"><i class="bi ' + icon + '"></i> ' + esc(text) + '</div>';
}

// Return the role selected in the form.
function selectedRole() {
  return document.querySelector('input[name="role"]:checked').value;
}

// Set up this page and load the information it needs.
function startPage(user) {
  // already logged in? go to your dashboard
  if (user) {
    window.location.href = user.role === 'organiser' ? '/organiser/dashboard' : '/student/dashboard';
    return;
  }

  // /login?role=organiser  selects the organiser tab
  var role = getQuery('role') === 'organiser' ? 'organiser' : 'student';
  document.getElementById('role-' + role).checked = true;
  document.getElementById('registerLink').href = '/register?role=' + role;

  // /login?need=1  means "you must log in to open that page"
  if (getQuery('need')) {
    showMessage('info', 'Please log in to continue.');
  }

  // demo buttons fill the form
  document.querySelectorAll('.demo-fill').forEach(function (button) {
    button.addEventListener('click', function () {
      document.getElementById('email').value = button.getAttribute('data-email');
      document.getElementById('password').value = button.getAttribute('data-password');
      document.getElementById('role-' + button.getAttribute('data-role')).checked = true;
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();   // stop the normal page reload

    var body = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      role: selectedRole()
    };

    submitBtn.disabled = true;
    api('/api/login', 'POST', body).then(function (result) {
      flashNext('success', 'Welcome back, ' + result.name.split(' ')[0] + '.');
      window.location.href = result.redirect;
    }).catch(function (err) {
      submitBtn.disabled = false;
      showMessage('error', err.message);
    });
  });
}
