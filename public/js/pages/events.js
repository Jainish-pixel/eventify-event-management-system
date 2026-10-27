// public/js/pages/events.js  -  list of events with filters
// ---------------------------------------------------------------
// The filters live in the web address:
//     /events?category=Technical&show=upcoming&q=robot
// The page reads them, asks the server for matching events
// (GET /api/events?...) and draws the cards.
// ---------------------------------------------------------------

var category = getQuery('category') || 'all';
var show = getQuery('show') || 'upcoming';     // upcoming | past | all
var q = (getQuery('q') || '').trim();

// builds a link that changes one filter and keeps the others
function filterLink(cat, sh) {
  var url = '/events?category=' + encodeURIComponent(cat) + '&show=' + sh;
  if (q) {
    url += '&q=' + encodeURIComponent(q);
  }
  return url;
}

// Display the available event filters.
function drawFilters(counts) {
  // upcoming / past / all tabs
  var tabs = [['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']];
  document.getElementById('showTabs').innerHTML = tabs.map(function (t) {
    return '<a href="' + filterLink(category, t[0]) + '" class="tab ' + (show === t[0] ? 'active' : '') + '">' + t[1] + '</a>';
  }).join('');

  // category pills
  var pills = '<a href="' + filterLink('all', show) + '" class="pill ' + (category === 'all' ? 'active' : '') + '">All categories</a>';
  categories.forEach(function (c) {
    pills += '<a href="' + filterLink(c.name, show) + '" class="pill ' + (category === c.name ? 'active' : '') + '">' +
      '<i class="bi ' + c.icon + '"></i> ' + c.name + ' <small>' + (counts[c.name] || 0) + '</small></a>';
  });
  document.getElementById('categoryPills').innerHTML = pills;
}

// Set up this page and load the information it needs.
function startPage() {
  // put the current filters back into the search form
  document.getElementById('searchInput').value = q;
  document.getElementById('categoryInput').value = category;
  document.getElementById('showInput').value = show;

  var url = '/api/events?category=' + encodeURIComponent(category) + '&show=' + show + '&q=' + encodeURIComponent(q);

  api(url).then(function (data) {
    drawFilters(data.counts);

    var count = data.events.length;
    document.getElementById('resultCount').textContent = count + (count === 1 ? ' event' : ' events') + ' found';

    var box = document.getElementById('eventsBox');
    if (count === 0) {
      box.innerHTML = emptyHtml('bi-search', 'No events match these filters',
        'Try another category, clear the search or look at all events.', '/events?show=all', 'Show all events');
    } else {
      box.innerHTML = '<div class="event-grid">' + data.events.map(eventCardHtml).join('') + '</div>';
    }
  }).catch(function (err) {
    showToast('error', err.message);
  });
}
