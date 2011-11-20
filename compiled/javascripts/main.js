var Templates, find_project_section, init, project_html, sort_project_member, sort_project_name, string_sort, write_projects_to_dom, write_team_to_dom;

Templates = (function() {
  var Project, Section, User, exports;
  Project = (function() {

    function Project() {}

    Project.render = function(repository) {
      var html, url;
      url = repository.homepage || repository.html_url;
      html = "<div class=\"project\">\n  <a href=\"" + url + "\">\n    <h4>\n      " + repository.name + "\n    </h4>\n    <p>" + (repository.description.substring(0, Math.min(repository.description.length, 80))) + "</p>\n  </a>\n</div>";
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
      html = " <div>\n   <h3>" + language_name + "</h3>\n   <div class=\"row\">\n     <div class=\"three columns first col-one\">\n     </div>\n\n     <div class=\"three columns col-two\">\n     </div>\n\n     <div class=\"three columns col-three\">\n     </div>\n   </div>\n   </div>\n</div>";
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

string_sort = function(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  if (s1 === s2) return 0;
  if (s1 > s2) {
    return 1;
  } else {
    return -1;
  }
};

sort_project_name = function(p1, p2) {
  return string_sort(p1.name, p2.name);
};

sort_project_member = function(p1, p2) {
  return string_sort(p1.login, p2.login);
};

write_projects_to_dom = function(buckets) {
  var all_projects, col, columns, i, num_columns, project, projects, s, section, sections, _i, _len, _ref;
  all_projects = $("<div>");
  sections = (function() {
    var _results;
    _results = [];
    for (section in buckets) {
      project = buckets[section];
      _results.push(section);
    }
    return _results;
  })();
  sections.sort();
  for (_i = 0, _len = sections.length; _i < _len; _i++) {
    s = sections[_i];
    projects = buckets[s];
    projects.sort(sort_project_name);
    section = Templates.Section.render(s);
    columns = [section.find('div.col-one'), section.find('div.col-two'), section.find('div.col-three')];
    num_columns = columns.length;
    for (i = 0, _ref = projects.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      project = projects[i];
      col = columns[i % num_columns];
      if (project != null) col.append(project_html(project));
    }
    all_projects.append(section);
  }
  return $("#projects").append(all_projects);
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
