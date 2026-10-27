// public/js/pages/student-ticket.js  -  one ticket
// ---------------------------------------------------------------
var regId = pathNumbers()[0];     // /student/ticket/12  ->  12

// Build the student’s event ticket.
function ticketHtml(data) {
  var event = data.event;
  var reg = data.reg;
  var cat = getCategory(event.category);
  var dp = dateParts(event.date);

  var state = reg.attended
    ? '<span class="stub-state stub-present"><i class="bi bi-check2-circle"></i> Checked in</span>'
    : '<span class="stub-state">' + statusText(event.status) + '</span>';

  var priceHint = event.price > 0
    ? 'Pay <strong>' + formatPrice(event.price) + '</strong> at the entry desk and show this ticket.'
    : 'This event is free. Show this ticket at the entry desk.';

  var cancelButton = event.status === 'upcoming'
    ? '<button type="button" class="btn btn-danger-outline" id="cancelBtn">Cancel registration</button>'
    : '';

  return '' +
    '<div class="ticket-wrap">' +
      '<div class="ticket cat-' + cat.slug + '">' +
        '<div class="ticket-main">' +
          '<div class="ticket-top">' +
            '<span class="ticket-brand"><i class="bi bi-ticket-perforated-fill"></i> Eventify admit one</span>' +
            '<span class="chip"><i class="bi ' + cat.icon + '"></i> ' + esc(event.category) + '</span>' +
          '</div>' +
          '<h1>' + esc(event.title) + '</h1>' +
          '<dl class="ticket-grid">' +
            '<div><dt>Attendee</dt><dd>' + esc(data.student.name) + '</dd></div>' +
            '<div><dt>Date</dt><dd>' + formatDate(event.date) + '</dd></div>' +
            '<div><dt>Time</dt><dd>' + formatTime(event.startTime) + ' to ' + formatTime(event.endTime) + '</dd></div>' +
            '<div><dt>Venue</dt><dd>' + esc(event.venue) + '</dd></div>' +
            '<div><dt>Ticket price</dt><dd>' + formatPrice(event.price) + '</dd></div>' +
            '<div><dt>Registered on</dt><dd>' + formatDateTime(reg.registeredAt) + '</dd></div>' +
          '</dl>' +
        '</div>' +
        '<div class="ticket-stub">' +
          '<span class="stub-date"><b>' + dp.day + '</b>' + dp.month + '</span>' +
          '<div class="barcode barcode-dark"></div>' +
          '<span class="stub-code">' + esc(reg.ticketCode) + '</span>' +
          state +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p class="hint center">' + priceHint + '</p>' +
    '<div class="action-row no-print">' +
      '<button type="button" class="btn btn-primary" id="printBtn"><i class="bi bi-printer"></i> Print or save ticket</button>' +
      '<a href="/events/' + event.id + '" class="btn btn-outline">Event page</a>' +
      cancelButton +
    '</div>';
}

// Set up this page and load the information it needs.
function startPage() {
  api('/api/student/ticket/' + regId).then(function (data) {
    document.getElementById('ticketBox').innerHTML = ticketHtml(data);

    document.getElementById('printBtn').addEventListener('click', function () {
      window.print();
    });

    var cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        if (!confirm('Cancel your registration for this event?')) return;
        api('/api/student/cancel/' + regId, 'POST').then(function (result) {
          flashNext('success', result.message);
          window.location.href = '/student/dashboard';
        }).catch(function (err) {
          showToast('error', err.message);
        });
      });
    }
  }).catch(function () {
    document.getElementById('ticketBox').innerHTML =
      emptyHtml('bi-ticket-detailed', 'Ticket not found',
        'This ticket does not exist or the registration was cancelled.', '/student/dashboard', 'Go to my events');
  });
}
