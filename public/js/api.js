function api(url, method, body) {
  var options = {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options)
    .then(function (response) {
      // turn the answer into a JavaScript object
      return response.json().then(function (data) {
        return { status: response.status, data: data };
      });
    })
    .then(function (result) {
      if (result.status === 401 && url.indexOf('/api/login') === -1) {
        window.location.href = '/login?need=1';
        throw new Error('Please log in first.');
      }
      if (result.status >= 400) {
        var error = new Error(result.data.error || 'Something went wrong.');
        error.errors = result.data.errors || null;   // list of form errors (event form)
        error.status = result.status;
        throw error;
      }
      return result.data;
    });
}

// Save a message to show on the NEXT page (used before we change the page).
function flashNext(type, text) {
  try {
    sessionStorage.setItem('flash', JSON.stringify({ type: type, text: text }));
  } catch (e) {}
}
