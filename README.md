Red-Social-Asociacion
==========

## Objective

To implement a small open source social network for any small community.


## Linux install guide

1. Install dependencies: nodejs 0.10, ruby and git.
  1. Install Node Version Manager ([nvm](https://github.com/creationix/nvm))
  2. `nvm install 0.10`
  3. Install Ruby Version Manager with Ruby stable ([rvm](https://rvm.io/rvm/install)).
  4. Install git
  5. Reset
  6. `nvm use 0.10`.  You may need to add `.rvm/rubies/default/bin/` to PATH.
3. Clone repository
4. Execute `./setup.sh`. It will take some time, you may have a coffee.
5. Execute `./config.sh`. It will guide you through the configuration of
   the server. Follow the steps.

## Windows install guide

Get Linux.

## Run

1. Start [neo4j](http://neo4j.org/): `./neoRun`
2. Start [MongoDB](http://www.mongodb.org/): `./mongoRun`
3. Start server: `grunt serve`

## Files
```
|-- server.js           Server (expressjs) configuration 

|-- bin                 Binary files (neo4j and MongoDB). 
                        Available after running ```./setup.sh```.

|-- app                 Front-end stuff

    |-- views           Front-end html

    |-- scripts         Front-end js files

    |-- sass            Sass files which generate css

|-- routes

    |-- user.js         Database (neo4j) query functions 

    |-- users.js        Cookies, access restrictions, 
                        connection between neo4j and expressjs.

    |-- upload          Uploaded files (such as profile images) *
```

## Test Dataset

You will find in the folder ```testDataset``` a script that will register 50 users in your database and add some relationships.
After running it, you can check the user list with their login info inside ```people_email_pass.csv```. Just run ```testDataset.sh```. Be sure your Neo4J server is running.

**Note**: The list of users IDs (saved in ```usersIDs.csv```) is not deterministic. Running ```testDataset.sh``` twice will result in relationships not intended to be created. This will not have adverse effects, but is to be taken into consideration.

If you want to clean your database before running this script, execute the following query in the Neo4J browser: ```MATCH (u)-[r]-() DELETE r,u```.

## Contribute

There is a list of tasks in ```TODO.md```.

Don't hesitate to submit your pull request!
