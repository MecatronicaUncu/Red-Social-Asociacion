#!/bin/bash

DEPS="npm
gem"

NEO4J_VER=2.2.5
MONGODB_VER=3.0.6

BIN_DIR=bin

#----------------------------------------#

echo -e "\n**Setup script for Red-Social-Asociacion**\n
Please note that the following dependencies are needed before
runing this script:
 * nodejs
 * ruby\n"

#----------------------------------------#
# Check dependencies

for deps in $DEPS
do
  command -v $deps >/dev/null 2>&1 || { echo >&2 "$deps not installed!"; exit 1; }
done

#----------------------------------------#
# Cleanup bin directory
rm -rf $BIN_DIR
mkdir $BIN_DIR

#----------------------------------------#
# Create download dir
TMP_DOWNLOAD_DIR=tmp_download_dir
mkdir -p $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Install yo and neo4j
for nprog in "yo" "neo4j"
do
  npm install -g $nprog || { echo 'npm $nprog failed' ; exit 1; }
done

#----------------------------------------#
# Configure neo4j

# wait for file in download dir
while :
do
	echo -e "\nPlease download neo4j-community-$NEO4J_VER-unix.tar.gz and copy it to
  $TMP_DOWNLOAD_DIR"
  read -p "Then press [Enter]"
  if [ -f $TMP_DOWNLOAD_DIR/neo4j-community-$NEO4J_VER-unix.tar.gz ];
  then
    # file found, break loop and go on with script
    break
  else
    echo -e "\nFile does not exist!\n"
    continue
  fi
done

# untar and move
cd $TMP_DOWNLOAD_DIR
tar -zxvf neo4j-community-$NEO4J_VER-unix.tar.gz
cd ..

mv $TMP_DOWNLOAD_DIR/neo4j-community-$NEO4J_VER $BIN_DIR

NEO4J_DIR=$BIN_DIR/neo4j-community-$NEO4J_VER

# copy config files
cp -R defaults/neo4j-community-2.1.5/* $NEO4J_DIR

#----------------------------------------#
# Install Sass and Compass
for rprog in "sass" "compass"
do
  gem install $rprog || { echo 'gem $rprog failed' ; exit 1; }
done

#----------------------------------------#
# Install and configure MongoDB
cd $TMP_DOWNLOAD_DIR
curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-$MONGODB_VER.tgz
#curl -O http://localhost:8000/Volatile/mongodb-linux-x86_64-$MONGODB_VER.tgz
tar -zxvf mongodb-linux-x86_64-$MONGODB_VER.tgz
cd ..
mkdir -p $BIN_DIR/mongodb
cp -R -n $TMP_DOWNLOAD_DIR/mongodb-linux-x86_64-$MONGODB_VER/ $BIN_DIR/mongodb
mkdir -p mongodata/db
#----------------------------------------#

#----------------------------------------#
# Get npm and bower dependencies
npm install .
bower install .

#----------------------------------------#
# remove temp download dir
#rm -rf $TMP_DOWNLOAD_DIR

#----------------------------------------#
# Create service start and shutdown scripts

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j start -server -Xmx512M -XX:+UseConcMarkSweepGC" > neoRun
chmod +x neoRun

echo "#!/bin/bash
./bin/neo4j-community-$NEO4J_VER/bin/neo4j stop" > neoStop
chmod +x neoStop

echo "#!/bin/bash
mongod --dbpath ./mongodata/db/" > mongoRun
chmod +x mongoRun

echo "#!/bin/bash
mongod --shutdown --dbpath mongodata/db" > mongoStop
chmod +x mongoStop
