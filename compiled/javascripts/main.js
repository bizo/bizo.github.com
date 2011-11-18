var Github, Templates, find_project_section, init, project_html, sort_project_member, sort_project_name, string_sort, write_projects_to_dom, write_team_to_dom;

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

    API.get_watched = function(user, callback) {
      return this.get("/users/" + user + "/watched", function(response) {
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
      html = "<div class=\"project\">\n  <h3>\n    " + repository.name + "\n    <small>";
      if (repository.homepage !== "") {
        html += "<a href=\"" + repository.homepage + "\" target=\"_blank\" style=\"margin-left: 10px;\" class=\"small green button\">\n  <span>Docs &raquo;</span>\n</a>";
      }
      html += "      <a href=\"" + repository.html_url + "\" target=\"_blank\" class=\"small blue button\">\n        <span>Source Code &raquo;</span>\n      </a>\n    </small>\n    </h3>\n  <hr/>\n  <p>" + repository.description + "</p>\n</div>";
      return $(html);
    };

    return Project;

  })();
  User = (function() {

    function User() {}

    User.render = function(user) {
      var html, url;
      url = "http://github.com/" + user.login;
      html = "<div class=\"team-member\">\n  <a href=\"" + url + "\"><img src=\"" + user.avatar_url + "\"></a>\n  <h5>\n    <a href=\"" + url + "\">" + user.login + "</a>\n  </h5>\n</div>";
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

find_project_section = function(project) {
  var section, url, urls, _i, _len;
  for (section in bizo_projects) {
    urls = bizo_projects[section];
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      if (project.html_url === url) return section;
    }
  }
  return null;
};

string_sort = function(_s1, _s2) {
  var s1, s2;
  s1 = _s1.toLowerCase();
  s2 = _s2.toLowerCase();
  if (s1 < s2) {
    return -1;
  } else if (s1 > s2) {
    return 1;
  } else {
    return 0;
  }
};

sort_project_name = function(p1, p2) {
  return string_sort(p1.name, p2.name);
};

sort_project_member = function(p1, p2) {
  return string_sort(p1.login, p2.login);
};

write_projects_to_dom = function(buckets) {
  var all_projects, col, i, left, num_projects, project, projects, right, s, section, sections, _i, _len, _ref;
  num_projects = 0;
  all_projects = $("<div>");
  sections = [];
  for (section in buckets) {
    project = buckets[section];
    sections.push(section);
  }
  sections.sort();
  for (_i = 0, _len = sections.length; _i < _len; _i++) {
    s = sections[_i];
    projects = buckets[s];
    projects.sort(sort_project_name);
    section = Templates.Section.render(s);
    left = section.find('div.left');
    right = section.find('div.right');
    num_projects += projects.length;
    for (i = 0, _ref = projects.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      project = projects[i];
      col = i % 2 === 0 ? left : right;
      if (project != null) col.append(project_html(project));
    }
    all_projects.append(section);
  }
  $("#projects").append(all_projects);
  return $("#projects-title").html("Projects (" + num_projects + ")");
};

write_team_to_dom = function(members) {
  var member, projects, requests, team, _i, _len;
  team = $("<div>");
  projects = {};
  requests = members.length;
  members.sort(sort_project_member);
  for (_i = 0, _len = members.length; _i < _len; _i++) {
    member = members[_i];
    team.append(Templates.User.render(member));
    Github.API.get_repos(member.login, function(repos) {
      var repo, section, _j, _len2;
      requests -= 1;
      for (_j = 0, _len2 = repos.length; _j < _len2; _j++) {
        repo = repos[_j];
        section = find_project_section(repo);
        if (section != null) {
          projects[section] || (projects[section] = []);
          projects[section].push(repo);
        }
      }
      if (requests === 0) return write_projects_to_dom(projects);
    });
  }
  return $("#team").append(team.html());
};

init = function() {
  var api;
  api = Github.API;
  return api.get_members("bizo", function(members) {
    return write_team_to_dom(members);
  });
};

$(document).ready(init);
