// public/js/pages/student-certificates.js  -  list of my certificates
// ---------------------------------------------------------------

// Build one certificate card.
function certCardHtml(c) {
  var isWinner = c.type === 'winner';
  return '' +
    '<article class="cert-card cert-card-' + c.type + '">' +
      '<div class="cert-card-art">' +
        '<span class="cert-card-emoji">' + (isWinner ? positionMedal(c.position) : '🎓') + '</span>' +
        '<span>' + (isWinner ? positionLabel(c.position) : 'Participation') + '</span>' +
      '</div>' +
      '<div class="cert-card-body">' +
        '<h3>' + esc(c.event.title) + '</h3>' +
        '<p><i class="bi bi-calendar-event"></i> ' + formatDate(c.event.date) + '</p>' +
        '<a class="btn ' + (isWinner ? 'btn-accent' : 'btn-primary') + ' btn-block" href="/student/certificate/' + c.reg.id + '/' + c.type + '">' +
          '<i class="bi bi-download"></i> Open and download</a>' +
      '</div>' +
    '</article>';
}

// Set up this page and load the information it needs.
function startPage() {
  api('/api/student/certificates').then(function (data) {
    var box = document.getElementById('certBox');
    if (data.earned.length === 0) {
      box.innerHTML = emptyHtml('bi-award', 'No certificates yet',
        'Your certificates appear here once an organiser marks you present or announces you as a winner.', '/events', 'Find an event');
    } else {
      box.innerHTML = '<div class="cert-grid">' + data.earned.map(certCardHtml).join('') + '</div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });
}
