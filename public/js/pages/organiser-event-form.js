// public/js/pages/organiser-event-form.js  -  create OR edit an event
// ---------------------------------------------------------------
// /organiser/events/new        -> empty form, POST /api/organiser/events
// /organiser/events/5/edit     -> form filled with event 5, PUT /api/organiser/events/5
// ---------------------------------------------------------------

var isEdit = window.location.pathname.indexOf('/edit') !== -1;
var editId = isEdit ? pathNumbers()[0] : null;

var form = document.getElementById('eventForm');
var errorBox = document.getElementById('errorBox');
var submitBtn = document.getElementById('submitBtn');

// every input of the form (the id of the input is the same as the name of the event field)
var fieldIds = ['title', 'category', 'description', 'date', 'startTime', 'endTime', 'venue',
                'price', 'capacity', 'certTitle', 'signerName', 'signerRole', 'certMessage'];

// Display validation errors from the server.
function showErrors(list) {
  errorBox.innerHTML = '' +
    '<div class="alert alert-error">' +
      '<i class="bi bi-exclamation-triangle-fill"></i>' +
      '<div><strong>Fix these before saving:</strong><ul>' +
        list.map(function (msg) { return '<li>' + esc(msg) + '</li>'; }).join('') +
      '</ul></div>' +
    '</div>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// copy a saved event into the form inputs
function fillForm(event) {
  fieldIds.forEach(function (id) {
    document.getElementById(id).value = event[id];
  });
}

// read the form inputs into one object
function readForm() {
  var body = {};
  fieldIds.forEach(function (id) {
    body[id] = document.getElementById(id).value;
  });
  return body;
}

// Set up this page and load the information it needs.
function startPage(user) {
  if (isEdit) {
    document.title = 'Edit event | Eventify';
    document.getElementById('formTitle').textContent = 'Edit event';
    document.getElementById('formSub').textContent = 'Changes are visible to students immediately.';
    submitBtn.textContent = 'Save changes';

    var previewLink = document.getElementById('previewLink');
    previewLink.href = '/organiser/events/' + editId + '/certificate-preview?type=winner';
    previewLink.style.display = '';
    document.getElementById('cancelLink').href = '/organiser/events/' + editId + '/manage';

    api('/api/organiser/events/' + editId).then(function (data) {
      fillForm(data.event);
    }).catch(function (err) {
      flashNext('error', err.message);
      window.location.href = '/organiser/dashboard';
    });
  } else {
    document.title = 'Create event | Eventify';
    // a new event cannot be in the past
    document.getElementById('date').min = todayString();
    // the signer is the organiser by default
    document.getElementById('signerName').value = user.name;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.innerHTML = '';
    submitBtn.disabled = true;

    var request = isEdit
      ? api('/api/organiser/events/' + editId, 'PUT', readForm())
      : api('/api/organiser/events', 'POST', readForm());

    request.then(function (result) {
      flashNext('success', result.message);
      window.location.href = '/organiser/events/' + result.id + '/manage';
    }).catch(function (err) {
      submitBtn.disabled = false;
      showErrors(err.errors || [err.message]);
    });
  });
}
