// public/js/pages/organiser-manage.js  -  manage one event
// (attendance, results, certificates)
// ---------------------------------------------------------------
var eventId = pathNumbers()[0];       // /organiser/events/3/manage  ->  3
var page = document.getElementById('managePage');

// ----- 1. attendance table -----
function attendanceHtml(rows) {
  if (rows.length === 0) {
    return emptyHtml('bi-people', 'No registrations yet',
      'Students who register will appear here so that you can mark their attendance.', '', '', 'empty-inline');
  }

  var body = rows.map(function (r) {
    return '' +
      '<tr>' +
        '<td data-label="Student"><div class="person">' +
          '<span class="avatar">' + esc(initials(r.name)) + '</span>' +
          '<div><strong>' + esc(r.name) + '</strong><small>' + esc(r.email) + '</small></div>' +
        '</div></td>' +
        '<td data-label="Department">' + esc(r.college || 'Not given') + '</td>' +
        '<td data-label="Ticket"><code>' + esc(r.ticketCode) + '</code></td>' +
        '<td data-label="Present" class="center">' +
          '<label class="switch">' +
            '<input type="checkbox" name="present" value="' + r.regId + '" ' + (r.attended ? 'checked' : '') + ' aria-label="Mark ' + esc(r.name) + ' present">' +
            '<span class="switch-track"></span>' +
          '</label>' +
        '</td>' +
      '</tr>';
  }).join('');

  return '' +
    '<form id="attendanceForm">' +
      '<div class="table-wrap"><table class="table">' +
        '<thead><tr><th>Student</th><th>Department</th><th>Ticket</th><th class="center">Present</th></tr></thead>' +
        '<tbody>' + body + '</tbody>' +
      '</table></div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-primary btn-lg" type="submit"><i class="bi bi-save"></i> Save attendance</button>' +
      '</div>' +
    '</form>';
}

// ----- 2. results form -----
function resultsHtml(data, presentRows) {
  var results = data.results;
  var html = '';

  if (results && data.winners.length > 0) {
    html += '<ul class="winner-list">' + data.winners.map(function (w) {
      return '<li><span class="winner-medal">' + positionMedal(w.position) + '</span>' +
             '<div><strong>' + esc(w.name) + '</strong><small>' + positionLabel(w.position) + '</small></div></li>';
    }).join('') + '</ul>';
  }

  if (presentRows.length === 0) {
    return html + emptyHtml('bi-trophy', 'Mark attendance first',
      'Save attendance above. The students marked present will be available here as winner choices.', '', '', 'empty-inline');
  }

  // one <select> for each position
  var slots = [['first', '🥇 First place', true], ['second', '🥈 Second place', false], ['third', '🥉 Third place', false]];
  var selects = slots.map(function (slot) {
    var options = '<option value="">Select student</option>' + presentRows.map(function (r) {
      var selected = results && results[slot[0]] === r.studentId ? 'selected' : '';
      return '<option value="' + r.studentId + '" ' + selected + '>' + esc(r.name) + '</option>';
    }).join('');
    return '' +
      '<div class="field">' +
        '<label for="' + slot[0] + '">' + slot[1] + ' ' + (slot[2] ? '' : '(optional)') + '</label>' +
        '<div class="input-wrap"><select id="' + slot[0] + '" name="' + slot[0] + '">' + options + '</select></div>' +
      '</div>';
  }).join('');

  html += '' +
    '<form id="resultsForm">' +
      '<div class="form-grid form-grid-3">' + selects + '</div>' +
      '<div class="field">' +
        '<label for="note">Message to students <small>(optional)</small></label>' +
        '<div class="input-wrap"><input type="text" id="note" name="note" value="' + esc(results ? results.note : '') + '" placeholder="Example: Congratulations to all participants."></div>' +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-accent btn-lg" type="submit"><i class="bi bi-megaphone"></i> ' + (results ? 'Update results' : 'Announce results') + '</button>' +
      '</div>' +
    '</form>';

  if (results) {
    html += '<div class="inline-form"><button type="button" class="btn btn-danger-outline btn-sm" id="clearResultsBtn">Remove results</button></div>';
  }
  return html;
}

// ----- 3. the whole page -----
function drawPage(data) {
  var event = data.event;
  var cat = getCategory(event.category);
  var presentRows = data.rows.filter(function (r) { return r.attended; });
  var results = data.results;
  document.title = 'Manage ' + event.title + ' | Eventify';

  page.innerHTML = '' +
    '<section class="manage-head cat-' + cat.slug + '">' +
      '<div class="container">' +
        '<a href="/organiser/dashboard" class="back-link"><i class="bi bi-arrow-left"></i> Dashboard</a>' +
        '<div class="manage-head-row">' +
          '<div>' +
            '<div class="chip-row">' +
              '<span class="chip"><i class="bi ' + cat.icon + '"></i> ' + esc(event.category) + '</span>' +
              '<span class="status status-' + event.status + '">' + statusText(event.status) + '</span>' +
            '</div>' +
            '<h1>' + esc(event.title) + '</h1>' +
            '<p class="hosted">' +
              '<i class="bi bi-calendar-event"></i> ' + formatDate(event.date) +
              ' &nbsp; <i class="bi bi-clock"></i> ' + formatTime(event.startTime) + ' to ' + formatTime(event.endTime) +
              ' &nbsp; <i class="bi bi-geo-alt"></i> ' + esc(event.venue) +
            '</p>' +
          '</div>' +
          '<div class="manage-actions">' +
            '<a class="btn btn-light btn-sm" href="/events/' + event.id + '">Public page</a>' +
            '<a class="btn btn-light btn-sm" href="/organiser/events/' + event.id + '/edit"><i class="bi bi-pencil"></i> Edit</a>' +
            '<a class="btn btn-light btn-sm" href="/api/organiser/events/' + event.id + '/export"><i class="bi bi-file-earmark-spreadsheet"></i> Export CSV</a>' +
            '<button class="btn btn-light btn-sm btn-text-danger" type="button" id="deleteBtn"><i class="bi bi-trash3"></i> Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section section-tight"><div class="container">' +

      '<div class="stat-cards">' +
        '<div class="stat-card"><i class="bi bi-people"></i><b>' + event.registered + '</b><span>Registered</span></div>' +
        '<div class="stat-card"><i class="bi bi-grid-3x3-gap"></i><b>' + event.seatsLeft + '</b><span>Seats left of ' + event.capacity + '</span></div>' +
        '<div class="stat-card"><i class="bi bi-check2-circle"></i><b>' + presentRows.length + '</b><span>Marked present</span></div>' +
        '<div class="stat-card"><i class="bi bi-trophy"></i><b>' + (results ? data.winners.length : 0) + '</b><span>Winners announced</span></div>' +
      '</div>' +

      '<nav class="jump-nav">' +
        '<a href="#attendance"><i class="bi bi-check2-square"></i> 1. Mark attendance</a>' +
        '<a href="#results"><i class="bi bi-trophy"></i> 2. Announce results</a>' +
        '<a href="#certificate"><i class="bi bi-award"></i> 3. Certificates</a>' +
      '</nav>' +

      // ---- attendance ----
      '<div class="panel" id="attendance">' +
        '<div class="panel-head">' +
          '<div><h2>Mark attendance</h2><p class="panel-sub">Switch on every student who attended, then save.</p></div>' +
          (data.rows.length > 0
            ? '<div class="panel-tools">' +
                '<button type="button" class="btn btn-outline btn-sm" id="checkAllBtn">Mark all present</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" id="clearAllBtn">Clear all</button>' +
              '</div>'
            : '') +
        '</div>' +
        attendanceHtml(data.rows) +
      '</div>' +

      // ---- results ----
      '<div class="panel" id="results">' +
        '<div class="panel-head">' +
          '<div><h2>Announce results</h2><p class="panel-sub">Only students marked present can be picked as winners.</p></div>' +
          (results ? '<span class="badge badge-success"><i class="bi bi-megaphone"></i> Announced</span>' : '') +
        '</div>' +
        resultsHtml(data, presentRows) +
      '</div>' +

      // ---- certificates ----
      '<div class="panel" id="certificate">' +
        '<div class="panel-head"><div><h2>Certificates</h2>' +
          '<p class="panel-sub">Students download them from their own account. Nothing else for you to send.</p></div></div>' +
        '<div class="cert-settings">' +
          '<dl>' +
            '<div><dt>Winner certificate title</dt><dd>' + esc(event.certTitle) + '</dd></div>' +
            '<div><dt>Appreciation message</dt><dd>' + esc(event.certMessage) + '</dd></div>' +
            '<div><dt>Signed by</dt><dd>' + esc(event.signerName) + ', ' + esc(event.signerRole) + '</dd></div>' +
            '<div><dt>Who can download</dt><dd>' + presentRows.length + ' student(s) marked present' + (results ? ', ' + data.winners.length + ' winner(s)' : '') + '</dd></div>' +
          '</dl>' +
          '<div class="cert-settings-actions">' +
            '<a class="btn btn-primary btn-sm" target="_blank" href="/organiser/events/' + event.id + '/certificate-preview?type=winner"><i class="bi bi-eye"></i> Preview winner certificate</a>' +
            '<a class="btn btn-outline btn-sm" target="_blank" href="/organiser/events/' + event.id + '/certificate-preview?type=participation"><i class="bi bi-eye"></i> Preview participation certificate</a>' +
            '<a class="btn btn-ghost btn-sm" href="/organiser/events/' + event.id + '/edit"><i class="bi bi-pencil"></i> Change certificate details</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

    '</div></section>';

  connectButtons(event);
}

// ----- 4. buttons and forms (connected after the page is drawn) -----
function connectButtons(event) {
  var base = '/api/organiser/events/' + event.id;

  // delete the whole event
  document.getElementById('deleteBtn').addEventListener('click', function () {
    if (!confirm('Delete this event and all of its registrations? This cannot be undone.')) return;
    api(base, 'DELETE').then(function (result) {
      flashNext('success', result.message);
      window.location.href = '/organiser/dashboard';
    }).catch(function (err) { showToast('error', err.message); });
  });

  // mark all present / clear all
  var checkAll = document.getElementById('checkAllBtn');
  var clearAll = document.getElementById('clearAllBtn');
  function setAll(value) {
    document.querySelectorAll('input[name="present"]').forEach(function (box) { box.checked = value; });
  }
  if (checkAll) checkAll.addEventListener('click', function () { setAll(true); });
  if (clearAll) clearAll.addEventListener('click', function () { setAll(false); });

  // save attendance: send the ids of all ticked boxes
  var attendanceForm = document.getElementById('attendanceForm');
  if (attendanceForm) {
    attendanceForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ids = [];
      document.querySelectorAll('input[name="present"]:checked').forEach(function (box) {
        ids.push(Number(box.value));
      });
      api(base + '/attendance', 'POST', { present: ids }).then(function (result) {
        showToast('success', result.message);
        load();     // draw the page again with the new data
      }).catch(function (err) { showToast('error', err.message); });
    });
  }

  // announce results
  var resultsForm = document.getElementById('resultsForm');
  if (resultsForm) {
    resultsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = {
        first: document.getElementById('first').value,
        second: document.getElementById('second').value,
        third: document.getElementById('third').value,
        note: document.getElementById('note').value
      };
      api(base + '/results', 'POST', body).then(function (result) {
        showToast('success', result.message);
        load();
      }).catch(function (err) { showToast('error', err.message); });
    });
  }

  // remove results
  var clearResults = document.getElementById('clearResultsBtn');
  if (clearResults) {
    clearResults.addEventListener('click', function () {
      if (!confirm('Remove the announced results?')) return;
      api(base + '/results', 'DELETE').then(function (result) {
        showToast('success', result.message);
        load();
      }).catch(function (err) { showToast('error', err.message); });
    });
  }
}

// ----- 5. load the data from the server and draw -----
function load() {
  var scrollY = window.scrollY;      // remember where the organiser was
  api('/api/organiser/events/' + eventId + '/manage').then(function (data) {
    drawPage(data);
    window.scrollTo(0, scrollY);
  }).catch(function (err) {
    flashNext('error', err.message);
    window.location.href = '/organiser/dashboard';
  });
}

// Set up this page and load the information it needs.
function startPage() {
  load();
}
