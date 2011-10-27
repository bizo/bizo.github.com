#! /bin/bash

echo "Compiling coffeescript to compiled/javascripts"
coffee -b -c -o compiled/javascripts/ coffeescript/main/main.coffee
echo "Done"
