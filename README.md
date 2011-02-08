# jQuery Tools builder


## Setup

Be sure to fetch all the dependencies:

    git submodule init
    git submodule update

Then run the init script in the bin directory to create a clone of the
jquerytools repository.

__Note:__ Problems were reported when running the init script with git v1.6.x,
upgrading to 1.7.1 fixed this.


## Scripts

There are a few scripts in the bin directory:

### init

Creates a clone of the jquerytools repository on github, and sets up a tracking
branch for 1.3.0. After a new clone is created, it runs the update script.

### minify

Minifies the tags and local branches available on the jquerytools repository
created by the init script. You should not need to run this directly as it is
automatically run by the update script.

### update

Does a git pull on the master and 1.3.0 branches, then runs the minify script.
This script is automatically run when the github post-receive-hook fires.

### server

Starts the build server. Accepts an optional port (-p) argument:

    $ ./bin/server -p 8081
    Running at http://127.0.0.1:8081/


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


## Adding another branch to the build server

If you would like to start creating builds for another branch as well as 1.3.0,
then you'll need to edit the init and update scripts in the bin directory.

The changes should be self-explanatory, just copy the lines related to 1.3.0 and
rename to the branch on github you'd like to track.
