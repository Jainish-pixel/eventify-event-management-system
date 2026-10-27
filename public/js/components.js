// public/js/components.js  -  pieces of HTML used on more than one page
// ---------------------------------------------------------------
// Each function takes data and returns an HTML string.
// We always wrap user text with esc() so that it is safe.
// ---------------------------------------------------------------

// One event card (home page and events page)
function eventCardHtml(event) {
  var cat = getCategory(event.category);
  var dp = dateParts(event.date);
  var percent = Math.min(100, Math.round((event.registered / event.capacity) * 100));

  var seatsText;
  if (event.status === 'completed') {
    seatsText = event.registered + ' registered';
  } else if (event.seatsLeft <= 0) {
    seatsText = 'Full';
  } else if (event.seatsLeft <= 5) {
    seatsText = 'Only ' + event.seatsLeft + ' seats left';
  } else {
    seatsText = event.seatsLeft + ' of ' + event.capacity + ' seats left';
  }

  return '' +
    '<article class="event-card">' +
      '<a href="/events/' + event.id + '" class="event-cover cat-' + cat.slug + '" aria-label="' + esc(event.title) + '">' +
        '<span class="cover-emoji">' + cat.emoji + '</span>' +
        '<span class="chip"><i class="bi ' + cat.icon + '"></i> ' + esc(event.category) + '</span>' +
        '<span class="status status-' + event.status + '">' + statusText(event.status) + '</span>' +
        '<span class="date-chip"><b>' + dp.day + '</b>' + dp.month + '</span>' +
      '</a>' +
      '<div class="event-body">' +
        '<h3 class="event-title"><a href="/events/' + event.id + '">' + esc(event.title) + '</a></h3>' +
        '<ul class="event-meta">' +
          '<li><i class="bi bi-clock"></i> ' + formatTime(event.startTime) + ' to ' + formatTime(event.endTime) + '</li>' +
          '<li><i class="bi bi-geo-alt"></i> ' + esc(event.venue) + '</li>' +
        '</ul>' +
        '<div class="seats">' +
          '<div class="progress"><span style="width: ' + percent + '%"></span></div>' +
          '<small>' + seatsText + '</small>' +
        '</div>' +
        '<div class="event-foot">' +
          '<span class="price ' + (event.price > 0 ? '' : 'price-free') + '">' + formatPrice(event.price) + '</span>' +
          '<a href="/events/' + event.id + '" class="btn btn-outline btn-sm">View details</a>' +
        '</div>' +
      '</div>' +
    '</article>';
}

// One row of "my registrations" (student dashboard)
// item = { reg, event, position }
function regItemHtml(item) {
  var ev = item.event;
  var dp = dateParts(ev.date);
  var cat = getCategory(ev.category);

  var badges = '<span class="status status-' + ev.status + ' status-flat">' + statusText(ev.status) + '</span>';
  if (item.reg.attended) {
    badges += '<span class="badge badge-success"><i class="bi bi-check2-circle"></i> Present</span>';
  } else if (ev.status === 'completed') {
    badges += '<span class="badge badge-danger"><i class="bi bi-x-circle"></i> Absent</span>';
  }
  if (item.position > 0) {
    badges += '<span class="badge badge-gold">' + positionMedal(item.position) + ' ' + positionLabel(item.position) + '</span>';
  }

  var actions = '<a class="btn btn-outline btn-sm" href="/student/ticket/' + item.reg.id + '"><i class="bi bi-ticket-perforated"></i> Ticket</a>';
  if (item.reg.attended || item.position > 0) {
    actions += '<a class="btn btn-primary btn-sm" href="/student/certificates"><i class="bi bi-award"></i> Certificates</a>';
  }
  if (ev.status === 'upcoming') {
    // the page script listens for clicks on  data-cancel
    actions += '<button class="btn btn-danger-outline btn-sm" type="button" data-cancel="' + item.reg.id + '" data-title="' + esc(ev.title) + '">Cancel</button>';
  }

  return '' +
    '<article class="reg-item">' +
      '<div class="date-block cat-' + cat.slug + '"><b>' + dp.day + '</b><span>' + dp.month + '</span></div>' +
      '<div class="reg-info">' +
        '<h3><a href="/events/' + ev.id + '">' + esc(ev.title) + '</a></h3>' +
        '<p class="reg-meta">' +
          '<span><i class="bi bi-clock"></i> ' + formatTime(ev.startTime) + '</span>' +
          '<span><i class="bi bi-geo-alt"></i> ' + esc(ev.venue) + '</span>' +
          '<span><i class="bi bi-upc-scan"></i> ' + esc(item.reg.ticketCode) + '</span>' +
        '</p>' +
        '<div class="chip-row">' + badges + '</div>' +
      '</div>' +
      '<div class="reg-actions">' + actions + '</div>' +
    '</article>';
}

// An "empty" message box with an icon
function emptyHtml(icon, title, text, buttonHref, buttonText, extraClass) {
  var button = buttonHref ? '<a href="' + buttonHref + '" class="btn btn-primary">' + buttonText + '</a>' : '';
  return '<div class="empty ' + (extraClass || '') + '">' +
    '<i class="bi ' + icon + '"></i>' +
    '<h3>' + title + '</h3>' +
    '<p>' + text + '</p>' + button +
    '</div>';
}
