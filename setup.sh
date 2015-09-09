#!/bin/bash

DEPS="npm
gem"

NODEJS_VER=0.10
NEO4J_VER=2.2.5
MONGODB_VER=3.0.6
NEO4J_FILE=neo4j-community-$NEO4J_VER-unix.tar.gz
MONGO_FILE=mongodb-linux-x86_64-$MONGODB_VER.tgz

BIN_DIR=bin
NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER

CONS_DIV="#####################################"
R_COL="\e[31m"
G_COL="\e[92m"
DEF_COL="\e[39m"

#----------------------------------------#

echo -e $G_COL$CONS_DIV"\n\n **Setup script for Red-Social-Asociacion**\n
Please note that the following dependencies are needed before
runing this script:
 * nodejs v0.10
 * ruby\n
Find instructions in https://github.com/MecatronicaUncu/Red-Social-Asociacion\n\n"$CONS_DIV$DEF_COL

#----------------------------------------#
# Check dependencies
echo -e $G_COL"Checking dependencies...\n"$DEF_COL
for deps in $DEPS
do
  command -v $deps >/dev/null 2>&1 || { echo -e >&2 $R_COL"$deps not installed!"$DEF_COL; exit 1; }
done
echo -e $G_COL"Dependencies OK!\n"$DEF_COL

#----------------------------------------#
# Cleanup bin directory
echo -e $G_COL"Cleaning bin directory...\n"$DEF_COL
rm -rf $BIN_DIR
mkdir $BIN_DIR

#----------------------------------------#
# Create download dir
echo -e $G_COL"Creating tmp dir...\n"$DEF_COL
TMP_DOWNLOAD_DIR=tmp_download_dir
mkdir -p $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Install yo, bower and neo4j
echo -e $G_COL"Installing nodejs packages globally (Yeoman, Neo4j and Bower)\n"$DEF_COL
for nprog in "yo" "neo4j" "bower"
do
  npm install -g $nprog >> setup.log 2>&1 || { echo -e >&2 $R_COL"npm $nprog failed!. See setup.log for details"$DEF_COL; exit 1; }
done

#----------------------------------------#
# Download Neo4J
echo -e $G_COL"Installing Neo4J Engine...\n"$DEF_COL
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $NEO4J_FILE ]] || [[ ! -f $NEO4J_FILE ]]
then
    wget -a setup.log -q http://dist.neo4j.org/neo4j-community-$NEO4J_VER-unix.tar.gz
fi

# untar and move
tar -zxvf neo4j-community-$NEO4J_VER-unix.tar.gz >> setup.log 2>&1
cd ..

mv $TMP_DOWNLOAD_DIR/neo4j-community-$NEO4J_VER $BIN_DIR

# copy config files
#cp -R default/neo4j-community-2.1.5/* $NEO4J_DIR

#----------------------------------------#
# Install Sass and Compass
echo -e $G_COL"Installing Sass and Compass...\n"$DEF_COL
for rprog in "sass" "compass"
do
  gem install $rprog >> setup.log 2>&1 || { echo -e $R_COL'gem $rprog failed'$DEF_COL ; exit 1; }
done

#----------------------------------------#
# Install and configure MongoDB
echo -e $G_COL"Installing MongoDB...\n"$DEF_COL
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $MONGO_FILE ]] || [[ ! -f $MONGO_FILE ]]
then
    curl -O -s setup.log https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGODB_VER.tgz >> setup.log
fi
#curl -O http://localhost:8000/Volatile/mongodb-linux-x86_64-$MONGODB_VER.tgz
tar -zxvf $MONGO_FILE >> setup.log 2>&1
cd ..
mkdir -p $BIN_DIR/mongodb
cp -R -n $TMP_DOWNLOAD_DIR/mongodb-linux-x86_64-$MONGODB_VER/ $BIN_DIR/mongodb
mkdir -p mongodata/db

# Get npm and bower dependencies
echo -e $G_COL"Installing Npm and Bower dependencies...\n"$DEF_COL
npm install . >> setup.log 2>&1
bower install >> setup.log 2>&1

#----------------------------------------#
# Create service start and shutdown scripts
echo -e $G_COL"Installing service start and shutdown scripts...\n"$DEF_COL

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j start -server -Xmx512M -XX:+UseConcMarkSweepGC" > neoRun
chmod +x neoRun

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j stop" > neoStop
chmod +x neoStop

echo "#!/bin/bash
./bin/mongodb/mongodb-linux-x86_64-$MONGODB_VER/bin/mongod --dbpath ./mongodata/db/" > mongoRun
chmod +x mongoRun

echo "#!/bin/bash
./bin/mongodb/mongodb-linux-x86_64-$MONGODB_VER/bin/mongod --shutdown --dbpath mongodata/db" > mongoStop
chmod +x mongoStop

#-----------------------------------------#
# Done!
echo -e $G_COL"Install Ok!\n"$DEF_COL
