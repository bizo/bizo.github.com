Building the Project
---------------------

Prereqs
============

- coffeescript (compiler) 
- sass (gem)


Editing
============

- index.html contains the basic page structure
- stylesheet.css self explanitory
- coffeescript/main/page.coffee contains all the coffeescript code to draw users + repos on the page

Building/Compiling
============

    # Coffeescript
    ./build.sh

    # Saas
    sass -w src/sass:compiled/css




