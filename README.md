# jQuery Tools builder

## Minify a jquerytools checkout

    ./bin/minify path_to_checkout

This will create a folder called minified which will contain minified
versions of all the files below the 'src' folder, for each tag and HEAD.

## Run the server

Requires the above step to be complete.

    ./bin/server

## Run the tests

1. Install [nodeunit](https://github.com/caolan/nodeunit)
2. do: 'nodeunit test'
