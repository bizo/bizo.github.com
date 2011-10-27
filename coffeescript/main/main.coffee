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
              <a href="#{repository.html_url}" target="_blank" class="small dark-gray button">
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


bucket_by_lang = (projects) ->
  buckets = {}

  for project in projects
    buckets[project.language] ||= []
    buckets[project.language].push(project)

  buckets


write_projects_to_dom = (projects) ->
  num_projects = projects.length
  buckets = bucket_by_lang(projects)
  all_projects = $("<div>")

  for lang, projects of buckets
    lang = "Misc." if lang == "null" 
    section = Templates.Section.render(lang)
    left  = section.find('div.left')
    right = section.find('div.right')

    for i in [0..projects.length]
      project = projects[i]
      col = if i %2 == 0 then right else left
      col.append project_html(project) if project?

    all_projects.append(section)

  $("#projects").append(all_projects)
  $("#projects-title").html("Projects (#{num_projects})")


write_team_to_dom = (members) ->
  team = $("<div>")
  for member in members
    team.append Templates.User.render(member)


  $("#team").append(team.html())



init = ->
  api = Github.API

  api.get_watched "bizo", (repos) ->
    write_projects_to_dom(repos)

  api.get_members "bizo", (members) ->
     write_team_to_dom(members)

$(document).ready(init)
  
