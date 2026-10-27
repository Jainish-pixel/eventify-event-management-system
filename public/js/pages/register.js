// public/js/pages/register.js  -  create account form
// ---------------------------------------------------------------
var form = document.getElementById('registerForm');
var messageBox = document.getElementById('formMessage');
var submitBtn = document.getElementById('submitBtn');

// Set up this page and load the information it needs.
function startPage(user) {
  if (user) {
    window.location.href = user.role === 'organiser' ? '/organiser/dashboard' : '/student/dashboard';
    return;
  }

  var role = getQuery('role') === 'organiser' ? 'organiser' : 'student';
  document.getElementById('role-' + role).checked = true;
  document.getElementById('loginLink').href = '/login?role=' + role;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var body = {
      role: document.querySelector('input[name="role"]:checked').value,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      college: document.getElementById('college').value,
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value
    };

    submitBtn.disabled = true;
    api('/api/register', 'POST', body).then(function (result) {
      flashNext('success', 'Account created. Welcome to Eventify, ' + result.name.split(' ')[0] + '.');
      window.location.href = result.redirect;
    }).catch(function (err) {
      submitBtn.disabled = false;
      messageBox.innerHTML = '<div class="alert alert-error"><i class="bi bi-exclamation-triangle-fill"></i> ' + esc(err.message) + '</div>';
    });
  });
}
