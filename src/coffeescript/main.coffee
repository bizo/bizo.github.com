Templates = (->

  class Project
    @render: (repository) ->
      url = repository.homepage || repository.html_url

      html = """
        <div class="project">
          <a href="#{url}">
            <h4>
              #{repository.name}
            </h4>
            <p>#{repository.description.substring(0, Math.min(repository.description.length, 80))}</p>
          </a>
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
          <div class="three columns first col-one">
          </div>

          <div class="three columns col-two">
          </div>

          <div class="three columns col-three">
          </div>
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
        return section if project.html_url == url
  null


string_sort = (s1, s2)   ->
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()
  return 0 if s1 == s2
  if s1 > s2 then 1 else -1

sort_project_name = (p1, p2) ->
  string_sort(p1.name, p2.name)

sort_project_member = (p1, p2) ->
  string_sort(p1.login, p2.login)

write_projects_to_dom = (buckets) ->
  all_projects = $("<div>")
  sections = (section for section, project of buckets)
  sections.sort()

  for s in sections
    projects = buckets[s]
    projects.sort(sort_project_name)
    section = Templates.Section.render(s)
    
    columns = [
      section.find('div.col-one'),
      section.find('div.col-two'),
      section.find('div.col-three')
    ]

    num_columns = columns.length

    for i in [0..projects.length]
      project = projects[i]
      col = columns[i%num_columns]
      col.append project_html(project) if project?

    all_projects.append(section)

  $("#projects").append(all_projects)


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
  
