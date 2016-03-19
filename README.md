Red-Social-Asociacion
==========
[![Build Status](https://img.shields.io/travis/MecatronicaUncu/Red-Social-Asociacion/master.svg)](https://travis-ci.org/MecatronicaUncu/Red-Social-Asociacion)

## Objective

To implement a small open source social network for any small community.


## Linux install guide

1. Install dependencies: nodejs 0.10, ruby and git.
  1. Install Node Version Manager ([nvm](https://github.com/creationix/nvm))
  2. `nvm install 0.10`
  3. Install Ruby Version Manager with Ruby stable ([rvm](https://rvm.io/rvm/install)).
  4. Install git
  6. `nvm use 0.10`.  You may need to add `.rvm/rubies/default/bin/` to PATH.
3. Clone repository
4. `cd bootstrap` and execute `./setup`. It will take some time, you may have a coffee.
5. From within `bootstrap/` execute `./config`. It will guide you through the configuration of
   the server. Follow the steps.

**Note**: `config` accepts the following parameters:

1. password
2. HOST_TYPE. One of these:
  1. LOC
  2. LAN
  3. NET
3. SITE

`SITE` is only required if `NET` host is selected. You can use this to automate your scripts (like our `.travis.yml`)

## Windows install guide

Get Linux.

## Run

1. From the `server/bin` directory:
  1. Start [neo4j](http://neo4j.org/): `./neoRun`
2. From the root directory:
  1. `grunt build`
  2. `grunt express`

The Social Network will be available at the host you specified using port 3000: `HOST:3000`

**Note** For the moment and until test files are ready, `grunt build` will fail, forcing the execution of `grunt express` to serve files.

## Files

We follow the approach of [ngbp](https://github.com/ngbp/ngbp). We've adapted the code to meet our requirements.

Most important:

```
|-- server

    |-- server.js       Server (expressjs) configuration 

    |-- routes

        |-- user.js     Database (neo4j) query functions 

        |-- users.js    Cookies, access restrictions, 
                        connection between neo4j and expressjs.
        |-- upload      Uploaded files (such as profile images) *

    |-- bin             Binary files (neo4j and MongoDB). 
                        Available after running ```./setup.sh```.

|-- src                 Front-end stuff

    |-- app             State templates, sass and javascript (views)

    |-- assets          Static content. Fonts, Styles, etc

    |-- common          Directives

    |-- Sass            Sass main file and co.

    |-- app.js          Angular app main module
```

## Test Dataset

You will find in the folder `bootstrap/testDataset` a script that will register 50 users in your database and add some relationships. After running it, you can check the user list with their login info inside `people_email_pass.csv`. Just `cd bootstrap/testDataset && ./testDataset`. Be sure your Neo4J server is running.

If you want to clean your database before running this script, execute the following query in the Neo4J browser: ```MATCH (u)-[r]-() DELETE r,u```.

**Note**: The list of users IDs (saved in ```usersIDs.csv```) is not deterministic. Running the script twice will result in relationships not intended to be created. This will not have adverse effects, but is to be taken into consideration.

**Note**: `testDataset` accepts one parameter: `no-wait`. This will assume your Neo4J server is running and continue the process without asking.

## Contribute

There is a list of tasks in `TODO.md`.

Don't hesitate to submit your pull request!
