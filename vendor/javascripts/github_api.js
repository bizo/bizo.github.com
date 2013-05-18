var Github;

Github = (function($) {
  var API, exports;
  exports = {};
  API = (function() {

    function API() {}

    API.base_url = "https://api.github.com";

    API.get = function(path, callback) {
      return $.getJSON("" + this.base_url + path + "?callback=?", function(response) {
        return callback(response);
      });
    };

    API.get_members = function(org, callback) {
      return this.get("/orgs/" + org + "/public_members", function(response) {
        return callback(response.data);
      });
    };

    API.get_user = function(user, callback) {
      return this.get("/users/" + user, function(response) {
        return callback(response.data);
      });
    };

    API.get_repos = function(user, callback) {
      return this.get("/users/" + user + "/repos", function(response) {
        return callback(response.data);
      });
    };

    API.get_watched = function(user, callback) {
      return this.get("/users/" + user + "/watched", function(response) {
        return callback(response.data);
      });
    };

    return API;

  })();
  exports.API = API;
  return exports;
})(jQuery);
