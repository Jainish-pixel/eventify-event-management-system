// public/js/pages/certificate.js  -  the printable certificate
// ---------------------------------------------------------------
// This page opens from two different addresses:
//   1. student:    /student/certificate/12/winner
//   2. organiser:  /organiser/events/3/certificate-preview?type=winner
// We look at the address to know which API to call.
// ---------------------------------------------------------------

var path = window.location.pathname;
var isPreview = path.indexOf('/organiser/') === 0;

var apiUrl;
if (isPreview) {
  var previewEventId = pathNumbers()[0];
  var previewType = getQuery('type') === 'participation' ? 'participation' : 'winner';
  apiUrl = '/api/organiser/events/' + previewEventId + '/certificate-preview?type=' + previewType;
} else {
  var parts = path.split('/');                       // ["", "student", "certificate", "12", "winner"]
  apiUrl = '/api/student/certificate/' + parts[3] + '/' + parts[4];
}

function certificateHtml(data) {
  var event = data.event;
  var isWinner = data.type === 'winner';
  var position = data.position;
  var heading = isWinner ? event.certTitle : 'Certificate of Participation';

  var rank = isWinner
    ? '<div class="cert-rank rank-' + position + '">' + positionMedal(position) + ' ' + positionLabel(position) + '</div>'
    : '';

  var reason = isWinner
    ? 'for securing <strong>' + positionLabel(position) + '</strong> in '
    : 'for actively participating in ';

  var message = isWinner ? event.certMessage : 'Thank you for your enthusiasm and for being part of the event.';

  return '' +
    '<div class="certificate cert-' + data.type + '" id="certificate">' +
      '<div class="cert-frame">' +
        '<div class="cert-inner">' +
          '<span class="cert-corner c-tl"></span><span class="cert-corner c-tr"></span>' +
          '<span class="cert-corner c-bl"></span><span class="cert-corner c-br"></span>' +
          '<div class="cert-watermark">' + (isWinner ? '★' : '✦') + '</div>' +

          '<div class="cert-top">' +
            '<div class="cert-issuer">Eventify &nbsp;|&nbsp; ' + esc(event.organiserName) + '</div>' +
            '<h1 class="cert-title">' + esc(heading) + '</h1>' +
            rank +
          '</div>' +

          '<p class="cert-small">This certificate is proudly presented to</p>' +
          '<h2 class="cert-name">' + esc(data.studentName) + '</h2>' +

          '<p class="cert-text">' + reason +
            '<strong>' + esc(event.title) + '</strong>, a ' + esc(event.category.toLowerCase()) + ' event held on ' +
            '<strong>' + formatDate(event.date) + '</strong> at <strong>' + esc(event.venue) + '</strong>.' +
          '</p>' +

          '<p class="cert-message">' + esc(message) + '</p>' +

          '<div class="cert-bottom">' +
            '<div class="cert-meta"><span>Certificate ID</span><strong>' + esc(data.certId) + '</strong></div>' +
            '<div class="cert-seal"><span>' + (isWinner ? position : '✓') + '</span></div>' +
            '<div class="cert-sign">' +
              '<div class="cert-sign-name">' + esc(event.signerName) + '</div>' +
              '<div class="cert-sign-line"></div>' +
              '<div class="cert-sign-role">' + esc(event.signerRole) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// the certificate is designed at A4 size (1123 x 794 px);
// on small screens we shrink it so that it fits the screen
function fitCertificate() {
  var stage = document.getElementById('stage');
  var cert = document.getElementById('certificate');
  if (!cert) return;
  var scale = Math.min(1, (window.innerWidth - 32) / 1123);
  cert.style.transform = 'scale(' + scale + ')';
  stage.style.height = (794 * scale) + 'px';
  stage.style.width = (1123 * scale) + 'px';
}

// ----- start -----
document.getElementById('printBtn').addEventListener('click', function () {
  window.print();
});

api(apiUrl).then(function (data) {
  document.title = (data.type === 'winner' ? data.event.certTitle : 'Certificate of Participation') + ' | ' + data.studentName;
  document.getElementById('stage').innerHTML = certificateHtml(data);
  fitCertificate();
  window.addEventListener('resize', fitCertificate);

  var back = document.getElementById('backLink');
  var tip = document.getElementById('tip');
  if (isPreview) {
    back.href = '/organiser/events/' + data.event.id + '/manage';
    tip.innerHTML = 'Sample preview with a placeholder name. ' +
      '<a href="/organiser/events/' + data.event.id + '/certificate-preview?type=winner">Winner</a> | ' +
      '<a href="/organiser/events/' + data.event.id + '/certificate-preview?type=participation">Participation</a>';
  } else {
    back.href = '/student/certificates';
    tip.textContent = 'Click Download PDF, then choose "Save as PDF" as the destination.';
  }
}).catch(function (err) {
  // for example: "Your attendance has not been marked yet"
  flashNext('error', err.message);
  window.location.href = isPreview ? '/organiser/dashboard' : '/student/certificates';
});
