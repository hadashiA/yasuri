import $ from 'jquery';

const ENDPOINT = 'https://suzuri.jp/api/v1/';

var getToken = function() {
  var localStorage = window.localStorage,
      token        = (localStorage && localStorage.getItem('token')),
      cookie       = document.cookie,
      match;

  if (!token && cookie) {
    match = cookie.match(/token=([\da-z]+)/i);
    if (match) {
      token = match[1];
      localStorage.setItem('key', token);
    }
  }
  return token;
};

var request = function(method, path, data) {
  var token = getToken();
  
  return new Promise(function(resolve, reject) {
    var options = {
      type: method,
      dataType: 'json',
      url: ENDPOINT + path,
      headers: { 'Authorization': 'Bearer ' + token }
    };

    if (token === null) {
      reject();
    }

    if (method == 'GET') {
      options.data = data;
    } else {
      options.data = JSON.stringify(data);
      options.contentType = 'application/json';
    }
    $.ajax(options)
      .done(function(res) {
        resolve(res);
      })
      .fail(function(res) {
        reject(res.status);
      });
  });
};

export default {
  request: request
};
