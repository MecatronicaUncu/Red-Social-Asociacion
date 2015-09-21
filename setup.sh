#!/bin/bash

DEPS="npm
gem
git"

NODEJS_VER=0.10
NEO4J_VER=2.2.5
MONGODB_VER=3.0.6
NEO4J_FILE=neo4j-community-$NEO4J_VER-unix.tar.gz
MONGO_FILE=mongodb-linux-x86_64-$MONGODB_VER.tgz
LOG_FILE=setup.log

BIN_DIR=bin
NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER

CONS_DIV="#####################################"
R_COL="\e[31m"
G_COL="\e[92m"
DEF_COL="\e[39m"

function loggerGreen {
	echo -e $G_COL$1$DEF_COL
	echo -e $1 >> $LOG_FILE
}

function loggerRed {
	echo -e >&2 $R_COL$1$DEF_COL
	echo -e $1 >> $LOG_FILE
}

#----------------------------------------#

echo -e $G_COL$CONS_DIV"\n\n **Setup script for Red-Social-Asociacion**\n
Please note that the following dependencies are needed before
runing this script:
 * nodejs v0.10
 * ruby\n
Find instructions in https://github.com/MecatronicaUncu/Red-Social-Asociacion\n\n"$CONS_DIV$DEF_COL

#----------------------------------------#
# Check dependencies

loggerGreen "Checking dependencies...\n"
for deps in $DEPS
do
  command -v $deps >/dev/null 2>&1 || { loggerRed "$deps not installed!"; exit 1; }
done
loggerGreen "Dependencies OK!\n"

#----------------------------------------#
# Cleanup bin directory
loggerGreen "Cleaning bin directory...\n"
rm -rf $BIN_DIR
mkdir $BIN_DIR

#----------------------------------------#
# Create download dir
loggerGreen "Creating tmp dir...\n"
TMP_DOWNLOAD_DIR=tmp_download_dir
mkdir -p $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Check if bower is installed. Install if needed.
if command -v bower >/dev/null 2>&1; then
   loggerGreen "bower installed, skipping...\n";
else
  loggerGreen "Installing bower with npm (globally)...\n";
  npm install -g bower >> $LOG_FILE 2>&1 || { loggerRed "npm bower failed!. See setup.log for details"; exit 1; }
fi

#----------------------------------------#
# Install node-neo4j library
loggerGreen "Installing node-neo4j library...\n"
npm install neo4j >> $LOG_FILE 2>&1 || { loggerRed "npm neo4j failed!. See setup.log for details"; exit 1; }

#----------------------------------------#
# Download Neo4J
loggerGreen "Installing Neo4J Engine...\n"
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $NEO4J_FILE ]] || [[ ! -f $NEO4J_FILE ]]
then
    wget -a $LOG_FILE -q http://dist.neo4j.org/neo4j-community-$NEO4J_VER-unix.tar.gz
fi

# untar and move
tar -zxvf neo4j-community-$NEO4J_VER-unix.tar.gz >> $LOG_FILE 2>&1
cd ..

mv $TMP_DOWNLOAD_DIR/neo4j-community-$NEO4J_VER $BIN_DIR

# copy config files
#cp -R default/neo4j-community-2.1.5/* $NEO4J_DIR

#----------------------------------------#
# Install Sass and Compass
loggerGreen "Installing Sass and Compass...\n"
for rprog in "sass" "compass"
do
  gem install $rprog >> $LOG_FILE 2>&1 || { loggerRed 'gem $rprog failed'; exit 1; }
done

#----------------------------------------#
# Install and configure MongoDB
loggerGreen "Installing MongoDB...\n"
cd $TMP_DOWNLOAD_DIR
if [[ ! -e $MONGO_FILE ]] || [[ ! -f $MONGO_FILE ]]
then
    curl -O -s https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGODB_VER.tgz >> $LOG_FILE
fi
#curl -O http://localhost:8000/Volatile/mongodb-linux-x86_64-$MONGODB_VER.tgz
tar -zxvf $MONGO_FILE >> $LOG_FILE 2>&1
cd ..
mkdir -p $BIN_DIR/mongodb
cp -R -n $TMP_DOWNLOAD_DIR/mongodb-linux-x86_64-$MONGODB_VER/ $BIN_DIR/mongodb
mkdir -p mongodata/db

# Get npm and bower dependencies
loggerGreen "Installing Npm and Bower dependencies...\n"
npm install . >> $LOG_FILE 2>&1
bower install -F >> $LOG_FILE 2>&1

# Install grunt-cli
loggerGreen "Installing grunt-cli...\n"
npm install -g grunt-cli >> $LOG_FILE 2>&1

#----------------------------------------#
# Create service start and shutdown scripts
loggerGreen "Installing service start and shutdown scripts...\n"

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
loggerGreen "Install Ok!\n"
