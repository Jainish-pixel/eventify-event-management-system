// public/js/pages/student-attendance.js  -  my attendance
// ---------------------------------------------------------------

// Build one student row for attendance.
function attendanceRowHtml(r) {
  var badge;
  if (r.state === 'present') {
    badge = '<span class="badge badge-success"><i class="bi bi-check2-circle"></i> Present</span>';
  } else if (r.state === 'absent') {
    badge = '<span class="badge badge-danger"><i class="bi bi-x-circle"></i> Absent</span>';
  } else {
    badge = '<span class="badge badge-muted"><i class="bi bi-hourglass-split"></i> Pending</span>';
  }

  var action = r.state === 'present'
    ? '<a class="btn btn-outline btn-sm" href="/student/certificate/' + r.reg.id + '/participation">Certificate</a>'
    : '<a class="btn btn-ghost btn-sm" href="/student/ticket/' + r.reg.id + '">Ticket</a>';

  return '' +
    '<tr>' +
      '<td data-label="Event"><a class="table-link" href="/events/' + r.event.id + '">' + esc(r.event.title) + '</a><small>' + esc(r.event.venue) + '</small></td>' +
      '<td data-label="Date">' + formatDate(r.event.date) + '</td>' +
      '<td data-label="Attendance">' + badge + '</td>' +
      '<td class="table-actions">' + action + '</td>' +
    '</tr>';
}

// Set up this page and load the information it needs.
function startPage() {
  api('/api/student/attendance').then(function (data) {
    var s = data.summary;

    document.getElementById('ring').style.setProperty('--p', s.percent);
    document.getElementById('percentText').textContent = s.percent + '%';
    document.getElementById('ringText').textContent = s.finished === 0
      ? 'Your percentage appears after your first event is over.'
      : 'You attended ' + s.present + ' of ' + s.finished + ' finished events.';

    document.getElementById('statPresent').textContent = s.present;
    document.getElementById('statAbsent').textContent = s.absent;
    document.getElementById('statPending').textContent = s.pending;

    var box = document.getElementById('attendanceBox');
    if (data.rows.length === 0) {
      box.innerHTML = emptyHtml('bi-check2-square', 'Nothing to show yet',
        'Register for an event and your attendance record will start here.', '/events', 'Browse events', 'empty-inline');
    } else {
      box.innerHTML = '' +
        '<div class="table-wrap"><table class="table">' +
          '<thead><tr><th>Event</th><th>Date</th><th>Attendance</th><th></th></tr></thead>' +
          '<tbody>' + data.rows.map(attendanceRowHtml).join('') + '</tbody>' +
        '</table></div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });
}
