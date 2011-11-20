#! /bin/bash

echo "Compiling coffeescript to compiled/javascripts"
coffee -w -b -c -o compiled/javascripts/ src/coffeescript/main.coffee
echo "Done"
