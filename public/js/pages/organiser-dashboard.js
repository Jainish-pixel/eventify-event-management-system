// public/js/pages/organiser-dashboard.js  -  organiser's list of events
// ---------------------------------------------------------------

// Build one row in the organiser’s event table.
function eventRowHtml(e) {
  var cat = getCategory(e.category);
  var results = e.results
    ? '<span class="badge badge-success">Announced</span>'
    : '<span class="badge badge-muted">Not yet</span>';

  return '' +
    '<tr>' +
      '<td data-label="Event">' +
        '<a class="table-link" href="/organiser/events/' + e.id + '/manage">' + cat.emoji + ' ' + esc(e.title) + '</a>' +
        '<small><span class="status status-' + e.status + ' status-flat">' + statusText(e.status) + '</span> ' + esc(e.venue) + '</small>' +
      '</td>' +
      '<td data-label="Date">' + formatDate(e.date) + '<small>' + formatTime(e.startTime) + '</small></td>' +
      '<td data-label="Registered">' + e.registered + ' / ' + e.capacity + '</td>' +
      '<td data-label="Present">' + e.present + '</td>' +
      '<td data-label="Results">' + results + '</td>' +
      '<td class="table-actions">' +
        '<a class="btn btn-primary btn-sm" href="/organiser/events/' + e.id + '/manage">Manage</a>' +
        '<a class="btn btn-outline btn-sm" href="/organiser/events/' + e.id + '/edit">Edit</a>' +
        '<button class="btn btn-danger-outline btn-sm" type="button" data-delete="' + e.id + '" data-title="' + esc(e.title) + '" aria-label="Delete event"><i class="bi bi-trash3"></i></button>' +
      '</td>' +
    '</tr>';
}

// Set up this page and load the information it needs.
function startPage(user) {
  document.getElementById('greeting').textContent = 'Hi, ' + user.name.split(' ')[0];

  api('/api/organiser/dashboard').then(function (data) {
    document.getElementById('statEvents').textContent = data.stats.events;
    document.getElementById('statUpcoming').textContent = data.stats.upcoming;
    document.getElementById('statRegistrations').textContent = data.stats.registrations;
    document.getElementById('statPresent').textContent = data.stats.present;

    var box = document.getElementById('eventsBox');
    if (data.events.length === 0) {
      box.innerHTML = emptyHtml('bi-calendar2-plus', 'You have not created an event yet',
        'Add the name, timing, venue and seats. Students can register as soon as you publish it.',
        '/organiser/events/new', 'Create your first event', 'empty-inline');
    } else {
      box.innerHTML = '' +
        '<div class="table-wrap"><table class="table">' +
          '<thead><tr><th>Event</th><th>Date</th><th>Registered</th><th>Present</th><th>Results</th><th></th></tr></thead>' +
          '<tbody>' + data.events.map(eventRowHtml).join('') + '</tbody>' +
        '</table></div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });

  // delete buttons (event delegation, because the rows are created by js)
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-delete]');
    if (!button) return;

    var title = button.getAttribute('data-title');
    if (!confirm('Delete "' + title + '" and all of its registrations? This cannot be undone.')) return;

    api('/api/organiser/events/' + button.getAttribute('data-delete'), 'DELETE').then(function (result) {
      flashNext('success', result.message);
      window.location.reload();
    }).catch(function (err) {
      showToast('error', err.message);
    });
  });
}
