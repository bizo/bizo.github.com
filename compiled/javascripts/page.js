(function() {
  var Github, Templates, bucket_by_lang, init, project_html, write_projects_to_dom, write_team_to_dom;
  Github = (function() {
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
      API.get_repos = function(user, callback) {
        return this.get("/users/" + user + "/repos", function(response) {
          return callback(response.data);
        });
      };
      return API;
    })();
    exports.API = API;
    return exports;
  })();
  Templates = (function() {
    var Project, Section, User, exports;
    Project = (function() {
      function Project() {}
      Project.render = function(repository) {
        var html;
        html = "<div class=\"project\">\n  <h3>\n    " + repository.name + "\n    <small>\n      <a href=\"" + repository.html_url + "\" target=\"_blank\" class=\"small dark-gray button\">\n        <span>Source Code &raquo;</span>\n      </a>\n    </small>\n    </h3>\n  <hr/>\n  <p>" + repository.description + "</p>\n</div>";
        return $(html);
      };
      return Project;
    })();
    User = (function() {
      function User() {}
      User.render = function(user) {
        var html;
        html = "<div class=\"team-member\">\n  <a href=\"" + user.url + "\"><img src=\"" + user.avatar_url + "\"></a>\n  <h5>\n    " + user.name + " \n    <a href=\"" + user.url + "\">" + user.login + "</a>\n  </h5>\n</div>";
        return $(html);
      };
      return User;
    })();
    Section = (function() {
      function Section() {}
      Section.render = function(language_name) {
        var html;
        html = " <div>\n   <h3>" + language_name + "</h3>\n   <div class=\"row\">\n     <div class=\"four-and-a-half columns first left\">\n     </div>\n\n     <div class=\"four-and-a-half columns right\">\n     </div>\n   </div>\n</div>";
        return $(html);
      };
      return Section;
    })();
    return exports = {
      Section: Section,
      User: User,
      Project: Project
    };
  })();
  project_html = function(project) {
    return Templates.Project.render(project);
  };
  bucket_by_lang = function(projects) {
    var buckets, project, _i, _len, _name;
    buckets = {};
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      buckets[_name = project.language] || (buckets[_name] = []);
      buckets[project.language].push(project);
    }
    return buckets;
  };
  write_projects_to_dom = function(projects) {
    var all_projects, buckets, col, i, lang, left, num_projects, project, right, section, _ref;
    num_projects = projects.length;
    buckets = bucket_by_lang(projects);
    all_projects = $("<div>");
    for (lang in buckets) {
      projects = buckets[lang];
      if (lang === "null") {
        lang = "Misc.";
      }
      section = Templates.Section.render(lang);
      left = section.find('div.left');
      right = section.find('div.right');
      for (i = 0, _ref = projects.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        project = projects[i];
        col = i % 2 === 0 ? right : left;
        if (project != null) {
          col.append(project_html(project));
        }
      }
      all_projects.append(section);
    }
    $("#projects").append(all_projects);
    return $("#projects-title").html("Projects (" + num_projects + ")");
  };
  write_team_to_dom = function(members) {
    var member, team, _i, _len;
    team = $("<div>");
    for (_i = 0, _len = members.length; _i < _len; _i++) {
      member = members[_i];
      team.append(Templates.User.render(member));
    }
    return $("#team").append(team.html());
  };
  init = function() {
    var api;
    api = Github.API;
    return api.get_members("bizo", function(members) {
      var member, projects, requests, _i, _len, _results;
      requests = members.length;
      projects = [];
      write_team_to_dom(members);
      _results = [];
      for (_i = 0, _len = members.length; _i < _len; _i++) {
        member = members[_i];
        _results.push(api.get_repos(member.login, function(repos) {
          var user_repo, _j, _len2;
          requests -= 1;
          for (_j = 0, _len2 = repos.length; _j < _len2; _j++) {
            user_repo = repos[_j];
            if (user_repo != null) {
              projects.push(user_repo);
            }
          }
          if (requests === 0) {
            return write_projects_to_dom(projects);
          }
        }));
      }
      return _results;
    });
  };
  $(document).ready(init);
}).call(this);
