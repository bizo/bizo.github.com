Building the Project
---------------------

Prereqs
============

- Ruby + Rubygems
- Bundler (gem install bundler)
- bundle install


Editing
============

- index.html contains the basic page structure
- stylesheet.css self explanitory
- coffeescript/main/page.coffee contains all the coffeescript code to draw users + repos on the page

Building/Compiling
============

    # Compile once
    bundle exec dependence coffeescript -o compiled/javascripts -b

    # Compile continuously while you edit files
    bundle exec dependence coffeescript -o compiled/javascripts -b -w





