Red-Social-Asociacion
==========
[![Build Status](https://img.shields.io/travis/MecatronicaUncu/Red-Social-Asociacion/develop.svg)](https://travis-ci.org/MecatronicaUncu/Red-Social-Asociacion)

## Objective

To implement a small open source social network for any small community.

## Install and Run in Linux

### Using Docker (preferred)

This is the simplest way to run the project. Only Docker is needed
as a dependency.

Pull and run a complete image from Docker Hub.
```
docker pull mecatronicauncu/red-social-asociacion-dev
docker run -p 3000:3000 -t -i mecatronicauncu/red-social-asociacion-dev
```

You can access to the website using your preferred browser
```
https://localhost:3000/
```

Alternatively, build your own Docker image using the Dockerfile
provided in this repository.
```
curl https://raw.githubusercontent.com/mecatronicauncu/Red-Social-Asociacion/develop/Dockerfile > Dockerfile
docker build -t red-social-asociacion-dev .
docker run -p 3000:3000 -t -i red-social-asociacion-dev
```

### Native install

This method is a little bit more complicated and requires the following
dependencies.

- git
- nodejs (version >= 8.3)
- npm (version > 3.5)
- ruby and ruby-dev (version > 2.3)
- curl
- A running jre (we have tested openjdk 8)
- lsof

If you don't have nodejs installed, use Node Version Manager
([nvm](https://github.com/creationix/nvm)). In the same way,
install Ruby using Ruby Version Manager ([rvm](https://rvm.io/rvm/install)).
Please be sure to source the appropriate files in your `.bashrc` or `.zshrc`.

#### Installing the server

Clone the repository and execute the install script.
```
git clone https://github.com/MecatronicaUncu/Red-Social-Asociacion.git
cd Red-Social-Asociacion
./script/bootstrap
```

Afterwards, configure the server.
```
./script/config
```

**Note**: `config` script accepts the following parameters:

1. password
2. HOST_TYPE. One of these:
  1. LAN: If you are going to use the local network.
  2. NET: If the service will be exposed to the internet, in SITE.
3. SITE: The website where the sevice will be running. Only required if
   `NET` host is selected.

#### Running the server

1. Start the database server [neo4j](http://neo4j.org/)

    ```
    ./script/Neo4j/neoStart
    ```
2. Run the server

    ```
    grunt build
    grunt express
    ```

The Social Network will be available at  port 3000: `HOST:3000`

## Install and Run in Windows/OS X

The installation using Docker should work out of the box. Please refer
to [Install and Run in Linux](#using-docker-preferred).

## Develop

### Using Docker

**Note**: It is a good idea to have a quick look to the [Docker User
Guide](https://docs.docker.com/engine/userguide/intro/) to understand
how Docker works.

Run a shell in a container using the following command
```
docker run -p 3000:3000 -t -i mecatronicauncu/red-social-asociacion-dev /bin/bash
```
Then, run the server using the commands from the section
[Running the server](#running-the-server).
`grunt watch` may be used instead of `grunt express` to trigger
automatic builds when files are modified.

Multiple shells may be executed in the same container.
```
docker exec -i -t CONTAINER_ID /bin/bash
```
Docker dev images have `sudo` access enabled. Hence, you are able to install
your favorite software for development.

If you want to interact with Github (`push/fetch/pull`), change the
repository remote address (to use SSH instead of HTTP), and set up your
SSH keys.

#### Copy SSH keys from Host to Container

Copy your SSH keys from the Docker Host to a running container
with the following command
```
docker cp /path/to/.ssh CONTAINER_ID:/red-social-asoc/.ssh
```

Remember to fix `.ssh` folder permissions inside the running container
```
(inside container)$ sudo chown -R swuser:swuser ~/.ssh/
```
#### Generate new SSH keys

The [GitHub Tutorial for SSH keys](https://help.github.com/articles/generating-an-ssh-key/)
is a good resource for SSH keys.

## Files

We follow the approach of [ngbp](https://github.com/ngbp/ngbp).

Most important:

```
|-- server

    |-- server.js           Server (expressjs) configuration

    |-- routes

        |-- moduleName.js   High level API calls

        |-- _moduleName.js  Database access functions for module

        |-- upload          Uploaded files (such as profile images) *

    |-- bin                 Binary files (neo4j).
                            Available after running ```./setup.sh```.

|-- src                     Front-end stuff

    |-- app                 State templates, sass and javascript (views)

        |-- app.js          Angular app main module

    |-- assets              Static content. Fonts, Styles, etc

    |-- common              Directives

    |-- sass                Sass main file and co.

```

## Test Datasets

You may register fictitious users in the database, for test purposes.

For instance, `script/Datasets/userBase/userBase` will register 50 users
in your database and add some relationships. After running it, you can
check the user list with their login info inside
`people_email_pass.csv`.

To clean your database, execute the following query in the Neo4J browser: ```MATCH (u)-[r]-() DELETE r,u```.

**Note**: The list of users IDs (saved in ```usersIDs.csv```) is not deterministic. Running the script twice will result in relationships not intended to be created. This will not have adverse effects, but it must be taken into consideration.

**Note**: `userBase` accepts one parameter: `no-wait`. This will assume your Neo4J server is running and continue the process without asking.

## Contribute

Do not hesitate to submit your issue or pull request!
