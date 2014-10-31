/* Global define */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.Tour = factory(root.jQuery);
  }
}(this, function ($) {

  // var mock = faux.get('conversations/1/show').success(200, {});
  // var mock = faux.get(/conversations\/[0-9]+\/show/).success(200, {});
  // var mock = faux.get(function () { // builds a URL using some computation }).success(200, {});
  // mock.success(200, function () { // builds a response using some computation });
  // mock.error(200, function () { // builds a response using some computation });
  // mock.delay(2000);
  // mock.restore();

  var mocks = [], oajax = $.ajax;

  var wrap = function (xhr, response, callback) {
    // TODO: Add the headers to original XHR object (such as status, e.g. 200)
    return function () {
      if (callback) {
        if (typeof response === 'function') {
          callback(response(xhr), xhr);
        } else {
          callback(response, xhr);
        }
      }
    };
  };

  var hasProp = {}.hasOwnProperty;

  $.ajax = function () {
    var callback, i, len, mock, mocked, response, xhr;

    xhr = arguments[0];

    for (i = 0, len = mocks.length; i < len; i++) {
      mock = mocks[i];
      mocked = mock.match(xhr);
      if (mocked) break;
    }

    if (mocked) {
      response = mock.scope.error ? mock.scope.error : mock.scope.success;
      callback = mock.scope.error ? xhr.error : xhr.success;
      setTimeout(wrap(xhr, response, callback), mock.scope.delay);
    } else {
      oajax.apply(this, arguments);
    }
  };

  function Mock() {
    this.scope = {
      delay: 0
    };
  }

  Mock.prototype = {

    delay: function(delay) {
      this.scope.delay = parseInt(delay, 10) || 0;
      return this;
    },

    error: function(error) {
      this.scope.error = error;
      return this;
    },

    get: function(url) {
      this.scope.type = 'get';
      this.scope.url = url;
      return this;
    },

    post: function(url, data) {
      this.scope.type = 'post';
      this.scope.url = url;
      this.scope.data = data;
      return this;
    },

    match: function(xhr) {
      var url, urlMatch, dataMatch;

      if (this.scope.restored) {
        return false;
      }

      url = this.scope.url;

      if (this.scope.type !== xhr.type.toLowerCase()) {
        return false;
      }

      if (typeof url === 'function') {
        urlMatch = url(xhr.url);
      } else if (url.constructor.name === 'RegExp') {
        urlMatch = url.test(xhr.url);
      } else {
        urlMatch = xhr.url.indexOf(url) >= 0;
      }

      dataMatch = true;

      if (this.scope.data) {
        // TODO: Need to add deep match checking (since some of the data may be objects)
        // TODO: Optionally the matching properties could be regular expressions or functions
        for (var prop in this.scope.data) {
          if (!(xhr.data.hasOwnProperty(prop) && xhr.data[prop] === this.scope[prop])) {
            dataMatch = false;
            break;
          }
        }
      }

      return urlMatch && dataMatch;
    },

    restore: function() {
      this.scope.restored = true;
    },

    success: function(status, success) {
      this.scope.status = status || 200;
      this.scope.success = success;
      return this;
    }

  };

  return {

    get: function(url) {
      var mock = new Mock().get(url);
      mocks.push(mock);
      return mock;
    },

    post: function(url, data) {
      var mock = new Mock().post(url, data);
      mocks.push(mock);
      return mock;
    }

  };

}));
