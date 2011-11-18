Github = (->
  exports = {}

  class API 
    @base_url: "https://api.github.com"

    @get: (path, callback) ->
      $.getJSON "#{@base_url}#{path}?callback=?", (response) ->
        callback(response)

    @get_members: (org, callback) ->
      @get("/orgs/#{org}/public_members", (response) ->
        callback(response.data)
      )

    
    @get_repos: (user, callback) ->
      @get("/users/#{user}/repos", (response) ->
        callback(response.data)
      )

    @get_watched: (user, callback) ->
      @get("/users/#{user}/watched", (response) ->
        callback(response.data)
      )


  exports.API = API
  exports
)()


Templates = (->

  class Project
    @render: (repository) ->
      html = """
        <div class="project">
          <h3>
            #{repository.name}
            <small>
      """
      if repository.homepage != ""
        html += """
              <a href="#{repository.homepage}" target="_blank" style="margin-left: 10px;" class="small green button">
                <span>Docs &raquo;</span>
              </a>
        """

      html += """
              <a href="#{repository.html_url}" target="_blank" class="small blue button">
                <span>Source Code &raquo;</span>
              </a>
            </small>
            </h3>
          <hr/>
          <p>#{repository.description}</p>
        </div>
      """
      $(html)

  
  class User
    @render: (user) ->
      url = "http://github.com/#{user.login}"
      html = """
       <div class="team-member">
         <a href="#{url}"><img src="#{user.avatar_url}"></a>
         <h5>
           <a href="#{url}">#{user.login}</a>
         </h5>
       </div>
      """
      $(html)

  class Section
    @render: (language_name) ->
      html = """
      <div>
        <h3>#{language_name}</h3>
        <div class="row">
          <div class="four-and-a-half columns first left">
          </div>

          <div class="four-and-a-half columns right">
          </div>
        </div>
     </div>
      """
      $(html)

  exports =
    Section : Section
    User    : User
    Project : Project
)()


project_html = (project) ->
  Templates.Project.render(project)


find_project_section = (project) ->
  for section, urls of bizo_projects
    for url in urls
        if (project.html_url == url)
          return section
  return null


string_sort = (_s1, _s2)   ->
  s1 = _s1.toLowerCase()
  s2 = _s2.toLowerCase()
  
  if (s1 < s2)
    -1
  else if (s1 > s2)
    1
  else
    0
    
sort_project_name = (p1, p2) ->
  string_sort(p1.name, p2.name)

sort_project_member = (p1, p2) ->
  string_sort(p1.login, p2.login)
  

write_projects_to_dom = (buckets) ->
  num_projects = 0

  all_projects = $("<div>")
  
  sections = [];
  for section, project of buckets
    sections.push(section);
  
  sections.sort()

  for s in sections
    projects = buckets[s]
    projects.sort(sort_project_name)
    section = Templates.Section.render(s)
    left  = section.find('div.left')
    right = section.find('div.right')
    num_projects += projects.length

    for i in [0..projects.length]
      project = projects[i]
      col = if i %2 == 0 then left else right
      col.append project_html(project) if project?

    all_projects.append(section)

  $("#projects").append(all_projects)
  $("#projects-title").html("Projects (#{num_projects})")


write_team_to_dom = (members) ->
  team = $("<div>")
  projects = {}
  requests = members.length
  members.sort(sort_project_member)

  for member in members
    team.append Templates.User.render(member)

    Github.API.get_repos member.login, (repos) ->
      requests -= 1
      for repo in repos
        section = find_project_section(repo)
        if section?
          projects[section] ||= []
          projects[section].push(repo)

      if requests == 0
        write_projects_to_dom(projects)
    
  $("#team").append(team.html())



init = ->
  api = Github.API

  api.get_members "bizo", (members) ->
     write_team_to_dom(members)

$(document).ready(init)
  
