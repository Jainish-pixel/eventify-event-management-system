// public/js/pages/student-dashboard.js  -  "My events" page of a student
// ---------------------------------------------------------------

// the "your next event" banner
function nextBannerHtml(next) {
  var ev = next.event;
  return '' +
    '<div class="next-banner">' +
      '<div class="next-info">' +
        '<span class="next-label">Your next event</span>' +
        '<h2>' + esc(ev.title) + '</h2>' +
        '<p>' +
          '<i class="bi bi-calendar-event"></i> ' + formatDate(ev.date) +
          ' &nbsp; <i class="bi bi-clock"></i> ' + formatTime(ev.startTime) +
          ' &nbsp; <i class="bi bi-geo-alt"></i> ' + esc(ev.venue) +
        '</p>' +
        '<a href="/student/ticket/' + next.reg.id + '" class="btn btn-accent">Open ticket</a>' +
      '</div>' +
      '<div class="countdown" id="countdown">' +
        '<div><b id="cdDays">0</b><span>days</span></div>' +
        '<div><b id="cdHours">0</b><span>hours</span></div>' +
        '<div><b id="cdMinutes">0</b><span>minutes</span></div>' +
      '</div>' +
    '</div>';
}

// counts down to the start of the event
function startCountdown(ev) {
  var eventTime = new Date(ev.date + 'T' + ev.startTime).getTime();

  function tick() {
    var diff = eventTime - Date.now();
    if (diff < 0) diff = 0;
    var minutes = Math.floor(diff / 60000);
    document.getElementById('cdDays').textContent = Math.floor(minutes / (60 * 24));
    document.getElementById('cdHours').textContent = Math.floor((minutes % (60 * 24)) / 60);
    document.getElementById('cdMinutes').textContent = minutes % 60;
  }

  tick();
  setInterval(tick, 30000);
}

// Set up this page and load the information it needs.
function startPage(user) {
  document.getElementById('greeting').textContent = 'Hi, ' + user.name.split(' ')[0];

  api('/api/student/dashboard').then(function (data) {
    document.getElementById('statRegistered').textContent = data.stats.registered;
    document.getElementById('statUpcoming').textContent = data.stats.upcoming;
    document.getElementById('statAttended').textContent = data.stats.attended;
    document.getElementById('statCertificates').textContent = data.stats.certificates;

    if (data.next) {
      document.getElementById('nextBox').innerHTML = nextBannerHtml(data.next);
      startCountdown(data.next.event);
    }

    var upcomingBox = document.getElementById('upcomingBox');
    if (data.upcoming.length === 0) {
      upcomingBox.innerHTML = emptyHtml('bi-calendar2-plus', 'You have no upcoming events',
        'Browse the events list and register for something that interests you.', '/events', 'Browse events', 'empty-inline');
    } else {
      upcomingBox.innerHTML = '<div class="reg-list">' + data.upcoming.map(regItemHtml).join('') + '</div>';
    }

    var pastBox = document.getElementById('pastBox');
    if (data.past.length === 0) {
      pastBox.innerHTML = emptyHtml('bi-clock-history', 'No past events yet',
        'Events you attend will appear here with your results and certificates.', '', '', 'empty-inline');
    } else {
      pastBox.innerHTML = '<div class="reg-list">' + data.past.map(regItemHtml).join('') + '</div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });

  // Cancel buttons are created by regItemHtml(), so we listen on the whole page
  // and check which button was clicked (this is called "event delegation").
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-cancel]');
    if (!button) return;

    var title = button.getAttribute('data-title');
    if (!confirm('Cancel your registration for "' + title + '"?')) return;

    api('/api/student/cancel/' + button.getAttribute('data-cancel'), 'POST').then(function (result) {
      flashNext('success', result.message);
      window.location.reload();
    }).catch(function (err) {
      showToast('error', err.message);
    });
  });
}
