// public/js/pages/event.js  -  one event (details + register button)
// ---------------------------------------------------------------
var eventId = pathNumbers()[0];     // /events/7  ->  7

// ----- the winners podium (only when results are announced) -----
function podiumHtml(winners, note) {
  if (winners.length === 0) return '';

  var byPosition = {};
  winners.forEach(function (w) { byPosition[w.position] = w; });

  // podium order: 2nd, 1st, 3rd
  var steps = '';
  [2, 1, 3].forEach(function (pos) {
    var w = byPosition[pos];
    if (w) {
      steps += '' +
        '<div class="podium-step podium-' + pos + '">' +
          '<div class="podium-name">' +
            '<span class="podium-medal">' + positionMedal(pos) + '</span>' +
            '<strong>' + esc(w.name) + '</strong>' +
            '<small>' + esc(w.college || '') + '</small>' +
          '</div>' +
          '<div class="podium-block">' + pos + '</div>' +
        '</div>';
    }
  });

  return '' +
    '<div class="panel panel-results" id="results">' +
      '<h2>Results are out</h2>' +
      '<div class="podium">' + steps + '</div>' +
      (note ? '<p class="result-note">' + esc(note) + '</p>' : '') +
    '</div>';
}

// ----- the box on the right side: what can THIS visitor do? -----
function bookingBoxHtml(event, myReg, isOwner, user) {
  var percent = Math.min(100, Math.round((event.registered / event.capacity) * 100));
  var closedText = event.status === 'ongoing' ? 'is happening right now.' : 'has ended.';
  var seatsText = event.seatsLeft <= 0
    ? 'All ' + event.capacity + ' seats are taken'
    : event.registered + ' registered, ' + event.seatsLeft + ' seats left';

  var action;   // the buttons part
  if (!user && event.status !== 'upcoming') {
    action = '<button class="btn btn-block btn-lg" disabled>Registration closed</button>' +
             '<p class="hint center">This event ' + closedText + '</p>';

  } else if (!user) {
    action = '<a class="btn btn-primary btn-block btn-lg" href="/login?role=student">Log in to register</a>' +
             '<p class="hint center">New here? <a href="/register?role=student">Create a student account</a></p>';

  } else if (user.role === 'organiser') {
    if (isOwner) {
      action = '<a class="btn btn-primary btn-block btn-lg" href="/organiser/events/' + event.id + '/manage">Manage this event</a>' +
               '<a class="btn btn-outline btn-block" href="/organiser/events/' + event.id + '/edit">Edit details</a>';
    } else {
      action = '<p class="hint center">You are logged in as an organiser. Only student accounts can register for events.</p>';
    }

  } else if (myReg) {
    action = '' +
      '<div class="registered-box">' +
        '<i class="bi bi-patch-check-fill"></i>' +
        '<div><strong>You are registered</strong><span>Ticket code ' + esc(myReg.ticketCode) + '</span></div>' +
      '</div>' +
      '<a class="btn btn-primary btn-block btn-lg" href="/student/ticket/' + myReg.id + '">View my ticket</a>';
    if (event.status === 'upcoming') {
      action += '<button class="btn btn-danger-outline btn-block" type="button" id="cancelBtn">Cancel registration</button>';
    }

  } else if (event.status !== 'upcoming') {
    action = '<button class="btn btn-block btn-lg" disabled>Registration closed</button>' +
             '<p class="hint center">This event ' + closedText + '</p>';

  } else if (event.seatsLeft <= 0) {
    action = '<button class="btn btn-block btn-lg" disabled>Event is full</button>';

  } else {
    action = '<button class="btn btn-accent btn-block btn-lg" type="button" id="registerBtn">Register for this event</button>';
  }

  var calendar = '';
  if (event.status === 'upcoming') {
    calendar = '<a class="calendar-link" href="' + calendarLink(event) + '" target="_blank" rel="noopener">' +
               '<i class="bi bi-calendar-plus"></i> Add to Google Calendar</a>';
  }

  return '' +
    '<div class="booking-card">' +
      '<div class="booking-price">' +
        '<strong>' + formatPrice(event.price) + '</strong>' +
        (event.price > 0 ? '<span>per student, paid at the entry desk</span>' : '<span>no ticket fee</span>') +
      '</div>' +
      '<div class="seats seats-big">' +
        '<div class="progress"><span style="width: ' + percent + '%"></span></div>' +
        '<small>' + seatsText + '</small>' +
      '</div>' +
      action + calendar +
    '</div>';
}

// Display the event details and connect its buttons.
function drawEvent(data, user) {
  var event = data.event;
  var cat = getCategory(event.category);
  document.title = event.title + ' | Eventify';

  document.getElementById('eventPage').innerHTML = '' +
    '<section class="detail-hero cat-' + cat.slug + '">' +
      '<div class="container">' +
        '<a href="/events" class="back-link"><i class="bi bi-arrow-left"></i> All events</a>' +
        '<div class="detail-hero-row">' +
          '<div>' +
            '<div class="chip-row">' +
              '<span class="chip"><i class="bi ' + cat.icon + '"></i> ' + esc(event.category) + '</span>' +
              '<span class="status status-' + event.status + '">' + statusText(event.status) + '</span>' +
            '</div>' +
            '<h1>' + esc(event.title) + '</h1>' +
            '<p class="hosted">Hosted by ' + esc(event.organiserName) + '</p>' +
          '</div>' +
          '<div class="detail-emoji" aria-hidden="true">' + cat.emoji + '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="section section-tight">' +
      '<div class="container detail-layout">' +
        '<div class="detail-main">' +
          podiumHtml(data.winners, event.results ? event.results.note : '') +
          '<div class="panel"><h2>About this event</h2><p class="prose">' + esc(event.description) + '</p></div>' +
          '<div class="panel">' +
            '<h2>Event details</h2>' +
            '<ul class="info-list">' +
              '<li><i class="bi bi-calendar-event"></i><div><span>Date</span><strong>' + formatDate(event.date) + '</strong></div></li>' +
              '<li><i class="bi bi-clock"></i><div><span>Time</span><strong>' + formatTime(event.startTime) + ' to ' + formatTime(event.endTime) + '</strong></div></li>' +
              '<li><i class="bi bi-geo-alt"></i><div><span>Venue</span><strong>' + esc(event.venue) + '</strong></div></li>' +
              '<li><i class="bi bi-ticket-perforated"></i><div><span>Ticket price</span><strong>' + formatPrice(event.price) + '</strong></div></li>' +
              '<li><i class="bi bi-people"></i><div><span>Capacity</span><strong>' + event.capacity + ' seats</strong></div></li>' +
              '<li><i class="bi bi-award"></i><div><span>Certificates</span><strong>Participation for attendees, winner certificates for the top places</strong></div></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<aside class="detail-side">' + bookingBoxHtml(event, data.myReg, data.isOwner, user) + '</aside>' +
      '</div>' +
    '</section>';

  // ----- buttons (they exist only now, so we connect them here) -----
  var registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', function () {
      registerBtn.disabled = true;
      api('/api/student/register/' + event.id, 'POST').then(function (result) {
        flashNext('success', result.message);
        window.location.href = '/student/ticket/' + result.regId;
      }).catch(function (err) {
        registerBtn.disabled = false;
        showToast('error', err.message);
      });
    });
  }

  var cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      if (!confirm('Cancel your registration for this event?')) return;
      api('/api/student/cancel/' + data.myReg.id, 'POST').then(function (result) {
        flashNext('success', result.message);
        window.location.reload();
      }).catch(function (err) {
        showToast('error', err.message);
      });
    });
  }
}

// Set up this page and load the information it needs.
function startPage(user) {
  api('/api/events/' + eventId).then(function (data) {
    drawEvent(data, user);
  }).catch(function (err) {
    document.getElementById('eventPage').innerHTML =
      emptyHtml('bi-ticket-detailed', 'This event does not exist',
        'It may have been deleted by the organiser.', '/events', 'Browse events', 'empty-big');
  });
}
