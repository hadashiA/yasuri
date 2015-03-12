var $ = require('jquery');

var endpoint = 'https://suzuri.jp/api/v1/';

var getToken = function() {
  var cookie = document.cookie,
      match;
  if (cookie) {
    match = cookie.match(/token=([\da-z]+)/i);
    if (match) {
      return match[1];
    }
  }
  return null;
};

var request = function(method, path, data) {
  var token = getToken();
  
  return new Promise(function(resolve, reject) {
    if (token === null) {
      reject();
    }

    $.ajax({
      type: method,
      dataType: 'json',
      url: endpoint + path,
      data: data,
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .done(function(res) {
        resolve(res.responseJSON);
      })
      .fail(function(res) {
        reject(res.status);
      });
  });
};

exports.currentUser = function() {
  return request('GET', 'user');
};
