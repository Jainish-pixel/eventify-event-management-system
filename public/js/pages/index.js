// public/js/pages/index.js  -  home page
// ---------------------------------------------------------------
// layout.js calls startPage() after the header is ready.
// ---------------------------------------------------------------

// make a number count up from 0 (small animation)
function countUp(elementId, target) {
  var element = document.getElementById(elementId);
  if (!target || target < 1) {
    element.textContent = target || 0;
    return;
  }
  var current = 0;
  var step = Math.max(1, Math.ceil(target / 40));
  var timer = setInterval(function () {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = current;
  }, 25);
}

// the big ticket in the hero section
function heroTicketHtml(featured) {
  if (!featured) {
    return '' +
      '<div class="hero-ticket cat-technical">' +
        '<div class="ht-main">' +
          '<span class="ht-label">Your event could be here</span>' +
          '<h3>Create the first event</h3>' +
          '<p>Organisers can publish an event in two minutes.</p>' +
        '</div>' +
        '<div class="ht-stub"><b>00</b><span>SOON</span><div class="barcode"></div></div>' +
      '</div>';
  }

  var cat = getCategory(featured.category);
  var dp = dateParts(featured.date);
  return '' +
    '<a href="/events/' + featured.id + '" class="hero-ticket cat-' + cat.slug + '">' +
      '<div class="ht-main">' +
        '<span class="ht-label">Next on campus</span>' +
        '<h3>' + esc(featured.title) + '</h3>' +
        '<p><i class="bi bi-clock"></i> ' + formatTime(featured.startTime) + ' to ' + formatTime(featured.endTime) + '</p>' +
        '<p><i class="bi bi-geo-alt"></i> ' + esc(featured.venue) + '</p>' +
        '<span class="ht-price">' + formatPrice(featured.price) + '</span>' +
        '<span class="ht-emoji">' + cat.emoji + '</span>' +
      '</div>' +
      '<div class="ht-stub">' +
        '<b>' + dp.day + '</b><span>' + dp.month + '</span><div class="barcode"></div>' +
      '</div>' +
    '</a>';
}

// Set up this page and load the information it needs.
function startPage() {
  api('/api/home').then(function (data) {
    // 1. hero ticket
    document.getElementById('heroTicket').innerHTML = heroTicketHtml(data.featured);

    // 2. numbers
    countUp('statEvents', data.stats.events);
    countUp('statStudents', data.stats.students);
    countUp('statRegistrations', data.stats.registrations);
    countUp('statCertificates', data.stats.certificates);

    // 3. upcoming events
    var box = document.getElementById('upcomingBox');
    if (data.upcoming.length === 0) {
      box.innerHTML = emptyHtml('bi-calendar2-x', 'No upcoming events yet',
        'Organisers can create the first one from their dashboard.');
    } else {
      box.innerHTML = '<div class="event-grid">' + data.upcoming.map(eventCardHtml).join('') + '</div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });
}
