# Eventify JavaScript — Beginner Guide

This copy keeps the existing routes, database format, and page behaviour. The JavaScript has been annotated with plain-English comments so you can follow it function by function.

## How the project works

1. **The browser files** are inside `public/js/`. They read form values, call the server, and update the page.
2. **`public/js/api.js`** contains the `api()` helper. Instead of writing `fetch()` every time, pages call `api('/api/events')` or `api('/api/login', 'POST', body)`.
3. **The server files** (`server.js`, `routes/`, `middleware.js`, `db.js`, and the root `helpers.js`) receive requests, check permissions, read or update data, and send JSON back.
4. **The HTML files** load the JavaScript for the page they display.

## JavaScript patterns used here

### 1. A variable

```js
var name = document.getElementById('name').value;
```

This reads the current value from the input whose ID is `name`.

### 2. An `if` statement

```js
if (!name) {
  // This runs when name is empty.
  showMessage('error', 'Enter your name.');
}
```

`!name` means the value is empty or otherwise falsy.

### 3. A function

```js
function double(number) {
  return number * 2;
}
```

A function groups steps under a name so they can be reused. `return` sends a result back to the code that called it.

### 4. `forEach`

```js
students.forEach(function (student) {
  console.log(student.name);
});
```

This runs the code once for every student in the array.

### 5. `find` and `filter`

```js
var student = students.find(function (item) {
  return item.id === 2;
});
```

`find()` returns the first matching item. `filter()` returns a new array containing every matching item.

### 6. `map` and `join`

```js
var names = students.map(function (student) {
  return student.name;
});
```

`map()` creates a new array from the original items. In this project, `map()` is often used to create HTML strings; `.join('')` joins those strings together without commas.

### 7. Sending data to the server

```js
var body = { email: email, password: password };
api('/api/login', 'POST', body)
  .then(function (result) {
    // Runs when the server request succeeds.
  })
  .catch(function (error) {
    // Runs if the request fails.
  });
```

`POST` sends data to the server. `.then()` handles success and `.catch()` handles errors. The API helper converts server errors into JavaScript errors so pages can show a message.

### 8. Why some HTML is built with `+`

The page scripts build HTML by joining text and values. For example:

```js
var message = '<p>Hello, ' + esc(name) + '</p>';
```

The `+` joins strings together. `esc()` is important when showing user-provided text because it helps prevent the text from being treated as HTML or script code.

## Suggested order for learning the code

1. `public/js/pages/login.js` — form values, events, API calls, and errors.
2. `public/js/pages/register.js` — similar flow for account creation.
3. `public/js/api.js` — how browser pages communicate with the server.
4. `public/js/pages/events.js` and `public/js/pages/event.js` — loading and displaying events.
5. `routes/auth.js` and `routes/events.js` — how the server responds.
6. `routes/student.js` and `routes/organiser.js` — registration, attendance, and results.
7. `public/js/pages/organiser-manage.js` — the largest page script; study one section at a time.

## Important note

The original code already uses mostly basic JavaScript functions and callbacks. To avoid breaking Eventify, this learning copy focuses on clear comments and preserving existing logic and API behaviour rather than making risky large rewrites. No routes or database fields were intentionally changed.
