# jQuery Tools builder

## Setup

Be sure to fetch all the dependencies:

    git submodule init
    git submodule update

Then run the init script in the bin directory to create a clone of the
jquerytools repository.

## Scripts

There are a few scripts in the bin directory:

### init

Creates a clone of the jquerytools repository on github, and sets up a tracking
branch for 1.3.0. 

### minify

Minifies the tags and local branches available on the jquerytools repository
created by the init script. You should not need to run this directly as it is
automatically run by the update script.

### update

Does a git pull on the master and 1.3.0 branches, then runs the minify script.
This script is automatically run when the github post-receive-hook fires.

## API

### GET /

Lists the available tags and branches for creating builds

### GET /:version/jquery.tools.min.js

Creates a new jquery tools build.

__Parameters__

* __t__ - Can be used multiple times to include specific files under the src
  directory of the jquery tools repository. Example:

      /v1.2.5/jquery.tools.min.js?t=tooltip%2Ftooltip.js&t=dateinput%2Fdateinput.js

* __build__ - Creates a pre-defined build, see the builds section for more details.
  Example:

      /HEAD/jquery.tools.min.js?build=full

### POST /post_receive

The URL to use for github post-receive-hooks. Runs the update script.

## Builds

There are a number of pre-defined builds available:

* tiny - UI tools, no jQuery
* form - Form tools, no jQuery
* all -  All tools, no jQuery
* default -  UI tools with jQuery
* full - All tools with jquery
